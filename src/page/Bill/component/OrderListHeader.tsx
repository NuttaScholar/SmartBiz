import * as React from "react";
import Box from "@mui/material/Box";
import TabBox from "../../../component/Atoms/TabBox";
import { productType_e } from "../../../component/Organisms/CardProduct";
import FieldSearch from "../../../component/Molecules/FieldSearch";
import { billStatus_e, stockStatus_e } from "../../../enum";
import { useBillContext } from "../hooks/useBillContex";
import { orderInfo_t } from "../../../API/BillService/type";
//*************************************************
// Data Set for test
//*************************************************
const dataSet: orderInfo_t = {
  id: "123456",
  customer: "NuttaScholar",
  total: 15000,
  date: new Date(),
  status: billStatus_e.completed,
  list: [
    {
      id: "1",
      name: "Product A",
      type: productType_e.merchandise,
      img: "http://192.168.1.47:9000/product/01B002_e53564ef3cfd0789",
      status: stockStatus_e.normal,
    },
    {
      id: "2",
      name: "Product B",
      type: productType_e.material,
      img: "http://192.168.1.47:9000/product/01B003_c3dab022661fa67c",
      status: stockStatus_e.normal,
    },
    {
      id: "3",
      name: "Product C",
      type: productType_e.another,
      img: "http://192.168.1.47:9000/product/01B004_66e4bb848dd06e6f",
      status: stockStatus_e.normal,
    },
    {
      id: "4",
      name: "Product D",
      type: productType_e.merchandise,
      img: "http://192.168.1.47:9000/product/01B002_e53564ef3cfd0789",
      status: stockStatus_e.normal,
    },
    {
      id: "5",
      name: "Product E",
      type: productType_e.material,
      img: "http://192.168.1.47:9000/product/01B002_e53564ef3cfd0789",
      status: stockStatus_e.normal,
    },
  ],
};
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
  const {state, setState} = useBillContext();
  // Local function **************************
 
  // Effect **********************************
  React.useEffect(()=>{
    setState({...state, orderList:[dataSet, dataSet, dataSet]})
  },[]);
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
        gotoTop={state.triger_gotoTop}
        list={["แพ็คสินค้า", "พร้อมจัดส่ง", "จัดการบิล", "เสร็จสิ้น"]}
        valueList={[1,2]}
        height="calc(100vh - 200px)"
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
