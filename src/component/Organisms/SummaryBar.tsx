import React from "react";
import Label_parameter from "../Atoms/Label_parameter";
import { Fab } from "@mui/material";

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
  label?: string;
  value: number;
}
//*********************************************
// Component
//*********************************************
const SummaryBar: React.FC<myProps> = (props) => {
  // Hook ***************************

  // Local Variable *****************

  // UI *****************************
  return (
    <Fab
      variant="extended"
      color="primary"
      sx={{
        position: "fixed",
        bottom: 16,
        px: 4,
      }}
    >
      <Label_parameter
        label={props.label || "ยอดสุทธิ"}
        value={props.value.toLocaleString("th-TH", {
          style: "currency",
          currency: "THB",

        })}
        size="20px"
        gap="16px"
      />
    </Fab>
  );
};
export default SummaryBar;
