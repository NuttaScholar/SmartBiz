import * as React from "react";
import { stockFilter_e } from "../context/StockContext";
import { useStockContext } from "../hooks/useStockContex";
import StatusPanel, { listStatus_t } from "../../../component/Organisms/StatusPanal";

const StockStatus: React.FC = () => {
  const { state, setState } = useStockContext();
  const selectFilter = (filter: stockFilter_e) => {
    setState((previous) => ({ ...previous, filter }));
  };

  const isMaterial = [
    stockFilter_e.material,
    stockFilter_e.materialLow,
    stockFilter_e.materialOut,
  ].includes(state.filter);
  const isAnother = [
    stockFilter_e.another,
    stockFilter_e.anotherLow,
    stockFilter_e.anotherOut,
    stockFilter_e.anotherPreOrder,
  ].includes(state.filter);

  const allFilter = isMaterial
    ? stockFilter_e.material
    : isAnother
      ? stockFilter_e.another
      : stockFilter_e.stock;
  const total = isMaterial
    ? state.status?.materialTotal
    : isAnother
      ? state.status?.anotherTotal
      : state.status?.stockTotal;
  const lowFilter = isMaterial
    ? stockFilter_e.materialLow
    : isAnother
      ? stockFilter_e.anotherLow
      : stockFilter_e.stockLow;
  const outFilter = isMaterial
    ? stockFilter_e.materialOut
    : isAnother
      ? stockFilter_e.anotherOut
      : stockFilter_e.stockOut;
  const low = isMaterial
    ? state.status?.materialLow
    : isAnother
      ? state.status?.anotherLow
      : state.status?.stockLow;
  const out = isMaterial
    ? state.status?.materialOut
    : isAnother
      ? state.status?.anotherOut
      : state.status?.stockOut;

  const list: listStatus_t = [
    { label: "ทั้งหมด", id: allFilter, color_value: "primary", onClick: () => selectFilter(allFilter) },
  ];
  const values = [total];

  if (!isMaterial) {
    const preOrderFilter = isAnother
      ? stockFilter_e.anotherPreOrder
      : stockFilter_e.stockPreOrder;
    list.push({
      label: "PreOrder",
      id: preOrderFilter,
      color_value: "warning",
      onClick: () => selectFilter(preOrderFilter),
    });
    values.push(isAnother ? state.status?.anotherPreOrder : state.status?.stockPreOrder);
  }

  list.push(
    { label: "หมด", id: outFilter, color_value: "error", onClick: () => selectFilter(outFilter) },
    { label: "ใกล้หมด", id: lowFilter, color_value: "info", onClick: () => selectFilter(lowFilter) },
  );
  values.push(out, low);

  return <StatusPanel list={list} state={state.filter} value={values} />;
};

export default StockStatus;
