import React, { useEffect } from "react";
import AppBar_c from "../../component/Organisms/AppBar_c";
import {
  stock_t,
  StockContext,
  StockDefaultState,
  stockDialog_e,
} from "./context/StockContext";
import StockStatus from "./component/StockStatus";
import StockList from "./component/StockList";
import SpeedDial_Stock from "./component/SpeedDialStock";
import DialogFormProduct from "./component/DialogFormProduct";
import StockListHeader from "./component/StockListHeader";
import { productInfo_t } from "../../API/StockService/type";

const Page_Stock: React.FC = () => {
  const [state, setState] = React.useState<stock_t>(StockDefaultState);
  const onClickList = (edit: boolean, value: productInfo_t) => {
    if(edit){
      setState({...state, dialogOpen: stockDialog_e.productForm, productForm: value})
    }
  }          
  return (
    <StockContext.Provider value={{ state, setState }}>
      <AppBar_c>
        <StockStatus />
        <StockListHeader>
          <StockList
            variant="editable"
            onClick={onClickList}
          />
        </StockListHeader>

        <SpeedDial_Stock />
      </AppBar_c>
      <DialogFormProduct
        onClose={() => setState({ ...state, dialogOpen: stockDialog_e.none })}
      />
    </StockContext.Provider>
  );
};

export default Page_Stock;
