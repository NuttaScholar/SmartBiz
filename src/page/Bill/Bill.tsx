import React from "react";
import AppBar_c from "../../component/Organisms/AppBar_c";
import {
  BillContext,
  BillDefaultState,
  billState_t,
} from "./context/BillContext";
import OrderListHeader from "./component/OrderListHeader";
import OrderList from "./component/OrderList";
import SpeedDial_Bill from "./component/SpeedDialBill";
import { orderInfo_t } from "../../API/BillService/type";
import { useNavigate } from "react-router-dom";
import { orderSource_e } from "../../enum";

interface PageBillProps {
  source: orderSource_e;
}
//*************************************************
// Function
//*************************************************
const Page_Bill: React.FC<PageBillProps> = ({ source }) => {
  const navigate = useNavigate();
  const [state, setState] = React.useState<billState_t>({
    ...BillDefaultState,
    sourceFilter: source,
    containerRef: React.useRef<HTMLDivElement>(null),
  });

  const onClickOrderList = (value: orderInfo_t) => {
    navigate(`/bill/${source}/detail/${value.id}`);
  };
  return (
    <BillContext.Provider value={{ state, setState }}>
      <AppBar_c>
        <OrderListHeader>
          <OrderList onClick={onClickOrderList} />
        </OrderListHeader>
        <SpeedDial_Bill />
      </AppBar_c>
    </BillContext.Provider>
  );
};

export default Page_Bill;
