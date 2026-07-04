import { createTheme } from "@mui/material";

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

export default theme;
