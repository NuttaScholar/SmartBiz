import * as React from "react";
import Box from "@mui/material/Box";
import CardProduct, { productInfo_t } from "../../../component/Organisms/CardProduct";
import { useStockContext } from "../hooks/useStockContex"; 
//*************************************************
// Interface
//*************************************************
interface myProps {
  variant?: "readonly" | "editable" | "deleteable";
  onClick?: (edit: boolean, value: productInfo_t) => void;
}
//*************************************************
// Function
//*************************************************
const StockList: React.FC<myProps> = (props) => {
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
          variant={props.variant}
          onClick={props.onClick}
        />
      ))}
    </Box>
  );
};

export default StockList;
