import {
  FormControl,
  IconButton,
  InputAdornment,
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
}
/**************************************************** */
//  Function
/**************************************************** */
const FieldContact: React.FC<MyProps> = (props) => {
  return (
    <Field alignItem="center">
      {props.icon}
      <FormControl sx={{ width: "100%" }} variant="outlined">
        <OutlinedInput
          id="outlined-adornment-password"
          type={"text"}
          sx={{ bgcolor: "white" }}
          size="small"
          placeholder={props.placeholder}
          name={props.name}
          defaultValue={props.defaultValue}
          readOnly
          value={props.value}
          endAdornment={
            <InputAdornment position="end">
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
