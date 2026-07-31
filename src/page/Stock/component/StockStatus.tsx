import * as React from "react";
import { stockFilter_e } from "../context/StockContext";
import { useStockContext } from "../hooks/useStockContex";
import StatusPanel, { listStatus_t } from "../../../component/Organisms/StatusPanal";

//*************************************************
// Interface
//*************************************************

//*************************************************
// Component
//*************************************************
const StockStatus: React.FC = () => {
  // Hook ************************************
  const { state, setState } = useStockContext();
  // Local function **************************
  const onClickCard = (filter: stockFilter_e) => {
    setState({ ...state, filter: filter });
  };
  // Local Value **************************
  const list: listStatus_t = [
    {
      label: "สินค้าหมด",
      id: stockFilter_e.stockOut,
      color_value: "error",
      onClick: () => onClickCard(stockFilter_e.stockOut),
    },
    {
      label: "วัตถุดิบหมด",
      id: stockFilter_e.materialOut,
      color_value: "error",
      onClick: () => onClickCard(stockFilter_e.materialOut),
    },
    {
      label: "สินค้าอื่นๆ หมด",
      id: stockFilter_e.anotherOut,
      color_value: "error",
      onClick: () => onClickCard(stockFilter_e.anotherOut),
    },
    {
      label: "สินค้าใกล้หมด",
      id: stockFilter_e.stockLow,
      color_value: "info",
      onClick: () => onClickCard(stockFilter_e.stockLow),
    },
    {
      label: "วัตถุดิบใกล้หมด",
      id: stockFilter_e.materialLow,
      color_value: "info",
      onClick: () => onClickCard(stockFilter_e.materialLow),
    },    
    {
      label: "สินค้าอื่นๆ ใกล้หมด",
      id: stockFilter_e.anotherLow,
      color_value: "info",
      onClick: () => onClickCard(stockFilter_e.anotherLow),
    },
  ];
  const stockOut = state.status ? state.status.stockOut : undefined;
  const materialOut = state.status ? state.status.materialOut : undefined;
  const stockLow = state.status ? state.status.stockLow : undefined;
  const materialLow = state.status ? state.status.materialLow : undefined;
  const anotherOut = state.status ? state.status.anotherOut : undefined;
  const anotherLow = state.status ? state.status.anotherLow : undefined;
  return (
    <StatusPanel
      list={list}
      state={state.filter}
      value={[
        stockOut,
        materialOut,
        anotherOut,
        stockLow,
        materialLow,        
        anotherLow,
      ]}
    />
  );
};    

export default StockStatus;
