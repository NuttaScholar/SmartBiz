import * as React from "react";
import Box from "@mui/material/Box";
import CardValue from "../../../component/Atoms/CardValue";
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
  const maxWidth = "150px" ;
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
        selected
        value={2}
        color_value="error"
        maxWidth={maxWidth}
      />
      <CardValue
        label="วัตถุดิบหมด"
        value={2}
        color_value="error"
        maxWidth={maxWidth}
      />
      <CardValue
        label="สินค้าใกล้หมด"
        value={2}
        color_value="info"
        maxWidth={maxWidth}
      />      
      <CardValue
        label="วัตถุดิบใกล้หมด"
        value={2}
        color_value="info"
        maxWidth={maxWidth}
      />
    </Box>
  );
};

export default StockStatus;
