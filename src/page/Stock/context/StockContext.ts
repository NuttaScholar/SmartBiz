// src/context/AuthContext.tsx
import { createContext } from "react";
import { productInfo_t } from "../../../API/StockService/type";

export enum stockFilter_e {
  stock,
  stockLow,
  stockOut,
  material,
  materialLow,
  materialOut,
  another,
}
export enum stockDialog_e {
  none,
  createForm,
  editForm,
  logs,
}
export type billForm_t = {
  img?: File;
  description?: string;
};
export type stock_t = {
  filter: stockFilter_e;
  productList?: productInfo_t[];
  indexList?: number;
  dialogOpen: stockDialog_e;
  productForm?: productInfo_t;
  billForm?: billForm_t;
};
export type StockContext_t = {
  state: stock_t;
  setState: (state: stock_t) => void;
};
export const StockDefaultState: stock_t = {
  filter: stockFilter_e.stock,
  dialogOpen: stockDialog_e.none,
};
export const StockContext = createContext<StockContext_t | undefined>(
  undefined
);
StockContext.displayName = "StockContext";
