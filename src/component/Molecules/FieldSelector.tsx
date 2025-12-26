import * as React from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Field from "../Atoms/Field";

//*********************************************
// Type
//*********************************************
export type listSelect_t = { value: number; label: string };

//*********************************************
// Interface
//*********************************************
interface myProps {
  label?: string;
  list?: listSelect_t[];
  defauleValue?: string;
  value?: string;
  required?: boolean;
  readonly?: boolean;
  onChange?: (value: number | null) => void;
  name?: string;
  icon?: React.ReactNode;
}
//*********************************************
// Component
//*********************************************
const FieldSelector: React.FC<myProps> = (props) => {
  const [value, setValue] = React.useState(props.defauleValue || "");

  const handleChange = (event: SelectChangeEvent) => {
    setValue(event.target.value);
    if (props.onChange)
      props.onChange(
        event.target.value === "" ? null : Number(event.target.value)
      );
  };

  return (
    <Field alignItem="center">
      {props.icon}
      <FormControl
        sx={{ backgroundColor: props.readonly?"grey.50":"white", color: "black", flexGrow: "1" }}
        size="small"
      >
        <InputLabel id={props.label}>{`${props.label}${(props.required===true)?" *":""}`}</InputLabel>
        <Select
          labelId={props.label}
          //id="demo-select-small"
          required={props.required}
          readOnly={props.readonly}
          name={props.name}
          value={props.value||value}
          label={`${props.label}${(props.required)?" *":""}`}
          onChange={handleChange}
        >
          {!props.required && (
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
          )}

          {props.list?.map((list, index) => (
            <MenuItem key={index} value={list.value}>
              {list.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Field>
  );
};

export default FieldSelector;
