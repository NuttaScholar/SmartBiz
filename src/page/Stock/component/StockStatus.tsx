import * as React from "react";
import Box from "@mui/material/Box";
import CardValue from "../../../component/Atoms/CardValue";
import { stockFilter_e } from "../context/StockContext";
import { useStockContext } from "../hooks/useStockContex";
//*********************************************
// Style
//*********************************************

//*************************************************
// Interface
//*************************************************

//*************************************************
// Function
//*************************************************
const StockStatus: React.FC = () => {
  // Hook ************************************
  const { state, setState } = useStockContext();
  // Local function **************************
  const onClickCard = (filter: stockFilter_e) => {
    setState({ ...state, filter: filter });
  }
  const maxWidth = "150px";
  return (
    <Box
      sx={{
        my: "8px",
        width: "100%",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <CardValue
        label="สินค้าหมด"
        selected={state.filter === stockFilter_e.stockOut}
        value={2}
        color_value="error"
        maxWidth={maxWidth}
        onClick={() => onClickCard(stockFilter_e.stockOut)}
      />
      <CardValue
        label="วัตถุดิบหมด"
        selected={state.filter === stockFilter_e.materialOut}
        value={2}
        color_value="error"
        maxWidth={maxWidth}
        onClick={() => onClickCard(stockFilter_e.materialOut)}
      />
      <CardValue
        label="สินค้าใกล้หมด"
        selected={state.filter === stockFilter_e.stockLow}
        value={2}
        color_value="info"
        maxWidth={maxWidth}
        onClick={() => onClickCard(stockFilter_e.stockLow)}
      />      
      <CardValue
        label="วัตถุดิบใกล้หมด"
        selected={state.filter === stockFilter_e.materialLow}
        value={2}
        color_value="info"
        maxWidth={maxWidth}
        onClick={() => onClickCard(stockFilter_e.materialLow)}
      />
    </Box>
  );
};

export default StockStatus;
