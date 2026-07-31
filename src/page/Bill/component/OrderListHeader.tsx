import * as React from "react";
import Box from "@mui/material/Box";
import TabBox from "../../../component/Atoms/TabBox";
import FieldSearch from "../../../component/Molecules/FieldSearch";
import { billStatus_e } from "../../../enum";
import { useBillContext } from "../hooks/useBillContex";
import { orderInfo_t } from "../../../API/BillService/type";
import billWithRetry_f from "../lib/billWithRetry";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  redirectToLogin,
  redirectToLoginOnAuthError,
  redirectToLoginOnThrownAuthError,
} from "../../../lib/authRedirect";
import {
  listPaymentConfirmationOrders,
  StorefrontApiError,
} from "../../../API/StorefrontService/Storefront";
import type { StorefrontOrder } from "../../Storefront/type";
import { storefrontAdminWithRetry } from "../../Customer/lib/storefrontAdminWithRetry";
import { productType_e, stockStatus_e } from "../../../enum";

const tabStatusList = [
  billStatus_e.PrepareProduct,
  billStatus_e.PrepareShipment,
  billStatus_e.Billing,
  billStatus_e.WaitingPayment,
  billStatus_e.Completed,
];

const completedTabIndex = tabStatusList.indexOf(billStatus_e.Completed);
const paymentConfirmationTabIndex = tabStatusList.length;

function emptyStatusCountList() {
  return [
    ...tabStatusList.map((_, index) =>
      index === completedTabIndex ? null : 0,
    ),
    0,
  ];
}

function matchesSearch(order: StorefrontOrder, keyword?: string) {
  const normalizedKeyword = keyword?.trim().toLowerCase();
  if (!normalizedKeyword) return true;
  return order.customerID.toLowerCase().includes(normalizedKeyword)
    || order.id.toLowerCase().includes(normalizedKeyword);
}

function toBillOrder(order: StorefrontOrder): orderInfo_t {
  return {
    id: order.id,
    customerID: order.customerID,
    customer: order.customerID,
    date: new Date(order.date),
    total: order.totalAmount,
    status: billStatus_e.WaitingPayment,
    list: order.items.map((item) => ({
      id: item.productID,
      name: item.name,
      img: item.img,
      type: productType_e.merchandise,
      status: stockStatus_e.normal,
      price: item.priceOriginal,
      amount: item.quantity,
      total: item.priceAfterDiscount * item.quantity,
      percentDiscount: item.discountPercent,
      priceAfterDiscount: item.priceAfterDiscount,
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
  const [searchValue, setSearchValue] = React.useState("");
  const [statusCountList, setStatusCountList] = React.useState<Array<number | null>>(emptyStatusCountList);
  const { state, setState } = useBillContext();
  const authContext = useAuth();
  const navigate = useNavigate();
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

  const getPaymentConfirmationOrders = React.useCallback(
    async (value?: string) => {
      const orders = await storefrontAdminWithRetry(
        authContext,
        listPaymentConfirmationOrders,
      );
      return orders.filter((order) => matchesSearch(order, value));
    },
    [authContext],
  );

  const updateOrderStatusCounts = React.useCallback(
    async (value?: string) => {
      const keyword = value?.trim();

      if (!keyword) {
        const res = await billWithRetry_f.getOrderStatusCounts(authContext);
        const countByStatus = new Map<billStatus_e, number>();
        if (res.success) {
          res.data?.forEach((item) => countByStatus.set(item.status, item.count));
        } else if (redirectToLoginOnAuthError(navigate, res.errCode)) {
          return emptyStatusCountList();
        }

        const pendingOrders = await getPaymentConfirmationOrders();
        return [...tabStatusList.map((status, index) =>
          index === completedTabIndex ? null : countByStatus.get(status) ?? 0,
        ), pendingOrders.length];
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
      if (customerRes.success) {
        customerRes.data?.forEach((order) => orderMap.set(order.id, order));
      } else if (redirectToLoginOnAuthError(navigate, customerRes.errCode)) {
        return emptyStatusCountList();
      }
      if (orderRes.success) {
        orderRes.data?.forEach((order) => orderMap.set(order.id, order));
      } else if (redirectToLoginOnAuthError(navigate, orderRes.errCode)) {
        return emptyStatusCountList();
      }

      const pendingOrders = await getPaymentConfirmationOrders(keyword);
      return [
        ...countOrders(Array.from(orderMap.values())),
        pendingOrders.length,
      ];
    },
    [authContext, countOrders, getPaymentConfirmationOrders, navigate],
  );

  const updateOrderList = React.useCallback(
    async (status: billStatus_e, value?: string) => {
      const keyword = value?.trim();

      if (!keyword) {
        const res = await billWithRetry_f.getOrdersByStatus(authContext, status);
        if (redirectToLoginOnAuthError(navigate, res.errCode)) return [];

        return res.success ? res.data ?? [] : [];
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
      if (customerRes.success) {
        customerRes.data?.forEach((order) => orderMap.set(order.id, order));
      } else if (redirectToLoginOnAuthError(navigate, customerRes.errCode)) {
        return [];
      }
      if (orderRes.success) {
        orderRes.data?.forEach((order) => orderMap.set(order.id, order));
      } else if (redirectToLoginOnAuthError(navigate, orderRes.errCode)) {
        return [];
      }

      return Array.from(orderMap.values());
    },
    [authContext, navigate],
  );

  const onSerch = (value: string) => {
    setSearchValue(value);
  };
  // Effect **********************************
  React.useEffect(() => {
    let isActive = true;
    const status = tabStatusList[tab];

    async function fetchOrders() {
      const isPaymentConfirmationTab = tab === paymentConfirmationTabIndex;
      const [orders, statusCounts] = await Promise.all([
        isPaymentConfirmationTab
          ? getPaymentConfirmationOrders(searchValue).then((items) =>
              items.map(toBillOrder),
            )
          : updateOrderList(status, searchValue),
        updateOrderStatusCounts(searchValue),
      ]);
      if (!isActive) return;

      setStatusCountList(statusCounts);
      setState((prev) => ({
        ...prev,
        filter: tab,
        isPaymentConfirmationTab,
        orderList: orders,
      }));
    }

    fetchOrders().catch((err) => {
      if (err instanceof StorefrontApiError && err.status === 401) {
        redirectToLogin(navigate);
        return;
      }
      if (redirectToLoginOnThrownAuthError(navigate, err)) return;

      if (isActive) {
        setStatusCountList(emptyStatusCountList());
        setState((prev) => ({
          ...prev,
          filter: tab,
          isPaymentConfirmationTab: tab === paymentConfirmationTabIndex,
          orderList: [],
        }));
      }
    });

    return () => {
      isActive = false;
    };
  }, [getPaymentConfirmationOrders, navigate, searchValue, setState, state.trigger_updateOrderList, tab, updateOrderList, updateOrderStatusCounts]);

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
        list={["แพ็คสินค้า", "พร้อมจัดส่ง", "จัดการบิล", "รอชำระเงิน", "เสร็จสิ้น", "ยืนยันการชำระเงิน"]}
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
