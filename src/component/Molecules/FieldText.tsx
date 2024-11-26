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
  type?: React.HTMLInputTypeAttribute;
  multiline?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  icon?: React.ReactNode;
}
//*********************************************
// Component
//*********************************************
const FieldText: React.FC<myProps> = (props) => {
  return (
    <Field alignItem="center">
      {props.icon}
      <TextField
        label={props.label}
        placeholder={props.placeholder}
        defaultValue={props.defauleValue}
        multiline={props.multiline}
        type={props.type}
        onChange={props.onChange}
        name={props.name}
        size="small"
        sx={{backgroundColor: "white", width: "100%"}}
        rows={4}
      />
    </Field>
  );
};

export default FieldText;
