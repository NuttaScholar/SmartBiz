import * as React from "react";
import Box from "@mui/material/Box";
import TabBox from "../../../component/Atoms/TabBox";
import FieldSearch from "../../../component/Molecules/FieldSearch";
import { billStatus_e, productType_e, stockStatus_e } from "../../../enum";
import { useBillContext } from "../hooks/useBillContex";
import { order_t, orderInfo_t } from "../../../API/BillService/type";
import billWithRetry_f from "../lib/billWithRetry";
import { useAuth } from "../../../hooks/useAuth";

const tabStatusList = [
  billStatus_e.PrepareProduct,
  billStatus_e.PrepareShipment,
  billStatus_e.Billing,
  billStatus_e.Completed,
];

function mapOrderToOrderInfo(order: order_t): orderInfo_t {
  return {
    id: order.orderID,
    customer: order.customerID,
    total: order.totalAmount,
    date: order.createdAt ? new Date(order.createdAt) : new Date(),
    status: order.status,
    list: order.items.map((item) => ({
      id: item.productID,
      name: item.productID,
      type: productType_e.merchandise,
      img: "",
      status: stockStatus_e.normal,
      amount: item.quantity,
      total: item.quantity * item.priceAfterDiscount,
      percentDiscount: item.discountPercent,
      priceAfterDiscount: item.priceAfterDiscount,
      price: item.priceOriginal,
    })),
  };
}
//*************************************************
// Interface
//*************************************************
interface myProps {
  children?: React.ReactNode;

}
//*************************************************
// Function
//*************************************************
const OrderListHeader: React.FC<myProps> = (props) => {
  // Hook ************************************
  const [tab, setTab] = React.useState(0);
  const { state, setState } = useBillContext();
  const authContext = useAuth();
  // Local function **************************

  // Effect **********************************
  React.useEffect(() => {
    let isActive = true;
    const status = tabStatusList[tab];

    async function fetchOrders() {
      const res = await billWithRetry_f.getOrdersByStatus(authContext, status);
      if (!isActive) return;

      setState((prev) => ({
        ...prev,
        filter: tab,
        orderList:
          res.status === "success" ? res.result?.map(mapOrderToOrderInfo) ?? [] : [],
      }));
    }

    fetchOrders().catch((err) => {
      console.log("fetchOrders err", err);
      if (isActive) {
        setState((prev) => ({ ...prev, filter: tab, orderList: [] }));
      }
    });

    return () => {
      isActive = false;
    };
  }, [authContext, setState, tab]);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 2,
        gap: 1,
      }}
    >
      <FieldSearch
        placeholder="ชื่อลูกค้า"
        maxWidth="650px"
      />  
      <TabBox
        gotoTop={state.triger_gotoTop}
        list={["แพ็คสินค้า", "พร้อมจัดส่ง", "จัดการบิล", "เสร็จสิ้น"]}
        height="calc(100vh - 200px)"
        alignItems="center"
        onClick={setTab}
        value={tab}
        maxWidth="1280px"
      >
        {props.children}
      </TabBox>
    </Box>
  );
};

export default OrderListHeader;
