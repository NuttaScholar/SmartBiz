import * as React from "react";
import Field from "../Atoms/Field";
import TextField from "@mui/material/TextField";

//*********************************************
// Interface
//*********************************************
interface myProps {
  label?: string;
  placeholder?: string;
  defauleValue?: string;
  required?: boolean;
  type?: React.HTMLInputTypeAttribute;
  multiline?: boolean;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  icon?: React.ReactNode;
  maxWidth?: string;
  minWidth?: string;
  readonly?: boolean;
  hideField?: boolean
}
//*********************************************
// Component
//*********************************************
const FieldText: React.FC<myProps> = (props) => {
  return (
    <Field
      hide={props.hideField}
      maxWidth={props.maxWidth}
      minWidth={props.minWidth}
      alignItem={props.multiline ? "baseline" : "center"}
    >
      {props.icon}
      <TextField
        label={props.label}
        placeholder={props.placeholder}
        defaultValue={props.defauleValue}
        value={props.value}
        multiline={props.multiline}
        required={props.required}
        type={props.type}
        onChange={props.onChange}
        name={props.name}
        size="small"
        sx={{ backgroundColor: "white", width: "100%" }}
        rows={4}
        slotProps={{
          input: {
            readOnly: props.readonly,
          },
        }}
      />
    </Field>
  );
};

export default FieldText;
