import { Box, IconButton } from "@mui/material";
import HeaderDialog from "../../../component/Molecules/HeaderDialog";
import FormStockHeader from "../component/FormStockHeader";
import FormStock from "../component/FormStock";
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
import { errorCode_e } from "../../../enum";

export default function Page_StockOut() {
  // Hook ************************************
  const authContext = useAuth();
  const nevigate = useNavigate();
  const [state, setState] = React.useState<stock_t>(StockDefaultState);
  const [listOption, setListOption] = React.useState<productInfo_t[]>([]);
  const navigate = useNavigate();
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
    console.log("discription", state.billForm);
    console.log("list", state.productList);
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
        if (res.status === "success") {
          navigate("/stock");
        } else if (res.status === "warning") {
          alert(`พบปัญหา! ไม่สามารถตัดสต็อกรายการต่อไปนี้ได้\n${res.result?.map((item) => `ID: ${item.productID}, Amount: ${item.amount}`).join("\n")}
          `);
        } else {
          alert(
            `เกิดข้อผิดพลาด: ${ErrorString(res.errCode || errorCode_e.UnknownError)}`
          );
        }
      })
      .catch((err) => {
        alert(`เกิดข้อผิดพลาด`);
        console.log("postStockOutError", err);
      });
  };
  React.useEffect(() => {
    stockWithRetry_f
      .getProduct(authContext)
      .then((res) => {
        if (res.status === "success" && res.result !== undefined) {
          res.result && setListOption(res.result.products);
        } else {
          alert(
            `เกินข้อผิดพลาด: ${ErrorString(res.errCode || errorCode_e.UnknownError)}`
          );
        }
      })
      .catch((err) => {
        nevigate("/");
        console.log(err);
      });
  }, []);
  return (
    <StockContext.Provider value={{ state, setState }}>
      <HeaderDialog label={"ตัดสต็อก"} onClick={() => navigate("/stock")}>
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
        <FormStock type="out" listOption={listOption} />
        <StockList variant="deleteable" onClick={onEdit} />
      </Box>
      <DialogStockEdit type="out" />
    </StockContext.Provider>
  );
}
