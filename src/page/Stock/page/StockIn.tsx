import { Box, IconButton } from "@mui/material";
import HeaderDialog from "../../../component/Molecules/HeaderDialog";
import FormStockHeader from "../component/FormStockHeader";
import { useNavigate } from "react-router-dom";
import SaveIcon from "@mui/icons-material/Save";
import {
  stock_t,
  StockContext,
  StockDefaultState,
  stockDialog_e,
} from "../context/StockContext";
import React from "react";
import StockList from "../component/StockList";
import DialogStockEdit from "../component/DialogStockEdit";
import {
  productInfo_t,
  stockForm_t,
  stockInForm_t,
} from "../../../API/StockService/type";
import { useAuth } from "../../../hooks/useAuth";
import stockWithRetry_f from "../lib/stockWithRetry";
import { ErrorString } from "../../../function/Enum";
import { errorCode_e, productType_e, stockStatus_e } from "../../../enum";
import AddProductForm, {
  FormAddProduce_t,
} from "../../../component/Organisms/AddProductForm";
import {
  redirectToLoginOnAuthError,
  redirectToLoginOnThrownAuthError,
} from "../../../lib/authRedirect";

export default function Page_StockIn() {
  // Hook ************************************
  const authContext = useAuth();
  const nevigate = useNavigate();
  const [state, setState] = React.useState<stock_t>(StockDefaultState);
  const navigate = useNavigate();
  const [listOption, setListOption] = React.useState<productInfo_t[]>([]);
  // Local function **************************
  const onEdit = (del: boolean, value: productInfo_t) => {
    if (state.productList !== undefined) {
      const index = state.productList.findIndex((item) => item.id === value.id);

      if (index === undefined || index < 0) return;
      if (del) {
        const newList = [
          ...state.productList.slice(0, index),
          ...state.productList.slice(index + 1),
        ];
        setState({ ...state, productList: newList });
      } else {
        setState({
          ...state,
          dialogOpen: stockDialog_e.editForm,
          indexList: index,
        });
      }
    }
  };
  const onSave = () => {
    if (state.billForm?.img === undefined || state.billForm.img === null) {
      alert("กรุณาแนบรูปใบเสร็จรับเงิน");
      return;
    }
    if (state.productList === undefined || state.productList.length <= 0) {
      alert("กรุณาเพิ่มสินค้าที่ต้องการตัดสต็อก");
      return;
    }
    const list: stockForm_t[] = state.productList.map((item) => ({
      productID: item.id,
      amount: item.amount || 0,
      price: item.price,
    }));
    const data: stockInForm_t = {
      bill_Img: state.billForm.img,
      products: list,
      who: state.billForm?.who,
    };
    stockWithRetry_f
      .postStockIn(authContext, data)
      .then((res) => {
        if (res.success) {
          if (res.data?.length) {
            alert(`พบปัญหา! ไม่สามารถดำเนินการบางรายการได้`);
          }
          nevigate("/stock");
        } else {
          if (redirectToLoginOnAuthError(nevigate, res.errCode)) return;

          alert(
            `เกิดข้อผิดพลาด: ${ErrorString(res.errCode || errorCode_e.UnknownError)}`,
          );
        }
      })
      .catch((err) => {
        if (redirectToLoginOnThrownAuthError(nevigate, err)) return;

        alert(`เกิดข้อผิดพลาด`);
      });
  };
  const onAdd = (form: FormAddProduce_t) => {
    const productID = form.product?.code || "";
    const isDuplicate = state.productList?.some((item) => item.id === productID);

    if (isDuplicate) {
      alert("รายการสินค้านี้ถูกเพิ่มแล้ว");
      return;
    }

    const newList: productInfo_t = {
      id: productID,
      name: form.product?.value || "",
      amount: form.amount !== undefined ? Number(form.amount) : undefined,
      price: form.price ? Number(form.price) : 0,
      type: productType_e.merchandise,
      status: stockStatus_e.normal,
      img: listOption?.find((item) => item.id === productID)?.img || "",
    };
    setState({
      ...state,
      productList: [...(state.productList || []), newList],
    });
  };
  // Effect **********************************
  React.useEffect(() => {
    stockWithRetry_f
        .getStock(authContext)
        .then((res) => {
          if (res.success && res.data !== undefined) {
            res.data && setListOption(res.data);
          } else {
            if (redirectToLoginOnAuthError(nevigate, res.errCode)) return;

            alert(
              `เกินข้อผิดพลาด: ${ErrorString(res.errCode || errorCode_e.UnknownError)}`,
            );
          }
        })
        .catch((err) => {
          if (redirectToLoginOnThrownAuthError(nevigate, err)) return;

          console.log(err);
        });
  }, [authContext, nevigate]);
  // Render **********************************
  return (
    <StockContext.Provider value={{ state, setState }}>
      <HeaderDialog label={"เติมสต็อก"} onClick={() => navigate("/stock")}>
        <Box sx={{ display: "flex", flexGrow: 1, justifyContent: "flex-end" }}>
          <IconButton
            onClick={onSave}
            size="large"
            sx={{
              color: "white",
            }}
          >
            <SaveIcon sx={{ fontSize: 32 }} />
          </IconButton>
        </Box>
      </HeaderDialog>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          alignItems: "center",
          my: "72px",
          gap: "8px",
        }}
      >
        <FormStockHeader type="in" />
        <AddProductForm list={listOption} onAdd={onAdd} />
        <StockList variant="deleteable" onClick={onEdit} />
      </Box>
      <DialogStockEdit type="in" />
    </StockContext.Provider>
  );
}
