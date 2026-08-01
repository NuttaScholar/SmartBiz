import StatusPanel, {
  listStatus_t,
} from "../../../component/Organisms/StatusPanal";
import { billStatus_e } from "../../../enum";
import { useBillContext } from "../hooks/useBillContex";
//*************************************************
// Component
//*************************************************
const OrderStatus: React.FC = () => {
  // Hook ************************************
  const { state, setState } = useBillContext();
  // Local function **************************
  const onClickCard = (filter: billStatus_e) => {
    setState({ ...state, filter: filter });
  };
  // Local Value **************************
  const list: listStatus_t = [
    {
      label: "เตรียมสินค้า",
      id: billStatus_e.PrepareProduct,
      color_value: "error",
      onClick: () => onClickCard(billStatus_e.PrepareProduct),
    },
    {
      label: "ต้องจัดส่ง",
      id: billStatus_e.PrepareShipment,
      color_value: "error",
      onClick: () => onClickCard(billStatus_e.PrepareShipment),
    },
    {
      label: "จัดการบิล",
      id: billStatus_e.Billing,
      color_value: "info",
      onClick: () => onClickCard(billStatus_e.Billing),
    },
  ];

  return <StatusPanel list={list} state={state.filter} />;
};

export default OrderStatus;
