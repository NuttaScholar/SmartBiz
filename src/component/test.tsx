import * as React from "react";
import YearSelector_Mobile from "./Organisms/YearSelector_Mobile";
import { Box, SxProps, Theme } from "@mui/material";

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

  return (
    <Box sx={field}>
      <YearSelector_Mobile year={year} onChange={handleOnChange}/>
    </Box>
  );
}
export default ResponsiveAppBar;
