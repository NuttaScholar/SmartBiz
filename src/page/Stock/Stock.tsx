import React from "react";
import AppBar_c from "../../component/Organisms/AppBar_c";
import { stock_t, StockContext, StockDefaultState } from "./context/StockContext";
import StockStatus from "./component/StockStatus";
import StockList from "./component/StockList";

const Page_Stock: React.FC = () => {
  const [state, setState] = React.useState<stock_t>(StockDefaultState);
  return (
    <StockContext.Provider value={{ state, setState }}>
      <AppBar_c>
        <StockStatus/>
        <StockList/>
      </AppBar_c>
    </StockContext.Provider>
  );
};

export default Page_Stock;
