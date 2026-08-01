// src/context/AuthContext.tsx
import { createContext, Dispatch, SetStateAction } from "react";
import { orderInfo_t, orderInfoForm_t } from "../../../API/BillService/type";
import { productInfo_t } from "../../../API/StockService/type";
import { billStatus_e, orderSource_e } from "../../../enum";

export enum billDialog_e{
  none,
  detail,
  editForm,
}
export type billState_t = {
  filter: billStatus_e;
  dialogOpen: billDialog_e;
  orderList?: orderInfo_t[];
  merchList?: productInfo_t[];
  indexList?: number;
  billForm?: orderInfoForm_t;
  triger_gotoTop?: number;
  trigger_updateOrderList?: number;
  isPaymentConfirmationTab?: boolean;
  sourceFilter: orderSource_e;
  containerRef?: React.RefObject<HTMLDivElement>;
};
export type BillContext_t = {
  state: billState_t;
  setState: Dispatch<SetStateAction<billState_t>>;
};
export const BillDefaultState: billState_t = {
  filter: billStatus_e.PrepareProduct,
  sourceFilter: orderSource_e.Direct,
  dialogOpen: billDialog_e.none,
};
export const BillContext = createContext<BillContext_t | undefined>(
  undefined
);
BillContext.displayName = "BillContext";
