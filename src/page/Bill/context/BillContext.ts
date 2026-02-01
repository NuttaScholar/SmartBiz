// src/context/AuthContext.tsx
import { createContext } from "react";

export enum orderStatus_e {
  prepare,
  ready2Ship,
  checkBill,
}
export enum billDialog_e{
  none,
}
export type billState_t = {
  filter: orderStatus_e;
  dialogOpen: billDialog_e;
};
export type BillContext_t = {
  state: billState_t;
  setState: (state: billState_t) => void;
};
export const BillDefaultState: billState_t = {
  filter: orderStatus_e.prepare,
  dialogOpen: billDialog_e.none,
};
export const BillContext = createContext<BillContext_t | undefined>(
  undefined
);
BillContext.displayName = "BillContext";
