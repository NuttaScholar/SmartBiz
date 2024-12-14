import * as React from "react";
import Box_Mobile from "../Atoms/Box_Mobile";
import { InputBase, styled, SxProps, Theme } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Box_PC from "../Atoms/Box_PC";

//*********************************************
// Define
//*********************************************
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

//*********************************************
// Style
//*********************************************
const field: SxProps<Theme> = {
  flexGrow: 1,
  justifyContent: "center",
};
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
const YearSelector_PC: React.FC<myProps> = (props) => {
  /* UseState */
  
  /* Local Variable*/
  const curent_year = new Date().getFullYear();
  let value = 0;

  /* Local Function */
  
  if (props.year !== undefined) {
    value = curent_year - props.year;
  }
  /* Return */
  return (
    <Box_PC sx={field}>
      
    </Box_PC>
  );
};
export default YearSelector_PC;
