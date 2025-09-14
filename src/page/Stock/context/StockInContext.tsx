// src/context/AuthContext.tsx
import { createContext } from "react";
import { productInfo_t } from "../../../component/Organisms/CardProduct";

export enum stockFilter_e {
  stock,
  stockLow,
  stockOut,
  material,
  materialLow,
  materialOut,
  another,
}
export enum stockIn_Dialog_e {
  none,

}
export type stockIn_t = {
  imgBill?: string;
  productList?: productInfo_t[];
  dialogOpen: stockIn_Dialog_e;
};
export type StockIn_Context_t = {
  state: stockIn_t;
  setState: (state: stockIn_t) => void;
};
export const StockIn_DefaultState: stockIn_t = {
  dialogOpen: stockIn_Dialog_e.none,
};
export const StockIn_Context = createContext<StockIn_Context_t | undefined>(
  undefined
);
StockIn_Context.displayName = "StockIn_Context";
