import * as React from "react";
import { Box, SxProps, Theme } from "@mui/material";
import YearSelector_Mobile from "../Molecules/YearSelector_Mobile";
import YearSelector_PC from "../Molecules/YearSelector_PC";

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

//************************************************
// Variable
//************************************************

//*********************************************
// Interface
//*********************************************
interface myProps {
  year?: number;
  onChange?: (year: number) => void;
}
//*********************************************
// Component
//*********************************************
const YearSelector: React.FC<myProps> = (props) => {
  return (
    <Box sx={field}>
      <YearSelector_Mobile year={props.year} onChange={props.onChange} />
      <YearSelector_PC year={props.year} onChange={props.onChange} />
    </Box>
  );
}
export default YearSelector;
