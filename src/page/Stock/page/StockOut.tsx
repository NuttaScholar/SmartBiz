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
  stockOutForm_t,
} from "../../../API/StockService/type";
import stockWithRetry_f from "../lib/stockWithRetry";
import { useAuth } from "../../../hooks/useAuth";
import { ErrorString } from "../../../function/Enum";
import { errorCode_e, productType_e, stockStatus_e } from "../../../enum";
import AddProductForm, {
  FormAddProduce_t,
} from "../../../component/Organisms/AddProductForm";
import {
  redirectToLoginOnAuthError,
  redirectToLoginOnThrownAuthError,
} from "../../../lib/authRedirect";

export default function Page_StockOut() {
  // Hook ************************************
  const authContext = useAuth();
  const nevigate = useNavigate();
  const [state, setState] = React.useState<stock_t>(StockDefaultState);
  const [listOption, setListOption] = React.useState<productInfo_t[]>([]);

  // Local function **************************
  const getStockAmount = (productID: string) => {
    return listOption.find((item) => item.id === productID)?.amount || 0;
  };
  const validateStockAmount = (product: productInfo_t) => {
    const stockAmount = getStockAmount(product.id);
    const amount = product.amount || 0;

    if (amount > stockAmount) {
      alert(`จำนวนสินค้า ${product.name || product.id} มีในสต็อกเพียง ${stockAmount}`);
      return false;
    }

    return true;
  };
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
    if (
      state.billForm?.description === undefined ||
      state.billForm.description === ""
    ) {
      alert("กรุณาระบุเหตุผลการตัดสต็อก");
      return;
    }
    if (state.productList === undefined || state.productList.length <= 0) {
      alert("กรุณาเพิ่มสินค้าที่ต้องการตัดสต็อก");
      return;
    }
    if (!state.productList.every(validateStockAmount)) {
      return;
    }

    const list: stockForm_t[] = state.productList.map((item) => ({
      productID: item.id,
      amount: item.amount || 0,
      price: item.price,
    }));
    const data: stockOutForm_t = {
      note: state.billForm.description,
      products: list,
    };
    stockWithRetry_f
      .postStockOut(authContext, data)
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
        console.log("postStockOutError", err);
      });
  };
  const onAdd = (form: FormAddProduce_t) => {
    const productID = form.product?.code || "";
    const product = listOption?.find((item) => item.id === productID);
    const amount = form.amount !== undefined ? Number(form.amount) : undefined;
    const isDuplicate = state.productList?.some((item) => item.id === productID);

    if (isDuplicate) {
      alert("รายการสินค้านี้ถูกเพิ่มแล้ว");
      return;
    }

    const newList: productInfo_t = {
      id: productID,
      name: form.product?.value || "",
      amount,
      type: product?.type ?? productType_e.merchandise,
      status: product?.status ?? stockStatus_e.normal,
      img: product?.img || "",
    };

    if (!validateStockAmount(newList)) {
      return;
    }

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
  // Render ************************************
  return (
    <StockContext.Provider value={{ state, setState }}>
      <HeaderDialog label={"ตัดสต็อก"} onClick={() => nevigate("/stock")}>
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
        <FormStockHeader type="out" />
        <AddProductForm list={listOption} hideFieldPrice onAdd={onAdd} />
        <StockList variant="deleteable" onClick={onEdit} />
      </Box>
      <DialogStockEdit type="out" listOption={listOption} />
    </StockContext.Provider>
  );
}
