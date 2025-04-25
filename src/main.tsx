import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/kanit/300.css";
import "@fontsource/kanit/400.css";
import "@fontsource/kanit/500.css";
import "@fontsource/kanit/700.css";
import "./index.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Page_Login from "./page/Login.tsx";
import Page_Access from "./page/Access.tsx";
import Page_Bill from "./page/Bill.tsx";
import Page_Cadit from "./page/Cadit.tsx";
import Page_CheckIn from "./page/CheckIn.tsx";
import Page_Stock from "./page/Stork.tsx";
import Page_NotFound from "./page/NotFound.tsx";

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
createRoot(document.getElementById("root")!).render(
  //<StrictMode>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Routes>
            <Route path="/" element={<Page_Login />} />
            <Route path="/access" element={<Page_Access />} />
            <Route path="/login" element={<Page_Login />} />
            <Route path="/bill" element={<Page_Bill />} />
            <Route path="/cadit" element={<Page_Cadit />} />
            <Route path="/checkIn" element={<Page_CheckIn />} />
            <Route path="/stock" element={<Page_Stock />} />
            <Route path="*" element={<Page_NotFound />}/>
          </Routes>
        </LocalizationProvider>
      </BrowserRouter>
    </ThemeProvider>
  //</StrictMode>
);
