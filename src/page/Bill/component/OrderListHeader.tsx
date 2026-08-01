import * as React from "react";
import Box from "@mui/material/Box";
import { Divider, Tab, Tabs } from "@mui/material";
import TabBox from "../../../component/Atoms/TabBox";
import FieldSearch from "../../../component/Molecules/FieldSearch";
import { billStatus_e, orderSource_e } from "../../../enum";
import { useBillContext } from "../hooks/useBillContex";
import { orderInfo_t } from "../../../API/BillService/type";
import billWithRetry_f from "../lib/billWithRetry";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  redirectToLoginOnAuthError,
  redirectToLoginOnThrownAuthError,
} from "../../../lib/authRedirect";

type SourceFilter = orderSource_e;

type StatusTab = {
  status: billStatus_e;
  label: string;
};

const commonTabs: StatusTab[] = [
  { status: billStatus_e.PrepareProduct, label: "แพ็คสินค้า" },
  { status: billStatus_e.PrepareShipment, label: "พร้อมจัดส่ง" },
  { status: billStatus_e.Billing, label: "จัดการบิล" },
  { status: billStatus_e.WaitingPayment, label: "รอชำระเงิน" },
  { status: billStatus_e.Completed, label: "เสร็จสิ้น" },
];

const onlineTabs: StatusTab[] = [
  { status: billStatus_e.Submitted, label: "รอหลักฐาน" },
  { status: billStatus_e.PaymentNotified, label: "ยืนยันการชำระเงิน" },
  { status: billStatus_e.PrepareProduct, label: "แพ็คสินค้า" },
  { status: billStatus_e.PrepareShipment, label: "พร้อมจัดส่ง" },
  { status: billStatus_e.Completed, label: "เสร็จสิ้น" },
  { status: billStatus_e.Cancelled, label: "ยกเลิก" },
];

function tabsFor(source: SourceFilter) {
  if (source === orderSource_e.Online) return onlineTabs;
  return commonTabs;
}

interface OrderListHeaderProps {
  children?: React.ReactNode;
}

const OrderListHeader: React.FC<OrderListHeaderProps> = ({ children }) => {
  const [tab, setTab] = React.useState(0);
  const [searchValue, setSearchValue] = React.useState("");
  const [statusCountList, setStatusCountList] = React.useState<number[]>([]);
  const { state, setState } = useBillContext();
  const authContext = useAuth();
  const navigate = useNavigate();
  const source = state.sourceFilter;
  const tabs = React.useMemo(() => tabsFor(source), [source]);
  const selectedStatus = tabs[tab]?.status ?? tabs[0].status;
  const apiSource = source;
  const displayedStatusCounts = tabs.map((item, index) =>
    item.status === billStatus_e.Completed
    || item.status === billStatus_e.Cancelled
      ? null
      : (statusCountList[index] ?? 0),
  );

  const loadStatusCounts = React.useCallback(
    async (value?: string) => {
      const keyword = value?.trim();
      if (!keyword) {
        const response = await billWithRetry_f.getOrderStatusCounts(
          authContext,
          { source: apiSource },
        );
        if (redirectToLoginOnAuthError(navigate, response.errCode)) return [];

        const countByStatus = new Map<billStatus_e, number>();
        response.data?.forEach((item) =>
          countByStatus.set(item.status, item.count),
        );
        return tabs.map((item) => countByStatus.get(item.status) ?? 0);
      }

      const [customerResponse, orderResponse] = await Promise.all([
        billWithRetry_f.searchOrders(authContext, {
          customerID: keyword,
          source: apiSource,
        }),
        billWithRetry_f.searchOrders(authContext, {
          orderID: keyword,
          source: apiSource,
        }),
      ]);
      if (
        redirectToLoginOnAuthError(navigate, customerResponse.errCode)
        || redirectToLoginOnAuthError(navigate, orderResponse.errCode)
      ) {
        return [];
      }

      const orders = new Map<string, orderInfo_t>();
      customerResponse.data?.forEach((order) => orders.set(order.id, order));
      orderResponse.data?.forEach((order) => orders.set(order.id, order));
      const countByStatus = new Map<billStatus_e, number>();
      orders.forEach((order) =>
        countByStatus.set(
          order.status,
          (countByStatus.get(order.status) ?? 0) + 1,
        ),
      );
      return tabs.map((item) => countByStatus.get(item.status) ?? 0);
    },
    [apiSource, authContext, navigate, tabs],
  );

  const loadOrders = React.useCallback(
    async (status: billStatus_e, value?: string) => {
      const keyword = value?.trim();
      if (!keyword) {
        const response = await billWithRetry_f.getOrdersByStatus(
          authContext,
          status,
          apiSource,
        );
        if (redirectToLoginOnAuthError(navigate, response.errCode)) return [];
        return response.data ?? [];
      }

      const [customerResponse, orderResponse] = await Promise.all([
        billWithRetry_f.searchOrders(authContext, {
          customerID: keyword,
          status,
          source: apiSource,
        }),
        billWithRetry_f.searchOrders(authContext, {
          orderID: keyword,
          status,
          source: apiSource,
        }),
      ]);
      if (
        redirectToLoginOnAuthError(navigate, customerResponse.errCode)
        || redirectToLoginOnAuthError(navigate, orderResponse.errCode)
      ) {
        return [];
      }

      const orders = new Map<string, orderInfo_t>();
      customerResponse.data?.forEach((order) => orders.set(order.id, order));
      orderResponse.data?.forEach((order) => orders.set(order.id, order));
      return Array.from(orders.values());
    },
    [apiSource, authContext, navigate],
  );

  React.useEffect(() => {
    let active = true;

    Promise.all([
      loadOrders(selectedStatus, searchValue),
      loadStatusCounts(searchValue),
    ])
      .then(([orders, counts]) => {
        if (!active) return;
        setStatusCountList(counts);
        setState((previous) => ({
          ...previous,
          filter: selectedStatus,
          isPaymentConfirmationTab:
            selectedStatus === billStatus_e.PaymentNotified,
          orderList: orders,
        }));
      })
      .catch((error) => {
        if (redirectToLoginOnThrownAuthError(navigate, error)) return;
        if (!active) return;
        setStatusCountList(tabs.map(() => 0));
        setState((previous) => ({
          ...previous,
          filter: selectedStatus,
          orderList: [],
        }));
      });

    return () => {
      active = false;
    };
  }, [loadOrders, loadStatusCounts, navigate, searchValue, selectedStatus, setState, state.trigger_updateOrderList, tabs]);

  const changeSource = (_event: React.SyntheticEvent, nextSource: SourceFilter) => {
    navigate(`/bill/${nextSource}`);
  };

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
        onSubmit={setSearchValue}
      />
      <Box
        sx={{
          width: "100%",
          maxWidth: "1280px",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Tabs
          value={source}
          variant="scrollable"
          onChange={changeSource}
          aria-label="แหล่งที่มาของคำสั่งซื้อ"
        >
          <Tab label="หน้าร้าน Online" value={orderSource_e.Online} />
          <Divider orientation="vertical" variant="middle" flexItem />
          <Tab label="สั่งโดยตรง" value={orderSource_e.Direct} />
        </Tabs>
      </Box>
      <TabBox
        gotoTop={state.triger_gotoTop}
        list={tabs.map((item) => item.label)}
        height="calc(100vh - 240px)"
        alignItems="center"
        onClick={setTab}
        valueList={displayedStatusCounts}
        value={tab}
        maxWidth="1280px"
      >
        {children}
      </TabBox>
    </Box>
  );
};

export default OrderListHeader;
