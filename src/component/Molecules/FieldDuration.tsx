import * as React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import Field from "../Atoms/Field";
import { Box, SxProps, Theme } from "@mui/material";

/**************************************************** */
//  Style
/**************************************************** */
const dateField_s: SxProps<Theme> = {
  backgroundColor: "white",
  borderRadius: "5px",
  flex: "1 0 0",
  minWidth: "200px",
};
/**************************************************** */
//  Type
/**************************************************** */
export type date_t = Date | string;
/**************************************************** */
//  Interface
/**************************************************** */
interface MyProps {
  defaultValue?: { to: date_t; from: date_t };
  onChange?: (value: dayjs.Dayjs | null) => void;
  name?: string;
  icon?: React.ReactNode;
}
/**************************************************** */
//  Function
/**************************************************** */
const FieldDuration: React.FC<MyProps> = (props) => {
  let buffer: { to: dayjs.Dayjs | null, from: dayjs.Dayjs | null } = {from: null, to: null}

  const fromChangeHandler = (value: dayjs.Dayjs | null) => {
    console.log(value?.format("DD/MM/YYYY"));
    buffer.from = value;
    
    if(buffer.from&&buffer.to){
      if(buffer.from.unix() > buffer.to.unix()){
        alert("Form ต้องน้อยกว่า To เสมอ")
      }
    }
  };
  const toChangeHandler = (value: dayjs.Dayjs | null) => {
    console.log(value?.format("DD/MM/YYYY"));
    buffer.to = value;
    if(buffer.from&&buffer.to){
      if(buffer.from.unix() > buffer.to.unix()){
        alert("Form ต้องน้อยกว่า To เสมอ")
      }
    }
    
  };
  return (
    <Field alignItem="center">
      <Box sx={{ display: "flex", position: "relative", top: "8px" }}>
        {props.icon}
      </Box>
      <Box
        sx={{ display: "flex", flex: "1 0 0", flexWrap: "wrap", gap: "8px" }}
      >
        <DatePicker
          sx={dateField_s}
          format="DD/MM/YYYY"
          name={props.name}
          label="From"
          onChange={fromChangeHandler}
          defaultValue={
            props.defaultValue ? dayjs(props.defaultValue.from) : undefined
          }
          slotProps={{ textField: { size: "small" } }}
        />
        <DatePicker
          sx={dateField_s}
          format="DD/MM/YYYY"
          name={props.name}
          label="To"
          onChange={toChangeHandler}
          defaultValue={
            props.defaultValue ? dayjs(props.defaultValue.to) : undefined
          }
          slotProps={{ textField: { size: "small" } }}
        />
      </Box>
    </Field>
  );
};
export default FieldDuration;
