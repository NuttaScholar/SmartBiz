import { Alert, Box, CircularProgress } from "@mui/material";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { productInfo_t } from "../../../API/StockService/type";
import HeaderDialog from "../../../component/Molecules/HeaderDialog";
import CardProduct from "../../../component/Organisms/CardProduct";
import { errorCode_e } from "../../../enum";
import { ErrorString } from "../../../function/Enum";
import { useAuth } from "../../../hooks/useAuth";
import {
  redirectToLoginOnAuthError,
  redirectToLoginOnThrownAuthError,
} from "../../../lib/authRedirect";
import TebleLog from "../component/TebleLog";
import stockWithRetry_f from "../lib/stockWithRetry";

export default function Page_StockHistory() {
  const { productID = "" } = useParams<{ productID: string }>();
  const authContext = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = React.useState<productInfo_t>();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [productReloadKey, setProductReloadKey] = React.useState(0);

  React.useEffect(() => {
    let active = true;

    if (!productID) {
      setError("ไม่พบรหัสสินค้า");
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError("");
    stockWithRetry_f
      .getStock(authContext)
      .then((response) => {
        if (!active) return;
        if (response.success && response.data) {
          const selectedProduct = response.data.find(
            (item) => item.id === productID,
          );
          if (selectedProduct) {
            setProduct(selectedProduct);
          } else {
            setError(`ไม่พบสินค้ารหัส ${productID}`);
          }
          return;
        }
        if (redirectToLoginOnAuthError(navigate, response.errCode)) return;
        setError(ErrorString(response.errCode ?? errorCode_e.UnknownError));
      })
      .catch((requestError) => {
        if (!active) return;
        if (redirectToLoginOnThrownAuthError(navigate, requestError)) return;
        setError("ไม่สามารถโหลดข้อมูลสินค้าได้");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authContext, navigate, productID, productReloadKey]);

  return (
    <>
      <HeaderDialog
        label="ประวัติการเคลื่อนไหว"
        onClick={() => navigate("/stock")}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          alignItems: "center",
          mt: "64px",
          gap: "8px",
        }}
      >
        {loading && <CircularProgress sx={{ mt: 4 }} />}
        {error && (
          <Alert
            severity="error"
            sx={{ width: "calc(100% - 32px)", maxWidth: 1280, mt: 2 }}
          >
            {error}
          </Alert>
        )}
        {product && (
          <CardProduct value={product} maxWidth="400px" variant="readonly" />
        )}
        {productID && (
          <TebleLog
            productID={productID}
            onLogUpdated={() => setProductReloadKey((current) => current + 1)}
          />
        )}
      </Box>
    </>
  );
}
