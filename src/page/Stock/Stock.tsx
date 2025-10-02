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
import { useAuth } from "../../hooks/useAuth";
import { initPage } from "../../lib/initPage";

const Page_Stock: React.FC = () => {
  const [state, setState] = React.useState<stock_t>(StockDefaultState);
  const authContext = useAuth();
  useEffect(() => {
    initPage(authContext);
  }, []);
  return (
    <StockContext.Provider value={{ state, setState }}>
      <AppBar_c>
        <StockStatus />
        <StockListHeader>
          <StockList />
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
