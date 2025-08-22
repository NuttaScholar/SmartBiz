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
export type stock_t = {
  filter: stockFilter_e;
  list?: productInfo_t[];
};
export type StockContext_t = {
  state: stock_t;
  setState: (state: stock_t) => void;
};
export const StockDefaultState: stock_t = {
  filter: stockFilter_e.stock,
};
export const StockContext = createContext<StockContext_t | undefined>(
  undefined
);
StockContext.displayName = "StockContext";
