import React, { useEffect, useState } from "react";
import Field from "../Atoms/Field";
import MyAutocomplete from "../Atoms/MyAutocomplete";

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
  icon?: React.ReactNode;
  labelCode?: string;
  labelValue?: string;
  hideField?: boolean;
  onChange?: (value: Option_t | null) => void;
  defauleValue?: Option_t;
  maxWidth?: string;
  minWidth?: string;
  required?: boolean;
  name?: string;
  duble?: boolean;
  clear?: number;
}
//*********************************************
// Component
//*********************************************
const FieldAutoComplete: React.FC<myProps> = (props) => {
  // Hook *********************
  const [value, setValue] = useState<Option_t | null>(
    props.defauleValue || null
  );
  // Local Function ***********
  const onChangeHandle = (value: Option_t | null) => {
    setValue(value);
    props.onChange?.(value);
  };
  // Effect *******************
  useEffect(() => {
    setValue(null);
  }, [props.clear]);
  return (
    <Field
      alignItem="center"
      maxWidth={props.maxWidth}
      minWidth={props.minWidth}
      hide={props.hideField}
    >
      {props.icon}
      <MyAutocomplete
        label={props.labelCode}
        option={props.option}
        renderOption={(option) => `${option.code} -- ${option.value}`}
        value={value}
        onChange={(val) => onChangeHandle(val)}
        required={props.required}
        name={props.name}
        getOptionLabel={(option: Option_t) => option.code}
        defauleValue={props.defauleValue}
      />

      {props.duble && (
        <MyAutocomplete
          label={props.labelValue}
          option={props.option}
          renderOption={(option) => `${option.value} -- ${option.code}`}
          value={value}
          onChange={(val) => onChangeHandle(val)}
          required={props.required}
          name={props.name && `${props.name}_value`}
          getOptionLabel={(option: Option_t) => option.value}
          defauleValue={props.defauleValue}
        />
      )}
    </Field>
  );
};
export default FieldAutoComplete;
