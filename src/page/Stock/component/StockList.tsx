import * as React from "react";
import Box from "@mui/material/Box";
import CardProduct from "../../../component/Organisms/CardProduct";
import { useStockContext } from "../hooks/useStockContex"; 
//*************************************************
// Interface
//*************************************************

//*************************************************
// Function
//*************************************************
const StockList: React.FC = () => {
  // Hook ************************************
  const { state } = useStockContext();
  // Local function ************************** 

  // Effect **********************************  
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        width: "100%",
      }}
    >
      {state.productList?.map((product, index) => (
        <CardProduct
          type={product.type}
          key={index}
          value={product}
          maxWidth="400px"
        />
      ))}
    </Box>
  );
};

export default StockList;
