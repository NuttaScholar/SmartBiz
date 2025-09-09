import React from "react";
import { Autocomplete, Box, TextField } from "@mui/material";

//*********************************************
// Type
//*********************************************
export type Option_t = {
  code: string;
  value: string;
};
//*********************************************
// Constante
//*********************************************

//*********************************************
// Transition
//*********************************************

//*********************************************
// Interface
//*********************************************
interface myProps {
  option: Option_t[];
  label?: string;
  renderOption: (option: Option_t) => string;
  onChange?: (value: Option_t | null) => void;
  value?: Option_t | null;
  defauleValue?: Option_t;
  required?: boolean;
  name?: string;
  getOptionLabel?: (option: Option_t) => string;
}
//*********************************************
// Component
//*********************************************
const MyAutocomplete: React.FC<myProps> = (props) => {
  // Hook *********************

  // Local Function ***********

  return (
    <Autocomplete
      options={props.option}
      getOptionLabel={props.getOptionLabel}
      sx={{ backgroundColor: "white", width: "100%" }}
      value={props.value}
      defaultValue={props.defauleValue}
      onChange={(_, val) => props.onChange?.(val)}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          required={props.required}
          name={props.name}
          label={props.label}
        />
      )}
      renderOption={(_props, option) => {
        const { key, ...optionProps } = _props;
        return (
          <Box key={key} component="li" {...optionProps}>
            {props.renderOption(option)}
          </Box>
        );
      }}
    />
  );
};
export default MyAutocomplete;
