import * as React from "react";
import Box from "@mui/material/Box";
import TabBox from "../../../component/Atoms/TabBox";
import { productType_e } from "../../../component/Organisms/CardProduct";
import { useStockContext } from "../hooks/useStockContex";
import { stockFilter_e } from "../context/StockContext";
import FieldSearch from "../../../component/Molecules/FieldSearch";
import { queryProduct_t } from "../../../API/StockService/type";
import stockWithRetry_f from "../lib/stockWithRetry";
import { stockStatus_e } from "../../../enum";
import { ErrorString } from "../../../function/Enum";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
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
const StockListHeader: React.FC<myProps> = (props) => {
  // Hook ************************************
  const authContext = useAuth();
  const nevigate = useNavigate();
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
    let query: queryProduct_t = { type: productType_e.material };
    switch (state.filter) {
      case stockFilter_e.another:
        query = { type: productType_e.another };
        break;
      case stockFilter_e.materialLow:
        query.status = stockStatus_e.stockLow;
        break;
      case stockFilter_e.materialOut:
        query.status = stockStatus_e.stockOut;
        break;
      case stockFilter_e.stock:
        query.type = productType_e.merchandise;
        break;
      case stockFilter_e.stockLow:
        query = {
          type: productType_e.merchandise,
          status: stockStatus_e.stockLow,
        };
        break;
      case stockFilter_e.stockOut:
        query = {
          type: productType_e.merchandise,
          status: stockStatus_e.stockOut,
        };
    }
    console.log("query", query)
    stockWithRetry_f
      .getProduct(authContext, query)
      .then((res) => {
        if (res.status === "success" && res.result !== undefined) {
          res.result && setState({ ...state, productList: res.result });
        } else {
          res.errCode && alert(ErrorString(res.errCode));
        }
      })
      .catch((err) => {
        nevigate("/")
        console.log(err);
      });
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
  }, [state.filter, state.reface]);
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <FieldSearch placeholder="ชื่อสินค้า" maxWidth="650px" onSubmit={onSearch} />
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
