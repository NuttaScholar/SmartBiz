import * as React from "react";
import Box from "@mui/material/Box";
import TabBox from "../../../component/Atoms/TabBox";
import { productType_e } from "../../../component/Organisms/CardProduct";
import FieldSearch from "../../../component/Molecules/FieldSearch";
import { queryProduct_t } from "../../../API/StockService/type";
import { stockStatus_e } from "../../../enum";
import { ErrorString } from "../../../function/Enum";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useBillContext } from "../hooks/useBillContex";
import { orderStatus_e } from "../context/BillContext";
//*********************************************
// Data Set
//*********************************************

//*************************************************
// Interface
//*************************************************
interface myProps {
  children?: React.ReactNode;

}
//*************************************************
// Function
//*************************************************
const OrderListHeader: React.FC<myProps> = (props) => {
  // Hook ************************************
  const [tab, setTab] = React.useState(0);

  // Local function **************************
 
  // Effect **********************************
  
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 2,
        gap: 1,
      }}
    >
      <FieldSearch
        placeholder="ชื่อลูกค้า"
        maxWidth="650px"
      />
      <TabBox
        list={["แพ็คสินค้า", "พร้อมจัดส่ง", "จัดการบิล", "เสร็จสิ้น"]}
        valueList={[1,2]}
        height="calc(100vh - 150px)"
        alignItems="center"
        onClick={setTab}
        value={tab}
        maxWidth="1280px"
      >
        {props.children}
      </TabBox>
    </Box>
  );
};

export default OrderListHeader;
