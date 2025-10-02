import * as React from "react";
import Box from "@mui/material/Box";
import CardProduct from "../../../component/Organisms/CardProduct";
import { useStockContext } from "../hooks/useStockContex";
import urlbase_c from "../../../constants/urlbase";
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
const StockList: React.FC<myProps> = (props) => {
  // Hook ************************************
  const { state } = useStockContext();

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
          value={{ ...product, img: `${urlbase_c.minio}/${product.img}` }}
          maxWidth="400px"
          variant={props.variant}
          onClick={props.onClick}
        />
      ))}
    </Box>
  );
};

export default StockList;
