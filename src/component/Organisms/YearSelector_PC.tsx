import * as React from "react";
import { Button, InputBase, styled, SxProps, Theme } from "@mui/material";
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
  gap: "8px",
  boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
};
const Button_Style: SxProps<Theme> = {
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: "400",
  px: "20px"
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
  let select = 0;

  /* Local Function */
  const handleOnClick = (value: number) => {
    const val = curent_year - value;
    props.onChange?.(val);
  };
  function createElements(): JSX.Element[] {
    const year = new Date().getFullYear();
    return Array.from({ length: 9 }, (_, index) => {
      const val = index + 1;
      return (
        <Button
          key={index}
          sx={{
            color: select === val ? "white" : "black",
            bgcolor:
              select === val ? "primary.main" : "secondary.main" /* Note */,
            border: select === val ? "1px solid black" : "0",
            ...Button_Style,
          }}
          onClick={()=>handleOnClick(val)}
        >
          {year - val}
        </Button>
      );
    });
  }

  /* Process */
  if (props.year !== undefined) {
    select = curent_year - props.year;
  }
  /* Return */
  return (
    <Box_PC sx={field}>
      <Button
        sx={{
          color: select === 0 ? "white" : "black",
          bgcolor:
            select === 0 ? "primary.main" : "secondary.main" /* Note */,
          border: select === 0 ? "1px solid black" : "0",
          ...Button_Style,
        }}
        onClick={()=>handleOnClick(0)}
      >
        ปัจจุบัน
      </Button >
      {createElements()}
    </Box_PC>
  );
};
export default YearSelector_PC;
