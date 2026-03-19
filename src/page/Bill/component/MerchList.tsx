import * as React from "react";
import Box from "@mui/material/Box";
import CardProduct from "../../../component/Organisms/CardProduct";
import { useBillContext } from "../hooks/useBillContex";
import { productInfo_t } from "../../../API/StockService/type";
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
const MerchList: React.FC<myProps> = (props) => {
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
      {state.merchList?.map((product, index) => (
        <CardProduct
          type={product.type}
          key={index}
          value={{ ...product, img: product.img }}
          maxWidth="400px"
          variant={props.variant}
          onClick={props.onClick}          
        />
      ))}
    </Box>
  );
};

export default MerchList;
