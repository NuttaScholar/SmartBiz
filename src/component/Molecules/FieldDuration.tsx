import * as React from "react";
import { Box, SxProps, Theme } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import Field from "../Atoms/Field";

const dateField_s: SxProps<Theme> = {
  backgroundColor: "white",
  borderRadius: "5px",
  flex: "1 0 0",
  minWidth: "200px",
};

export type date_t = Date | string;
export type dateRange_t = {
  from: dayjs.Dayjs | null;
  to: dayjs.Dayjs | null;
};

interface MyProps {
  defaultValue?: { from: date_t; to: date_t };
  value?: { from: date_t | null; to: date_t | null };
  onChange?: (value: dateRange_t) => void;
  name?: string;
  icon?: React.ReactNode;
}

const FieldDuration: React.FC<MyProps> = (props) => {
  const [internalValue, setInternalValue] = React.useState<dateRange_t>(() => ({
    from: props.defaultValue ? dayjs(props.defaultValue.from) : null,
    to: props.defaultValue ? dayjs(props.defaultValue.to) : null,
  }));

  const value: dateRange_t = props.value
    ? {
        from: props.value.from ? dayjs(props.value.from) : null,
        to: props.value.to ? dayjs(props.value.to) : null,
      }
    : internalValue;

  const updateValue = (nextValue: dateRange_t) => {
    if (!props.value) {
      setInternalValue(nextValue);
    }
    props.onChange?.(nextValue);
  };

  const fieldName = props.name ?? "duration";

  return (
    <Field alignItem="center">
      <Box sx={{ display: "flex", position: "relative" }}>
        {props.icon}
      </Box>
      <Box
        sx={{ display: "flex", flex: "1 0 0", flexWrap: "wrap", gap: "8px" }}
      >
        <DatePicker
          sx={dateField_s}
          format="DD/MM/YYYY"
          name={`${fieldName}_From`}
          label="From"
          value={value.from}
          maxDate={value.to ?? undefined}
          onChange={(from) => updateValue({ ...value, from })}
          slotProps={{ textField: { size: "small" } }}
        />
        <DatePicker
          sx={dateField_s}
          format="DD/MM/YYYY"
          name={`${fieldName}_To`}
          label="To"
          value={value.to}
          minDate={value.from ?? undefined}
          onChange={(to) => updateValue({ ...value, to })}
          slotProps={{ textField: { size: "small" } }}
        />
      </Box>
    </Field>
  );
};

export default FieldDuration;
