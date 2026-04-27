import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";
import "@fontsource/kanit/300.css";
import "@fontsource/kanit/400.css";
import "@fontsource/kanit/500.css";
import "@fontsource/kanit/700.css";
import PageLoader from "./page/PageLoader";
//*********************************************
// Lazy load pages
//*********************************************
const Page_Login = lazy(() => import("./page/Login"));
const Page_Access = lazy(() => import("./page/Access/Access"));
const Page_AccessSearch = lazy(() => import("./page/Access/page/AccessSearch"));
const Page_Bill = lazy(() => import("./page/Bill/Bill"));
const Page_BillCreate = lazy(() => import("./page/Bill/page/BillCreate"));
const Page_BillSetDiscount = lazy(() => import("./page/Bill/page/SetDiscount"));
const Page_BillPreview = lazy(() => import("./page/Bill/page/BillPreview"));
const Page_Cadit = lazy(() => import("./page/Cadit"));
const Page_CheckIn = lazy(() => import("./page/CheckIn"));
const Page_NotFound = lazy(() => import("./page/NotFound"));
const Page_SetUser = lazy(() => import("./page/SetUser"));
const Page_SetPass = lazy(() => import("./page/SetPass"));
const Page_Stock = lazy(() => import("./page/Stock/Stock"));
const Page_StockIn = lazy(() => import("./page/Stock/page/StockIn"));
const Page_StockOut = lazy(() => import("./page/Stock/page/StockOut"));
const PageDemo = lazy(() => import("./page/test"));


//*********************************************
// Set Theme
//*********************************************
const theme = createTheme({
  palette: {
    primary: {
      light: "#3393dc",
      main: "#0078D4",
      dark: "#005494",
      contrastText: "#fff",
    },
    secondary: {
      light: "#e6f2ff",
      main: "#E0EFFF",
      dark: "#CCDEF0",
      contrastText: "#000",
    },
  },
  typography: {
    fontFamily: "Kanit, Roboto",
  },
});
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
              </Route>
              <Route path="/login" element={<Page_Login />} />
              <Route path="/bill">
                <Route index element={<Page_Bill />} />
                <Route path="create" element={<Page_BillCreate />} />
                <Route path="discount" element={<Page_BillSetDiscount />} />
                <Route path="preview" element={<Page_BillPreview />} />
              </Route>
              <Route path="/cadit" element={<Page_Cadit />} />
              <Route path="/checkIn" element={<Page_CheckIn />} />
              <Route path="/stock">
                <Route index element={<Page_Stock />} />
                <Route path="in" element={<Page_StockIn />} />
                <Route path="out" element={<Page_StockOut />} />
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
