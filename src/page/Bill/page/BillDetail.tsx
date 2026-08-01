import React from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PrintIcon from "@mui/icons-material/Print";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import { useNavigate, useParams } from "react-router-dom";
import HeaderDialog from "../../../component/Molecules/HeaderDialog";
import CardProduct from "../../../component/Organisms/CardProduct";
import CardOrder from "../../../component/Organisms/CardOrder";
import DialogQuestion from "../../../component/Organisms/DialogQuestion";
import Field from "../../../component/Atoms/Field";
import MySpeedDial from "../../../component/Molecules/MySpeedDial";
import { menuList_t } from "../../../component/Molecules/ButtonOption";
import { orderInfo_t } from "../../../API/BillService/type";
import {
  billStatus_e,
  errorCode_e,
  orderSource_e,
  productType_e,
  stockStatus_e,
} from "../../../enum";
import { useAuth } from "../../../hooks/useAuth";
import { ErrorString } from "../../../function/Enum";
import billWithRetry_f from "../lib/billWithRetry";
import {
  redirectToLoginOnAuthError,
  redirectToLoginOnThrownAuthError,
  redirectToLogin,
} from "../../../lib/authRedirect";
import {
  getAdminStorefrontOrder,
  getStorefrontErrorMessage,
  StorefrontApiError,
} from "../../../API/StorefrontService/Storefront";
import type { StorefrontOrder } from "../../Storefront/type";
import { storefrontAdminWithRetry } from "../../Customer/lib/storefrontAdminWithRetry";

//*************************************************
// Constants
//*************************************************
const editableStatuses = new Set<billStatus_e>([
  billStatus_e.PrepareProduct,
  billStatus_e.PrepareShipment,
]);

const menuAction = {
  print: "Print",
  edit: "Edit",
  delete: "Delete",
  goToTop: "Go to Top",
} as const;

interface PageOrderDetailProps {
  source: orderSource_e;
}

//*************************************************
// Helper functions
//*************************************************
function canEditOrder(order?: orderInfo_t) {
  return (
    order?.source === orderSource_e.Direct &&
    editableStatuses.has(order.status)
  );
}

function canAdvanceOrder(order?: orderInfo_t) {
  if (!order) return false;

  if (order.source === orderSource_e.Online) {
    return editableStatuses.has(order.status);
  }

  return (
    order.status >= billStatus_e.PrepareProduct &&
    order.status < billStatus_e.Completed
  );
}

function getErrorMessage(errCode?: errorCode_e) {
  return `เกิดข้อผิดพลาด: ${ErrorString(errCode || errorCode_e.UnknownError)}`;
}

function toProductCardValue(item: orderInfo_t["list"][number]) {
  return {
    id: item.id,
    img: item.img,
    name: item.name,
    status: stockStatus_e.normal,
    type: item.type ?? productType_e.merchandise,
    price: item.price,
    description: item.description,
    amount: item.amount,
    total: item.total,
    percentDiscount: item.percentDiscount,
    priceAfterDiscount: item.percentDiscount ? item.priceAfterDiscount : undefined,
  };
}

