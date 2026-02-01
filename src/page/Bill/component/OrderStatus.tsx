import StatusPanel, {
  listStatus_t,
} from "../../../component/Organisms/StatusPanal";
import { orderStatus_e } from "../context/BillContext";
import { useBillContext } from "../hooks/useBillContex";
//*************************************************
// Component
//*************************************************
const OrderStatus: React.FC = () => {
  // Hook ************************************
  const { state, setState } = useBillContext();
  // Local function **************************
  const onClickCard = (filter: orderStatus_e) => {
    setState({ ...state, filter: filter });
  };
  // Local Value **************************
  const list: listStatus_t = [
    {
      label: "เตรียมสินค้า",
      id: orderStatus_e.prepare,
      color_value: "error",
      onClick: () => onClickCard(orderStatus_e.prepare),
    },
    {
      label: "ต้องจัดส่ง",
      id: orderStatus_e.ready2Ship,
      color_value: "error",
      onClick: () => onClickCard(orderStatus_e.ready2Ship),
    },
    {
      label: "จัดการบิล",
      id: orderStatus_e.checkBill,
      color_value: "info",
      onClick: () => onClickCard(orderStatus_e.checkBill),
    },
  ];

  return <StatusPanel list={list} state={state.filter} />;
};

export default OrderStatus;
