import "./App.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Page_Access from "./page/Access/Access";
import Page_Login from "./page/Login";
import Page_Bill from "./page/Bill/Bill";
import Page_Cadit from "./page/Cadit";
import Page_CheckIn from "./page/CheckIn";
import Page_NotFound from "./page/NotFound";
import Page_SetUser from "./page/SetUser";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { createTheme, ThemeProvider } from "@mui/material";
import "@fontsource/kanit/300.css";
import "@fontsource/kanit/400.css";
import "@fontsource/kanit/500.css";
import "@fontsource/kanit/700.css";
import { AuthProvider } from "./context/AuthContext";
import Page_SetPass from "./page/SetPass";
import Page_AccessSearch from "./page/Access/page/AccessSearch";
import Page_Stock from "./page/Stock/Stock";
import Page_StockIn from "./page/Stock/page/StockIn";
import Page_StockOut from "./page/Stock/page/StockOut";
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
            <Routes>
              <Route path="/" element={<Page_Login />} />
              <Route path="/access">
                <Route index element={<Page_Access />} />
                <Route path="search" element={<Page_AccessSearch />} />
              </Route>
              <Route path="/login" element={<Page_Login />} />
              <Route path="/bill" element={<Page_Bill />} />
              <Route path="/cadit" element={<Page_Cadit />} />
              <Route path="/checkIn" element={<Page_CheckIn />} />
              <Route path="/stock">
                <Route index element={<Page_Stock />} />
                <Route path="in" element={<Page_StockIn />} />
                <Route path="out" element={<Page_StockOut />} />
              </Route>
              <Route path="/setuser" element={<Page_SetUser />} />
              <Route path="/setpass" element={<Page_SetPass />} />
              <Route path="*" element={<Page_NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
