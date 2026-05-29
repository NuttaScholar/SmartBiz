import {
  AppBar,
  Box,
  Button,
  Container,
  Paper,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import ReceiptPreview, {
  ReceiptData,
} from "../../../component/Organisms/ReceiptPreview";
import PrintIcon from "@mui/icons-material/Print";
import billWithRetry_f from "../lib/billWithRetry";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate, useParams } from "react-router-dom";
import { orderInfo_t } from "../../../API/BillService/type";
import { ErrorString } from "../../../function/Enum";
import { errorCode_e } from "../../../enum";
import contactWithRetry_f from "../../Access/lib/contactWithRetry";
import { ContactInfo_t } from "../../../API/AccountService/type";
import {
  redirectToLoginOnAuthError,
  redirectToLoginOnThrownAuthError,
} from "../../../lib/authRedirect";

const dateFormat = new Intl.DateTimeFormat("th-TH", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function formatDate(value?: Date | string) {
  const date = value ? new Date(value) : undefined;
  return date && !Number.isNaN(date.getTime()) ? dateFormat.format(date) : "-";
}

function toReceiptData(order: orderInfo_t, contact?: ContactInfo_t): ReceiptData {
  const billName = contact?.billName?.trim();

  return {
    customerName: billName || order.customer || order.customerID,
    customerID: order.customerID,
    customerAddress: contact?.address,
    customerTaxID: contact?.taxID,
    orderNumber: order.id,
    billDate: formatDate(new Date()),
    orderDate: formatDate(order.date),
    total: order.total || 0,
    items: order.list.map((item) => {
      const qty = item.amount || 0;
      const price = item.priceAfterDiscount ?? item.price ?? 0;

      return {
        name: item.name,
        qty,
        price,
        total: item.total ?? qty * price,
        discountPercent: item.percentDiscount,
      };
    }),
  };
}

//*********************************************
// Component
//*********************************************
export default function Page_BillPreview() {
  const authContext = useAuth();
  const navigate = useNavigate();
  const { orderID } = useParams<{ orderID: string }>();
  const [order, setOrder] = useState<orderInfo_t>();
  const [contact, setContact] = useState<ContactInfo_t>();
  const [isLoading, setIsLoading] = useState(true);

  const receiptData = useMemo(
    () => (order ? toReceiptData(order, contact) : undefined),
    [contact, order],
  );

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    document.body.style.backgroundColor = "#f3f4f6";

    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  useEffect(() => {
    if (!orderID) {
      setOrder(undefined);
      setContact(undefined);
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);

    billWithRetry_f
      .searchOrders(authContext, { orderID })
      .then((res) => {
        if (!active) return;

        if (res.status === "success") {
          setOrder(res.result?.find((item) => item.id === orderID));
        } else {
          if (redirectToLoginOnAuthError(navigate, res.errCode)) return;

          alert(
            `เกิดข้อผิดพลาด: ${ErrorString(res.errCode || errorCode_e.UnknownError)}`,
          );
          setOrder(undefined);
          setContact(undefined);
        }
      })
      .catch((err) => {
        if (!active) return;

        if (redirectToLoginOnThrownAuthError(navigate, err)) return;

        alert("เกิดข้อผิดพลาด");
        console.log("getPreviewOrderError", err);
        setOrder(undefined);
        setContact(undefined);
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [authContext, navigate, orderID]);

  useEffect(() => {
    if (!order?.customerID) {
      setContact(undefined);
      return;
    }

    let active = true;

    contactWithRetry_f
      .get(authContext, order.customerID)
      .then((res) => {
        if (!active) return;

        if (res.status === "success") {
          setContact(
            res.result?.find((item) => item.codeName === order.customerID),
          );
        } else {
          if (redirectToLoginOnAuthError(navigate, res.errCode)) return;

          console.log("getPreviewContactError", res.errCode);
          setContact(undefined);
        }
      })
      .catch((err) => {
        if (!active) return;

        if (redirectToLoginOnThrownAuthError(navigate, err)) return;

        console.log("getPreviewContactError", err);
        setContact(undefined);
      });

    return () => {
      active = false;
    };
  }, [authContext, navigate, order?.customerID]);

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AppBar
        position="sticky"
        className="no-print"
        sx={{
          bgcolor: "#ffffff",
          color: "#111827",
          boxShadow: "0 1px 8px rgba(15,23,42,0.12)",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            sx={{
              justifyContent: "space-between",
              minHeight: { xs: 56, sm: 64 },
              px: { xs: 0, sm: 2 },
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                ตัวอย่างใบสั่งซื้อ
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {receiptData ? `เลขที่: ${receiptData.orderNumber}` : "Bill Preview"}
              </Typography>
            </Box>

            <Tooltip title="พิมพ์เอกสาร">
              <span>
                <Button
                  variant="contained"
                  onClick={handlePrint}
                  disabled={!receiptData}
                  startIcon={<PrintIcon />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: 1,
                  }}
                >
                  พิมพ์
                </Button>
              </span>
            </Tooltip>
          </Toolbar>
        </Container>
      </AppBar>

      <Box
        sx={{
          py: { xs: 2, sm: 4 },
          px: { xs: 1, sm: 2 },
          maxWidth: 980,
          mx: "auto",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #e5e7eb",
            borderRadius: 1,
            overflow: "hidden",
            "@media print": {
              border: "none",
            },
          }}
        >
          {isLoading && (
            <Typography sx={{ p: 4 }} color="text.secondary">
              Loading...
            </Typography>
          )}
          {!isLoading && !receiptData && (
            <Typography sx={{ p: 4 }} color="text.secondary">
              ไม่พบข้อมูลคำสั่งซื้อ
            </Typography>
          )}
          {receiptData && <ReceiptPreview data={receiptData} />}
        </Paper>
      </Box>
    </Box>
  );
}
