import * as React from "react";
import Box from "@mui/material/Box";
import TabBox from "../../../component/Atoms/TabBox";
import {
  productInfo_t,
  productType_e,
} from "../../../component/Organisms/CardProduct";
import { useStockContext } from "../hooks/useStockContex";
import { stockFilter_e } from "../context/StockContext";
import FieldSearch from "../../../component/Molecules/FieldSearch";
//*********************************************
// Data Set
//*********************************************
const sampleProducts: productInfo_t[] = [
  {
    id: "1",
    type: productType_e.merchandise,
    name: "Merchandise",
    price: 0,
    img: "",
    amount: 0,
    description: "ถ้วยน้ำพลาสติกใส",
  },
  {
    id: "1",
    type: productType_e.material,
    name: "Material",
    price: 0,
    img: "",
    amount: 0,
    description: "ถ้วยน้ำพลาสติกใส",
  },
  {
    id: "1",
    type: productType_e.another,
    name: "Another",
    price: 0,
    img: "",
    amount: 0,
    description: "ถ้วยน้ำพลาสติกใส",
  },
];
//*************************************************
// Interface
//*************************************************
interface myProps {
  children?: React.ReactNode;
}
//*************************************************
// Function
//*************************************************
const StockListHeader: React.FC<myProps> = (props) => {
  // Hook ************************************
  const { state, setState } = useStockContext();
  const [tab, setTab] = React.useState(0);
  // Local function **************************
  const handleTabChange = (newTab: number) => {
    switch (newTab) {
      case 0:
        setState({ ...state, filter: stockFilter_e.stock });
        break;
      case 1:
        setState({ ...state, filter: stockFilter_e.material });
        break;
      case 2:
        setState({ ...state, filter: stockFilter_e.another });
        break;
      default:
        setState({ ...state, filter: stockFilter_e.stock });
    }
  };
  const onSearch = (value: string) => {
    console.log(value);
    switch (state.filter) {
      case stockFilter_e.stock:
      case stockFilter_e.stockLow:
      case stockFilter_e.stockOut:
        setState({ ...state, filter: stockFilter_e.stock });
        break;
      case stockFilter_e.material:
      case stockFilter_e.materialLow:
      case stockFilter_e.materialOut:
        setState({ ...state, filter: stockFilter_e.material });
        break;
      default:
        setState({ ...state, filter: stockFilter_e.another });
        break;
    }
  };
  const reloadList = () => {
    setState({ ...state, productList: sampleProducts });
  };
  // Effect **********************************
  React.useEffect(() => {
    switch (state.filter) {
      case stockFilter_e.stock:
      case stockFilter_e.stockLow:
      case stockFilter_e.stockOut:
        setTab(0);
        break;
      case stockFilter_e.material:
      case stockFilter_e.materialLow:
      case stockFilter_e.materialOut:
        setTab(1);
        break;
      case stockFilter_e.another:
        setTab(2);
        break;
      default:
        setTab(0);
        break;
    }
    reloadList();
  }, [state.filter]);
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <FieldSearch maxWidth="650px" onSubmit={onSearch} />
      <TabBox
        list={["สินค้า", "วัตถุดิบ", "สินค้าขายพ่วง"]}
        height="calc(100vh - 150px)"
        alignItems="center"
        onChange={handleTabChange}
        value={tab}
        maxWidth="1280px"
      >
        {props.children}
      </TabBox>
    </Box>
  );
};

export default StockListHeader;
