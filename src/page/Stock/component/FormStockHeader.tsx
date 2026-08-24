import React from "react";
import { Box } from "@mui/material";
import { useStockContext } from "../hooks/useStockContex";
import Field from "../../../component/Atoms/Field";
import FieldImage from "../../../component/Molecules/FieldImage";
import FieldDate from "../../../component/Molecules/FieldDate";
import FieldText from "../../../component/Molecules/FieldText";
import FieldContactAccess from "../../../component/Organisms/FieldContactAccess";

//*********************************************
// Type
//*********************************************

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
  type: "in" | "out";
}
//*********************************************
// Component
//*********************************************
const FormStockHeader: React.FC<myProps> = (props) => {
  // Hook *********************
  const { state, setState } = useStockContext();
  // Local Function *****************
  const onChangeDate = (value: import("dayjs").Dayjs | null) => {
    setState({
      ...state,
      billForm: {
        ...state.billForm,
        date: value?.isValid() ? value.toDate() : undefined,
      },
    });
  };
  const onChangeImage = (file: File | null) => {
    setState({ ...state, billForm: { ...state.billForm, img: file } });
  };
  const onChangeDecs = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setState({
      ...state,
      billForm: { ...state.billForm, description: value },
    });
  };
  return (
    <Field direction="column">
      <FieldDate
        defaultValue={state.billForm?.date}
        label="วันที่"
        hideField
        onChange={onChangeDate}
      />
      {props.type === "in" ? (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <FieldContactAccess
            hideField
            label="Contact"
            value={state.billForm?.who}
            onChange={(val) =>
              setState({ ...state, billForm: { ...state.billForm, who: val } })
            }
            onClear={() => {
              setState({ ...state, billForm: { ...state.billForm, who: "" } });
            }}
          />
          <FieldImage
            label="Bill Image *"
            hideField
            buttonSize={100}
            onChange={onChangeImage}
          />
        </Box>
      ) : (
        <FieldText
          label="Description"
          placeholder="แจ้งวัตถุประสงค์"
          value={state.billForm?.description || ""}
          required
          hideField
          onChange={onChangeDecs}
        />
      )}
    </Field>
  );
};
export default FormStockHeader;
