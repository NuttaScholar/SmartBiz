import React from "react";
import { Box } from "@mui/material";
import Field from "../../../component/Atoms/Field";
import FieldDate from "../../../component/Molecules/FieldDate";
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
// Component
//*********************************************
const FormBillHeader: React.FC = () => {
  // Hook *********************
  const { state, setState } = useBillContext();
  // Local Variable *****************
  const orderDate = state.billForm?.date
    ? new Date(state.billForm.date)
    : new Date();
  const validOrderDate = Number.isNaN(orderDate.getTime())
    ? new Date()
    : orderDate;
  
  // Local Function *****************

  return (
    <Field direction="column">
      <FieldDate
        key={validOrderDate.toISOString()}
        defaultValue={validOrderDate}
        label="Date"
        hideField
        readonly        
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
