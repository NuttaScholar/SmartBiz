import { IconButton, TextField } from "@mui/material";
import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import Field from "../Atoms/Field";
import { css_display_t } from "../../type";
import Box from "@mui/material/Box";

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
  display?: css_display_t | any;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (resault: string) => void;
  maxWidth?: string;
}
//*********************************************
// Component
//*********************************************
const FieldSearch: React.FC<myProps> = (props) => {
  return (
    <Field
      hide={props.fieldHide}
      display={props.display}
      maxWidth={props.maxWidth}
    >
      <Box
        sx={{
          display: "flex",
          borderRadius: "8px",
          width: "100%",
          gap: "8px",
          boxSizing: "border-box",
          backgroundColor: "secondary.main",
        }}
      >
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
            props.onSubmit?.(props.value || "");
          }}
        >
          <SearchIcon />
        </IconButton>
      </Box>
    </Field>
  );
};
export default FieldSearch;
