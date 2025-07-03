import "./App.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Page_Access from "./page/Access";
import Page_Login from "./page/Login";
import Page_Bill from "./page/Bill";
import Page_Cadit from "./page/Cadit";
import Page_CheckIn from "./page/CheckIn";
import Page_Stock from "./page/Stork";
import Page_NotFound from "./page/NotFound";
import Page_SetUser from "./page/SetUser";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { createTheme, ThemeProvider } from "@mui/material";
import "@fontsource/kanit/300.css";
import "@fontsource/kanit/400.css";
import "@fontsource/kanit/500.css";
import "@fontsource/kanit/700.css";
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
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Page_Login />} />
            <Route path="/access" element={<Page_Access />} />
            <Route path="/login" element={<Page_Login />} />
            <Route path="/bill" element={<Page_Bill />} />
            <Route path="/cadit" element={<Page_Cadit />} />
            <Route path="/checkIn" element={<Page_CheckIn />} />
            <Route path="/stock" element={<Page_Stock />} />
            <Route path="/setuser" element={<Page_SetUser />} />
            <Route path="*" element={<Page_NotFound />} />
          </Routes>
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
