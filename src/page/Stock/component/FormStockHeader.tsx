import React, { useState } from "react";
import { Box, Button, Slide, Typography } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import FieldText from "../../../component/Molecules/FieldText";
import { useStockContext } from "../hooks/useStockContex";
import { productInfo_t } from "../../../component/Organisms/CardProduct";
import Field from "../../../component/Atoms/Field";
import FieldAutoComplete, {
  Option_t,
} from "../../../component/Molecules/FieldAutoComplete";
import FieldImage from "../../../component/Molecules/FieldImage";
import FieldDate from "../../../component/Molecules/FieldDate";

//*********************************************
// Type
//*********************************************
type Form_t = {
  id: string;
  name: string;
  amount: number;
  price?: number;
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
interface myProps {}
//*********************************************
// Component
//*********************************************
const FormStockHeader: React.FC<myProps> = (props) => {
  // Hook *********************
  const { state } = useStockContext();
  // Local Variable *****************

  // Local Function *****************
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries((formData as any).entries());

    const data = formJson as {
      id: string;
      id_value: string;
      amount: string;
      price?: string;
    };

    console.log("Add Product", data);
  };
  const nowDate = new Date();
  return (
    <Field direction="column">
      <FieldDate defaultValue={nowDate} label="Date" hideField readonly/>
      
      <Box>
        <FieldImage label="Bill Image" hideField buttonSize={100} />
      </Box>
    </Field>
  );
};
export default FormStockHeader;
