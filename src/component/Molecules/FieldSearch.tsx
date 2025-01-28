import { IconButton, TextField } from "@mui/material";
import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import Field from "../Atoms/Field";

//*********************************************
// Style
//*********************************************

//*********************************************
// Variable
//*********************************************

//*********************************************
// Interface
//*********************************************
interface myProps {
  label?: string;
  placeholder?: string;
  value?: string;
  fieldHide?: boolean;
  display?: any;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (resault: string) => void;
}
//*********************************************
// Component
//*********************************************
const FieldSearch: React.FC<myProps> = (props) => {
  return (
    <Field hide={props.fieldHide} display={props.display}>
      <TextField
        label={props.label}
        placeholder={props.placeholder}
        type="text"
        size="small"
        value={props.value}
        onChange={props.onChange}
        sx={{ width: "100%" }}
        slotProps={{
          input: {
            sx: { bgcolor: "white" },
          },
        }}
      />
      <IconButton
        aria-label="Search"
        onClick={() => {
          props.onSubmit?.(props.value||"");
        }}
      >
        <SearchIcon />
      </IconButton>
    </Field>
  );
};
export default FieldSearch;
