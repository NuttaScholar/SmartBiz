import * as React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import Field from "../Atoms/Field";

/**************************************************** */
//  Interface
/**************************************************** */
interface MyProps {
  label?: string;
  defaultValue?: Date | string;
  onChange?: (value: dayjs.Dayjs | null) => void;
  name?: string;
  icon?: React.ReactNode;
  hideField?: boolean;
  readonly?: boolean;
}
/**************************************************** */
//  Function
/**************************************************** */
const FieldDate: React.FC<MyProps> = (props) => {
  return (
    <Field hide={props.hideField} alignItem="center">
      {props.icon}
      <DatePicker
        readOnly = {props.readonly}
        sx={{ backgroundColor: "white", borderRadius: "5px", flex: "1 0 0" }}
        format="DD/MM/YYYY"
        name={props.name}
        label={props.label}
        onChange={props.onChange}
        defaultValue={props.defaultValue?dayjs(props.defaultValue):undefined}
        slotProps={{ textField: { size: "small" } }}
      />
    </Field>
  );
};
export default FieldDate;
