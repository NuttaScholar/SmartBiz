import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import Field from "../Atoms/Field";
import React from "react";
import ClearIcon from "@mui/icons-material/Clear";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
/**************************************************** */
//  Interface
/**************************************************** */
interface MyProps {
  placeholder?: string;
  value?: string;
  name?: string;
  icon?: React.ReactNode;
  defaultValue?: string;
  onClear?: () => void;
  onOpenList?: () => void;
  readonly?: boolean;
  hideField?: boolean;
  label?: string;
}
/**************************************************** */
//  Function
/**************************************************** */
const FieldContact: React.FC<MyProps> = (props) => {
  return (
    <Field hide={props.hideField} alignItem="center">
      {props.icon}
      <FormControl sx={{ width: "100%" }} variant="outlined">
        <InputLabel >{props.label}</InputLabel>
        <OutlinedInput
          label={props.label}
          type={"text"}
          sx={{ bgcolor: props.readonly?"grey.50":"white" }}
          size="small"
          placeholder={props.placeholder}
          name={props.name}
          defaultValue={props.defaultValue}
          readOnly
          value={props.value}
          endAdornment={
            !props.readonly&&<InputAdornment position="end">
              <IconButton onClick={props.onClear} edge="end" sx={{ mx: "0" }}>
                <ClearIcon />
              </IconButton>
              <IconButton onClick={props.onOpenList} edge="end">
                <AssignmentIndOutlinedIcon />
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>
    </Field>
  );
};
export default FieldContact;
