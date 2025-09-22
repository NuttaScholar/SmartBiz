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
import { productInfo_t } from "../../../component/Organisms/CardProduct";
import DialogStockEdit from "../component/DialogStockEdit";

export default function Page_StockOut() {
  const [state, setState] = React.useState<stock_t>(StockDefaultState);
  const navigate = useNavigate();

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
        setState({...state, dialogOpen: stockDialog_e.editForm, indexList: index});
      }
    }
  };
  const onSave = () => {    
    console.log("img",state.billForm);
    console.log("list",state.productList);
    navigate("/stock");
  };
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
        <FormStockHeader type="out"/>
        <FormStock type="in" />
        <StockList variant="deleteable" onClick={onEdit} />
      </Box>
      <DialogStockEdit type="in"/>
    </StockContext.Provider>
  );
}
