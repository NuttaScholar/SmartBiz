import * as React from "react";
import { Box, SxProps, Theme } from "@mui/material";
import AppBar_c, { pageApp_e } from "./Organisms/AppBar_c";
import YearSelector from "./Organisms/YearSelector";


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
      <AppBar_c role="admin" page={page} onClick={(page)=>setPage(page)}/>
      <YearSelector year={year} onChange={handleOnChange}/>

    </>
  );
}
export default ResponsiveAppBar;
