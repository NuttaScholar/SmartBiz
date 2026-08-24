import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { AuthProvider } from "./context/AuthContext";
import theme from "./theme";
import "./App.css";
import "@fontsource/kanit/300.css";
import "@fontsource/kanit/400.css";
import "@fontsource/kanit/500.css";
import "@fontsource/kanit/700.css";
import PageLoader from "./page/PageLoader";
import { orderSource_e } from "./enum";
//*********************************************
// Lazy load pages
//*********************************************
const Page_Login = lazy(() => import("./page/Login"));
const Page_Access = lazy(() => import("./page/Access/Access"));
const Page_AccessSearch = lazy(() => import("./page/Access/page/AccessSearch"));
const Page_AccessHistory = lazy(() => import("./page/Access/page/AccessHistory"));
const Page_Bill = lazy(() => import("./page/Bill/Bill"));
const Page_BillCreate = lazy(() => import("./page/Bill/page/BillCreate"));
const Page_BillOrderDetail = lazy(
  () => import("./page/Bill/page/BillDetail"),
);
const Page_BillSetDiscount = lazy(() => import("./page/Bill/page/SetDiscount"));
const Page_BillPreview = lazy(() => import("./page/Bill/page/BillPreview"));
const Page_Customer = lazy(() => import("./page/Customer/Customer"));
const Page_CustomerCreate = lazy(
  () => import("./page/Customer/page/CustomerCreate"),
);
const Page_CustomerDiscount = lazy(
  () => import("./page/Customer/page/CustomerDiscount"),
);
const Page_CheckIn = lazy(() => import("./page/CheckIn"));
const Page_NotFound = lazy(() => import("./page/NotFound"));
const Page_SetUser = lazy(() => import("./page/SetUser"));
const Page_SetPass = lazy(() => import("./page/SetPass"));
const Page_Stock = lazy(() => import("./page/Stock/Stock"));
const Page_StockIn = lazy(() => import("./page/Stock/page/StockIn"));
const Page_StockOut = lazy(() => import("./page/Stock/page/StockOut"));
const Page_StockAudit = lazy(() => import("./page/Stock/page/StockAudit"));
const Page_StockHistory = lazy(() => import("./page/Stock/page/StockHistory"));
const PageDemo = lazy(() => import("./page/test"));


//*********************************************
// Main Function
//*********************************************
function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AuthProvider>
          <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Page_Login />} />
              <Route path="/access">
                <Route index element={<Page_Access />} />
                <Route path="search" element={<Page_AccessSearch />} />
                <Route path="history" element={<Page_AccessHistory />} />
              </Route>
              <Route path="/login" element={<Page_Login />} />
              <Route path="/bill">
                <Route index element={<Navigate to="direct" replace />} />
                <Route
                  path="online"
                  element={
                    <Page_Bill
                      key={orderSource_e.Online}
                      source={orderSource_e.Online}
                    />
                  }
                />
                <Route
                  path="direct"
                  element={
                    <Page_Bill
                      key={orderSource_e.Direct}
                      source={orderSource_e.Direct}
                    />
                  }
                />
                <Route path="create" element={<Page_BillCreate />} />
                <Route
                  path="online/detail/:orderID"
                  element={
                    <Page_BillOrderDetail source={orderSource_e.Online} />
                  }
                />
                <Route
                  path="direct/detail/:orderID"
                  element={
                    <Page_BillOrderDetail source={orderSource_e.Direct} />
                  }
                />
                <Route path="edit/:orderID" element={<Page_BillCreate />} />
                <Route path="discount" element={<Page_BillSetDiscount />} />
                <Route path="preview" element={<Page_BillPreview />} />
                <Route path="preview/:orderID" element={<Page_BillPreview />} />
              </Route>
              <Route path="/customer">
                <Route index element={<Page_Customer />} />
                <Route path="create" element={<Page_CustomerCreate />} />
                <Route
                  path="create/:customerID"
                  element={<Page_CustomerCreate />}
                />
                <Route
                  path=":customerID/discount"
                  element={<Page_CustomerDiscount />}
                />
              </Route>
              <Route path="/checkIn" element={<Page_CheckIn />} />
              <Route path="/stock">
                <Route index element={<Page_Stock />} />
                <Route path="in" element={<Page_StockIn />} />
                <Route path="out" element={<Page_StockOut />} />
                <Route path="audit" element={<Page_StockAudit />} />
                <Route path="history/:productID" element={<Page_StockHistory />} />
              </Route>
              <Route path="/setuser" element={<Page_SetUser />} />
              <Route path="/setpass" element={<Page_SetPass />} />
              <Route path="/test" element={<PageDemo/>} />
              <Route path="*" element={<Page_NotFound />} />
            </Routes>
          </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
