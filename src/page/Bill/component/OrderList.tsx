import * as React from "react";
import Box from "@mui/material/Box";
import CardProduct from "../../../component/Organisms/CardProduct";
import { productInfo_t } from "../../../API/StockService/type";
import { useBillContext } from "../hooks/useBillContex";
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
const OrderList: React.FC<myProps> = (props) => {
  // Hook ************************************
  const { state } = useBillContext();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        width: "100%",
      }}
    >
      
    </Box>
  );
};

export default OrderList;
