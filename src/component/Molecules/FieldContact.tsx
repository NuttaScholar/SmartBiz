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
import DialogContactList from "../../dialog/DialogContactList";
import { contactInfo_t } from "./ContactInfo";
/**************************************************** */
//  Interface
/**************************************************** */
interface MyProps {
  placeholder?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSearch?: (keyword: string) => void;
  name?: string;
  icon?: React.ReactNode;
  list?: contactInfo_t[];
}
/**************************************************** */
//  Function
/**************************************************** */
const FieldContact: React.FC<MyProps> = (props) => {
  const [value, setValue] = React.useState(props.defaultValue || "");
  const [open, setOpen] = React.useState(false);

  const onClearHandler = () => {
    setValue("");
    props.onChange?.("");
  };

  const onOpenList = () => {
    setOpen(true);
  };

  const onSelectHandler = (codeName: string) =>{
    setValue(codeName);
    props.onChange?.(codeName);
    setOpen(false);
  }
  return (
    <React.Fragment>
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
            readOnly
            value={value}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={onClearHandler}
                  edge="end"
                  sx={{ mx: "0" }}
                >
                  <ClearIcon />
                </IconButton>
                <IconButton onClick={onOpenList} edge="end">
                  <AssignmentIndOutlinedIcon />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
      </Field>
      <DialogContactList
        open={open}
        list={props.list}
        onClose={() => setOpen(false)}
        onSearch={props.onSearch}
        onSelect={onSelectHandler}
      />
    </React.Fragment>
  );
};
export default FieldContact;
