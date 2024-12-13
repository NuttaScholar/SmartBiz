import * as React from "react";
import YearSelector_Mobile from "./Organisms/YearSelector_Mobile";
import { Box, SxProps, Theme } from "@mui/material";
import AppBar_c, { pageApp_e } from "./Organisms/AppBar_c";

//************************************************
// Style
//************************************************
const field: SxProps<Theme> = {
  display: "flex",
  bgcolor: "secondary.main",
  width: "100%",
};
//************************************************
// Type
//************************************************
type iconLabel_t = { icon?: React.ReactNode; text: string };
//************************************************
// Variable
//************************************************

//************************************************
// Function
//************************************************
function ResponsiveAppBar() {
  const [year, setYear] = React.useState<number>(new Date().getFullYear());
  const handleOnChange = (year: number) => {
    setYear(year);
  };
  const [page, setPage] = React.useState<pageApp_e>(pageApp_e.access)

  return (
    <>
      <AppBar_c page={page} onClick={(page)=>setPage(page)}/>
      <Box sx={field}>
        <YearSelector_Mobile year={year} onChange={handleOnChange} />
      </Box>
    </>
  );
}
export default ResponsiveAppBar;
