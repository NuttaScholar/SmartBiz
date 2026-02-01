import React from "react";
import AppBar_c from "../../component/Organisms/AppBar_c";
import StatusPanel, {
  listStatus_t,
} from "../../component/Organisms/StatusPanal";
import {
  BillContext,
  BillDefaultState,
  billState_t,
} from "./context/BillContext";
import OrderStatus from "./component/OrderStatus";
import OrderListHeader from "./component/OrderListHeader";
import OrderList from "./component/OrderList";
import SpeedDial_Bill from "./component/SpeedDialBill";
//*************************************************
// Data Set
//*************************************************
const list: listStatus_t = [
  { label: "Paid", id: "paid", color_value: "success" },
  { label: "Unpaid", id: "unpaid", color_value: "error" },
  { label: "Pending", id: "pending", color_value: "warning" },
];
//*************************************************
// Function
//*************************************************
const Page_Bill: React.FC = () => {
  const [state, setState] = React.useState<billState_t>(BillDefaultState);
  return (
    <BillContext.Provider value={{ state, setState }}>
      <AppBar_c>
        <OrderListHeader>
          <OrderList/>
        </OrderListHeader>
        <SpeedDial_Bill />
      </AppBar_c>
    </BillContext.Provider>
  );
};

export default Page_Bill;
