import { useContext } from "react";
import { StockContext } from "../context/StockContext";


export const useStockContext = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error("useStockContext must be used within an StockProvider");
  }
  return context;
};