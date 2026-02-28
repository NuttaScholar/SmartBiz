import React from "react";
import { Box } from "@mui/material";
import Field from "../../../component/Atoms/Field";
import FieldImage from "../../../component/Molecules/FieldImage";
import FieldDate from "../../../component/Molecules/FieldDate";
import FieldText from "../../../component/Molecules/FieldText";
import FieldContactAccess from "../../../component/Organisms/FieldContactAccess";
import { useBillContext } from "../hooks/useBillContex";

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
interface myProps {}
//*********************************************
// Component
//*********************************************
const FormBillHeader: React.FC<myProps> = (props) => {
  // Hook *********************
  const { state, setState } = useBillContext();
  // Local Variable *****************
  const nowDate = new Date();
  // Local Function *****************

  return (
    <Field direction="column">
      <FieldDate
        defaultValue={nowDate}
        label="Date"
        hideField
        onChange={(val) =>
          val &&
          setState({
            ...state,
            billForm: { ...state.billForm, date: val.toDate() },
          })
        }
      />
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <FieldContactAccess
          hideField
          placeholder="Contact"
          value={state.billForm?.customer || ""}
          onChange={(val) =>
            setState({
              ...state,
              billForm: { ...state.billForm, customer: val },
            })
          }
          onClear={() => {
            setState({
              ...state,
              billForm: { ...state.billForm, customer: "" },
            });
          }}
        />
      </Box>
    </Field>
  );
};
export default FormBillHeader;
