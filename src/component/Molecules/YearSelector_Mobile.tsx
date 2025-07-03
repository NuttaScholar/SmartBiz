import * as React from "react";
import Box_Mobile from "../Atoms/Box_Mobile";
import { InputBase, styled, SxProps, Theme } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

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
  boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
};
const Menu_st: React.CSSProperties = {
  maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
  width: 250,
};

const BootstrapInput = styled(InputBase)(() => ({
  "& .MuiInputBase-input": {
    fontSize: "24px",
    padding: "16px 32px 0px 16px",
    // Use the system font instead of the default Roboto font.
  },
}));
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
const YearSelector_Mobile: React.FC<myProps> = (props) => {
  /* UseState */
  
  /* Local Variable*/
  const curent_year = new Date().getFullYear();
  let value = 0;

  /* Local Function */
  const handleChange = (event: SelectChangeEvent) => {
    const val = curent_year - Number(event.target.value);
    props.onChange?.(val);
  };
  function createElements(): JSX.Element[] {
    const year = new Date().getFullYear();
    return Array.from({ length: 9 }, (_, index) => (
      <MenuItem key={index} value={index + 1}>
        {year - (index + 1)}
      </MenuItem>
    ));
  }

  /* Process */
  if (props.year !== undefined) {
    value = curent_year - props.year;
  }
  /* Return */
  return (
    <Box_Mobile sx={field}>
      <FormControl sx={{ minWidth: 80 }} size="small">
        <Select
          value={value.toString()}
          onChange={handleChange}
          input={<BootstrapInput />}
          MenuProps={{
            PaperProps: {
              style: Menu_st,
            },
          }}
        >
          <MenuItem value={0}>ปัจจุบัน</MenuItem>
          {createElements()}
        </Select>
      </FormControl>
    </Box_Mobile>
  );
};
export default YearSelector_Mobile;
