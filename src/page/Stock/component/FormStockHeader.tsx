import React from "react";
import { Box} from "@mui/material";
import { useStockContext } from "../hooks/useStockContex";
import Field from "../../../component/Atoms/Field";
import FieldImage from "../../../component/Molecules/FieldImage";
import FieldDate from "../../../component/Molecules/FieldDate";

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
//*********************************************
// Component
//*********************************************
const FormStockHeader: React.FC = () => {
  // Hook *********************
  const { state, setState } = useStockContext();
  // Local Variable *****************
  const nowDate = new Date();
  // Local Function *****************
  const onChangeImage = (file:File) => {
    setState({ ...state, fileUpload: file });
  }
  
  return (
    <Field direction="column">
      <FieldDate defaultValue={nowDate} label="Date" hideField readonly/>  
      <Box>
        <FieldImage label="Bill Image" hideField buttonSize={100} onChange={onChangeImage} />
      </Box>
    </Field>
  );
};
export default FormStockHeader;
