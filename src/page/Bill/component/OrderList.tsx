import * as React from "react";
import Box from "@mui/material/Box";
import { useBillContext } from "../hooks/useBillContex";
import CardOrder from "../../../component/Organisms/CardOrder";
import { orderInfo_t } from "../../../API/BillService/type";

//*************************************************
// Interface
//*************************************************
interface myProps {
  variant?: "readonly" | "editable" | "deleteable";
  onClick?: ( value: orderInfo_t) => void;
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
        gap: 1,
      }}
    >
      {state.orderList?.map((val, index)=>(
        <CardOrder key={index} value={val} maxWidth="400px" onClick={props.onClick} />
      ))}
    </Box>
  );
};

export default OrderList;
