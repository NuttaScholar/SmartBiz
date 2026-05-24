import * as React from "react";
import Box from "@mui/material/Box";
import TabBox from "../../../component/Atoms/TabBox";
import FieldSearch from "../../../component/Molecules/FieldSearch";
import { billStatus_e } from "../../../enum";
import { useBillContext } from "../hooks/useBillContex";
import { orderInfo_t } from "../../../API/BillService/type";
import billWithRetry_f from "../lib/billWithRetry";
import { useAuth } from "../../../hooks/useAuth";

const tabStatusList = [
  billStatus_e.PrepareProduct,
  billStatus_e.PrepareShipment,
  billStatus_e.Billing,
  billStatus_e.WaitingPayment,
  billStatus_e.Completed,
];

const completedTabIndex = tabStatusList.indexOf(billStatus_e.Completed);

function emptyStatusCountList() {
  return tabStatusList.map((_, index) => (index === completedTabIndex ? null : 0));
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
  const [searchValue, setSearchValue] = React.useState("");
  const [statusCountList, setStatusCountList] = React.useState<Array<number | null>>(emptyStatusCountList);
  const { state, setState } = useBillContext();
  const authContext = useAuth();
  // Local function **************************
  const countOrders = React.useCallback((orders: orderInfo_t[]) => {
    const countByStatus = new Map<billStatus_e, number>();
    orders.forEach((order) => {
      countByStatus.set(order.status, (countByStatus.get(order.status) ?? 0) + 1);
    });

    return tabStatusList.map((status, index) =>
      index === completedTabIndex ? null : countByStatus.get(status) ?? 0,
    );
  }, []);

  const updateOrderStatusCounts = React.useCallback(
    async (value?: string) => {
      const keyword = value?.trim();

      if (!keyword) {
        const res = await billWithRetry_f.getOrderStatusCounts(authContext);
        const countByStatus = new Map<billStatus_e, number>();
        if (res.status === "success") {
          res.result?.forEach((item) => countByStatus.set(item.status, item.count));
        }

        return tabStatusList.map((status, index) =>
          index === completedTabIndex ? null : countByStatus.get(status) ?? 0,
        );
      }

      const [customerRes, orderRes] = await Promise.all([
        billWithRetry_f.searchOrders(authContext, {
          customerID: keyword,
        }),
        billWithRetry_f.searchOrders(authContext, {
          orderID: keyword,
        }),
      ]);

      const orderMap = new Map<string, orderInfo_t>();
      if (customerRes.status === "success") {
        customerRes.result?.forEach((order) => orderMap.set(order.id, order));
      }
      if (orderRes.status === "success") {
        orderRes.result?.forEach((order) => orderMap.set(order.id, order));
      }

      return countOrders(Array.from(orderMap.values()));
    },
    [authContext, countOrders],
  );

  const updateOrderList = React.useCallback(
    async (status: billStatus_e, value?: string) => {
      const keyword = value?.trim();

      if (!keyword) {
        const res = await billWithRetry_f.getOrdersByStatus(authContext, status);
        return res.status === "success" ? res.result ?? [] : [];
      }

      const [customerRes, orderRes] = await Promise.all([
        billWithRetry_f.searchOrders(authContext, {
          customerID: keyword,
          status,
        }),
        billWithRetry_f.searchOrders(authContext, {
          orderID: keyword,
          status,
        }),
      ]);

      const orderMap = new Map<string, orderInfo_t>();
      if (customerRes.status === "success") {
        customerRes.result?.forEach((order) => orderMap.set(order.id, order));
      }
      if (orderRes.status === "success") {
        orderRes.result?.forEach((order) => orderMap.set(order.id, order));
      }

      return Array.from(orderMap.values());
    },
    [authContext],
  );

  const onSerch = (value: string) => {
    setSearchValue(value);
  };
  // Effect **********************************
  React.useEffect(() => {
    let isActive = true;
    const status = tabStatusList[tab];

    async function fetchOrders() {
      const [orders, statusCounts] = await Promise.all([
        updateOrderList(status, searchValue),
        updateOrderStatusCounts(searchValue),
      ]);
      if (!isActive) return;

      setStatusCountList(statusCounts);
      setState((prev) => ({
        ...prev,
        filter: tab,
        orderList: orders,
      }));
    }

    fetchOrders().catch((err) => {
      console.log("fetchOrders err", err);
      if (isActive) {
        setStatusCountList(emptyStatusCountList());
        setState((prev) => ({ ...prev, filter: tab, orderList: [] }));
      }
    });

    return () => {
      isActive = false;
    };
  }, [searchValue, setState, state.trigger_updateOrderList, tab, updateOrderList, updateOrderStatusCounts]);

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
        placeholder="รหัสลูกค้า หรือ รหัสคำสั่งซื้อ"
        maxWidth="650px"
        onSubmit={onSerch}
      />  
      <TabBox
        gotoTop={state.triger_gotoTop}
        list={["แพ็คสินค้า", "พร้อมจัดส่ง", "จัดการบิล", "รอชำระเงิน", "เสร็จสิ้น"]}
        height="calc(100vh - 200px)"
        alignItems="center"
        onClick={setTab}
        valueList={statusCountList}
        value={tab}
        maxWidth="1280px"
      >
        {props.children}
      </TabBox>
    </Box>
  );
};

export default OrderListHeader;
