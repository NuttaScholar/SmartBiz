import React from "react";
import { Box } from "@mui/material";
import { useStockContext } from "../hooks/useStockContex";
import Field from "../../../component/Atoms/Field";
import FieldImage from "../../../component/Molecules/FieldImage";
import FieldDate from "../../../component/Molecules/FieldDate";
import FieldText from "../../../component/Molecules/FieldText";

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
  // Local Variable *****************
  const nowDate = new Date();
  // Local Function *****************
  const onChangeImage = (file: File|null) => {
    setState({ ...state, billForm: { img: file } });
  };
  const onChangeDecs = (event:React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setState({ ...state, billForm: { description: value } });
  }
  return (
    <Field direction="column">
      <FieldDate defaultValue={nowDate} label="Date" hideField readonly />
      {props.type === "in" ? (
        <Box>
          <FieldImage
            label="Bill Image"
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
