import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PrintIcon from "@mui/icons-material/Print";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import { useNavigate, useParams } from "react-router-dom";
import HeaderDialog from "../../../component/Molecules/HeaderDialog";
import CardProduct, {
  productType_e,
} from "../../../component/Organisms/CardProduct";
import CardOrder from "../../../component/Organisms/CardOrder";
import DialogQuestion from "../../../component/Organisms/DialogQuestion";
import Field from "../../../component/Atoms/Field";
import MySpeedDial from "../../../component/Molecules/MySpeedDial";
import { menuList_t } from "../../../component/Molecules/ButtonOption";
import { orderInfo_t } from "../../../API/BillService/type";
import { billStatus_e, errorCode_e, stockStatus_e } from "../../../enum";
import { useAuth } from "../../../hooks/useAuth";
import { ErrorString } from "../../../function/Enum";
import billWithRetry_f from "../lib/billWithRetry";

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

//*************************************************
// Helper functions
//*************************************************
function canEditOrder(status?: billStatus_e) {
  return status !== undefined && editableStatuses.has(status);
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
const Page_OrderDetail: React.FC = () => {
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

  // Memo *************************************
  const menuList = React.useMemo<menuList_t[]>(() => {
    const commonMenu: menuList_t[] = [
      { text: menuAction.print, icon: <PrintIcon /> },
      { text: menuAction.goToTop, icon: <KeyboardArrowUpIcon /> },
    ];

    if (!canEditOrder(order?.status)) return commonMenu;

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
  }, [order?.status, orderID]);

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
    navigate("/bill");
  }, [navigate]);

  // API handlers *****************************
  const closePaymentQuestion = React.useCallback(() => {
    setIsPaymentQuestionOpen(false);
  }, []);

  const onNext = React.useCallback(async () => {
    if (!orderID || !order || isUpdatingStatus) return;

    if (order.status === billStatus_e.Completed) {
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
      if (res.status === "success") {
        navigate("/bill");
        return;
      }

      alert(getErrorMessage(res.errCode));
    } catch (err) {
      alert("เกิดข้อผิดพลาด");
      console.log("nextStepError", err);
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [authContext, isUpdatingStatus, navigate, order, orderID]);

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

        if (res.status === "success") {
          navigate("/bill");
          return;
        }

        alert(getErrorMessage(res.errCode));
      } catch (err) {
        alert("เกิดข้อผิดพลาด");
        console.log("updateBillingStatusError", err);
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
    ],
  );

  const onDelete = React.useCallback(async () => {
    if (!orderID) return;

    try {
      const res = await billWithRetry_f.delOrder(authContext, orderID);
      if (res.status === "success") {
        navigate("/bill");
        return;
      }

      alert(getErrorMessage(res.errCode));
    } catch (err) {
      alert("เกิดข้อผิดพลาด");
      console.log("delOrderError", err);
    }
  }, [authContext, navigate, orderID]);

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
        });
        if (!active) return;

        if (res.status === "success") {
          setOrder(res.result?.find((item) => item.id === orderID));
        } else {
          setOrder(undefined);
          alert(getErrorMessage(res.errCode));
        }
      } catch (err) {
        if (!active) return;

        alert("เกิดข้อผิดพลาด");
        console.log("getOrderDetailError", err);
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
  }, [authContext, orderID]);

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
              order.status === billStatus_e.Completed
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
        {order && <CardOrder maxWidth="400px" value={{ ...order, list: [] }} />}
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
    </>
  );
};

export default Page_OrderDetail;
