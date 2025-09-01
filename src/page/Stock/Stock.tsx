import React from "react";
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

const Page_Stock: React.FC = () => {
  const [state, setState] = React.useState<stock_t>(StockDefaultState);
  return (
    <StockContext.Provider value={{ state, setState }}>
      <AppBar_c>
        <StockStatus />
        <StockList />
        <SpeedDial_Stock />
      </AppBar_c>
      <DialogFormProduct onClose={()=>setState({...state, dialogOpen: stockDialog_e.none})}/>
    </StockContext.Provider>
  );
};

export default Page_Stock;
