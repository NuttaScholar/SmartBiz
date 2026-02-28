import React from "react";
import AppBar_c from "../../component/Organisms/AppBar_c";
import {
  BillContext,
  BillDefaultState,
  billDialog_e,
  billState_t,
} from "./context/BillContext";
import OrderListHeader from "./component/OrderListHeader";
import OrderList from "./component/OrderList";
import SpeedDial_Bill from "./component/SpeedDialBill";
import DialogOrderDetail from "./component/DialogOrderDetail";
import { orderInfo_t } from "../../API/BillService/type";
import DialogOrderForm from "./component/DialogOrderForm";
//*************************************************
// Function
//*************************************************
const Page_Bill: React.FC = () => {
  const [state, setState] = React.useState<billState_t>({
    ...BillDefaultState,
    containerRef: React.useRef<HTMLDivElement>(null),
  });
  const [detail, setDetail] = React.useState<orderInfo_t>();

  const onClickOrderList = (value: orderInfo_t) => {
    setState({ ...state, dialogOpen: billDialog_e.detail });
    setDetail(value);
  };
  return (
    <BillContext.Provider value={{ state, setState }}>
      <AppBar_c>
        <OrderListHeader>
          <OrderList onClick={onClickOrderList} />
        </OrderListHeader>
        <SpeedDial_Bill />
      </AppBar_c>
      <DialogOrderDetail value={detail} />
      <DialogOrderForm/>
    </BillContext.Provider>
  );
};

export default Page_Bill;