//*************************************************
// Component
//*************************************************
const Page_OrderDetail: React.FC<PageOrderDetailProps> = ({ source }) => {
  // Hooks ************************************
  const authContext = useAuth();
  const navigate = useNavigate();
  const { orderID } = useParams<{ orderID: string }>();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [order, setOrder] = React.useState<orderInfo_t>();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const [isPaymentQuestionOpen, setIsPaymentQuestionOpen] =
    React.useState(false);
  const [isEvidenceOpen, setIsEvidenceOpen] = React.useState(false);
  const [isEvidenceLoading, setIsEvidenceLoading] = React.useState(false);
  const [evidenceOrder, setEvidenceOrder] =
    React.useState<StorefrontOrder | null>(null);
  const [evidenceError, setEvidenceError] = React.useState("");
  const orderListPath = `/bill/${source}`;

  // Memo *************************************
  const menuList = React.useMemo<menuList_t[]>(() => {
    const commonMenu: menuList_t[] = [
      { text: menuAction.print, icon: <PrintIcon /> },
      { text: menuAction.goToTop, icon: <KeyboardArrowUpIcon /> },
    ];

    if (!canEditOrder(order)) return commonMenu;

    return [
      { text: menuAction.print, icon: <PrintIcon /> },
      {
        text: menuAction.edit,
        icon: <EditIcon />,
        path: orderID ? `/bill/edit/${orderID}` : undefined,
      },
      { text: menuAction.delete, icon: <DeleteIcon /> },
      { text: menuAction.goToTop, icon: <KeyboardArrowUpIcon /> },
    ];
  }, [order, orderID]);

  // UI handlers ******************************
  const scrollToTop = React.useCallback(() => {
    containerRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const openPreview = React.useCallback(() => {
    if (!orderID) return;
    window.open(`/bill/preview/${orderID}`, "_blank");
  }, [orderID]);

  const onClose = React.useCallback(() => {
    navigate(orderListPath);
  }, [navigate, orderListPath]);

  const showPaymentEvidence = React.useCallback(
    async (selectedOrder: orderInfo_t) => {
      if (selectedOrder.source !== orderSource_e.Online) return;

      setIsEvidenceOpen(true);
      setIsEvidenceLoading(true);
      setEvidenceOrder(null);
      setEvidenceError("");
      try {
        const storefrontOrder = await storefrontAdminWithRetry(
          authContext,
          (accessToken) => getAdminStorefrontOrder(
            accessToken,
            selectedOrder.id,
            selectedOrder.customerID,
          ),
        );
        setEvidenceOrder(storefrontOrder);
      } catch (requestError) {
        if (
          requestError instanceof StorefrontApiError
          && requestError.status === 401
        ) {
          redirectToLogin(navigate);
          return;
        }
        setEvidenceError(getStorefrontErrorMessage(requestError));
      } finally {
        setIsEvidenceLoading(false);
      }
    },
    [authContext, navigate],
  );

  // API handlers *****************************
  const closePaymentQuestion = React.useCallback(() => {
    setIsPaymentQuestionOpen(false);
  }, []);

  const onNext = React.useCallback(async () => {
    if (!orderID || !order || isUpdatingStatus) return;

    if (!canAdvanceOrder(order)) {
      alert("คำสั่งซื้ออยู่ในสถานะสุดท้ายแล้ว");
      return;
    }

    if (order.status === billStatus_e.Billing) {
      setIsPaymentQuestionOpen(true);
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const res = await billWithRetry_f.nextStep(authContext, orderID);
      if (res.success) {
        navigate(orderListPath);
        return;
      }

      if (redirectToLoginOnAuthError(navigate, res.errCode)) return;

      alert(getErrorMessage(res.errCode));
    } catch (err) {
      if (redirectToLoginOnThrownAuthError(navigate, err)) return;

      alert("เกิดข้อผิดพลาด");
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [authContext, isUpdatingStatus, navigate, order, orderID, orderListPath]);

  const updateBillingStatus = React.useCallback(
    async (isPaid: boolean) => {
      if (!orderID || isUpdatingStatus) return;

      closePaymentQuestion();
      setIsUpdatingStatus(true);
      try {
        const updateStatus = isPaid
          ? billWithRetry_f.markBillingAsIncome
          : billWithRetry_f.markBillingAsDebt;
        const res = await updateStatus(authContext, orderID);

        if (res.success) {
          navigate(orderListPath);
          return;
        }

        if (redirectToLoginOnAuthError(navigate, res.errCode)) return;

        alert(getErrorMessage(res.errCode));
      } catch (err) {
        if (redirectToLoginOnThrownAuthError(navigate, err)) return;

        alert("เกิดข้อผิดพลาด");
      } finally {
        setIsUpdatingStatus(false);
      }
    },
    [
      authContext,
      closePaymentQuestion,
      isUpdatingStatus,
      navigate,
      orderID,
      orderListPath,
    ],
  );

  const onDelete = React.useCallback(async () => {
    if (!orderID) return;

    try {
      const res = await billWithRetry_f.delOrder(authContext, orderID);
      if (res.success) {
        navigate(orderListPath);
        return;
      }

      if (redirectToLoginOnAuthError(navigate, res.errCode)) return;

      alert(getErrorMessage(res.errCode));
    } catch (err) {
      if (redirectToLoginOnThrownAuthError(navigate, err)) return;

      alert("เกิดข้อผิดพลาด");
    }
  }, [authContext, navigate, orderID, orderListPath]);

  const speedDialHandler = React.useCallback(
    (index: number) => {
      const action = menuList[index]?.text;

      switch (action) {
        case menuAction.print:
          openPreview();
          break;
        case menuAction.delete:
          onDelete();
          break;
        case menuAction.goToTop:
          scrollToTop();
          break;
      }
    },
    [menuList, onDelete, openPreview, scrollToTop],
  );

  // Effects **********************************
  React.useEffect(() => {
    let active = true;

    async function loadOrder() {
      if (!orderID) {
        setOrder(undefined);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await billWithRetry_f.searchOrders(authContext, {
          orderID,
          source,
        });
        if (!active) return;

        if (res.success) {
          setOrder(res.data?.find((item) => item.id === orderID));
        } else {
          if (redirectToLoginOnAuthError(navigate, res.errCode)) return;

          setOrder(undefined);
          alert(getErrorMessage(res.errCode));
        }
      } catch (err) {
        if (!active) return;

        if (redirectToLoginOnThrownAuthError(navigate, err)) return;

        alert("เกิดข้อผิดพลาด");
        setOrder(undefined);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      active = false;
    };
  }, [authContext, navigate, orderID, source]);

  // Render ***********************************
  return (
    <>
      <HeaderDialog label="รายละเอียด" onClick={onClose}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            flexGrow: 1,
          }}
        >
          <IconButton
            color="inherit"
            disabled={
              !order ||
              isUpdatingStatus ||
              !canAdvanceOrder(order)
            }
            onClick={onNext}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </HeaderDialog>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          alignItems: "center",
          mt: "72px",
          gap: "8px",
        }}
      >
        {isLoading && (
          <Typography sx={{ mt: 4 }} color="text.secondary">
            Loading...
          </Typography>
        )}
        {!isLoading && !order && (
          <Typography sx={{ mt: 4 }} color="text.secondary">
            ไม่พบข้อมูลคำสั่งซื้อ
          </Typography>
        )}
        {order && (
          <CardOrder
            maxWidth="400px"
            value={{ ...order, list: [] }}
            onClick={
              order.source === orderSource_e.Online
                ? showPaymentEvidence
                : undefined
            }
          />
        )}
        {order && (
          <Field maxWidth="1280px" direction="column" alignItem="center">
            <Typography variant="h6">รายการสินค้า</Typography>
          </Field>
        )}
        <Box
          ref={containerRef}
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: "1280px",
            height: "calc(100vh - 127px)",
            overflowY: "auto",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              width: "100%",
              gap: 1,
            }}
          >
            {order?.list.map((item, index) => (
              <CardProduct
                key={index}
                maxWidth="400px"
                value={toProductCardValue(item)}
              />
            ))}
          </Box>
        </Box>
      </Box>
      {order && (
        <MySpeedDial
          menuList={menuList}
          icon={<MoreVertIcon />}
          onClick={speedDialHandler}
        />
      )}
      <DialogQuestion
        open={isPaymentQuestionOpen}
        title="ยืนยันการชำระเงิน"
        content="ลูกค้าชำระเงินแล้วใช่หรือไม่"
        questionType="yesNo"
        confirmText="ชำระแล้ว"
        cancelText="ยังไม่ชำระ"
        confirmColor="success"
        onConfirm={() => updateBillingStatus(true)}
        onCancel={() => updateBillingStatus(false)}
        onClose={closePaymentQuestion}
      />
      <Dialog
        open={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
        maxWidth="md"
        fullWidth
        aria-labelledby="payment-evidence-title"
      >
        <DialogTitle id="payment-evidence-title">
          หลักฐานการชำระเงิน
        </DialogTitle>
        <DialogContent dividers>
          {isEvidenceLoading && (
            <Stack alignItems="center" spacing={1.5} sx={{ py: 4 }}>
              <CircularProgress />
              <Typography color="text.secondary">กำลังโหลดหลักฐาน</Typography>
            </Stack>
          )}
          {!isEvidenceLoading && evidenceError && (
            <Alert severity="error">{evidenceError}</Alert>
          )}
          {!isEvidenceLoading
            && !evidenceError
            && !evidenceOrder?.confirmationEvidence && (
            <Typography color="text.secondary">
              ยังไม่มีหลักฐานการชำระเงิน
            </Typography>
          )}
          {!isEvidenceLoading && evidenceOrder?.confirmationEvidence && (
            <Stack spacing={2}>
              {evidenceOrder.confirmationEvidence.mimeType.startsWith("image/") && (
                <Box
                  component="img"
                  src={evidenceOrder.confirmationEvidence.dataUrl}
                  alt={`หลักฐาน ${evidenceOrder.confirmationEvidence.fileName}`}
                  sx={{
                    width: "100%",
                    maxHeight: "70vh",
                    objectFit: "contain",
                    bgcolor: "action.hover",
                    borderRadius: 1,
                  }}
                />
              )}
              {evidenceOrder.confirmationEvidence.mimeType === "application/pdf" && (
                <Box
                  component="iframe"
                  src={evidenceOrder.confirmationEvidence.dataUrl}
                  title={`หลักฐาน ${evidenceOrder.confirmationEvidence.fileName}`}
                  sx={{ width: "100%", height: "70vh", border: 0 }}
                />
              )}
              <Box>
                <Typography fontWeight={600}>
                  {evidenceOrder.confirmationEvidence.fileName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  อัปเดตล่าสุด{" "}
                  {new Date(
                    evidenceOrder.confirmationEvidence.updatedAt,
                  ).toLocaleString("th-TH")}
                </Typography>
              </Box>
              <Button
                component="a"
                href={evidenceOrder.confirmationEvidence.dataUrl}
                target="_blank"
                rel="noreferrer"
                variant="outlined"
              >
                เปิดหลักฐาน
              </Button>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEvidenceOpen(false)}>ปิด</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Page_OrderDetail;
