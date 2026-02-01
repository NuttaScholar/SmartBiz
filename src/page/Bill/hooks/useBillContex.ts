import { useContext } from "react";
import { BillContext } from "../context/BillContext";


export const useBillContext = () => {
  const context = useContext(BillContext);
  if (!context) {
    throw new Error("useBillContext must be used within an BillProvider");
  }
  return context;
};