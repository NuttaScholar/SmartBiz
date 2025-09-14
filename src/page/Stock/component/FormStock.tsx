import React, { useState } from "react";
import {
  Box,
  Button,
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import FieldText from "../../../component/Molecules/FieldText";
import { useStockContext } from "../hooks/useStockContex";
import { productInfo_t } from "../../../component/Organisms/CardProduct";
import Field from "../../../component/Atoms/Field";
import FieldAutoComplete, {
  Option_t,
} from "../../../component/Molecules/FieldAutoComplete";

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
interface myProps {
  type: "in" | "out";
}
//*********************************************
// Component
//*********************************************
const FormStock: React.FC<myProps> = (props) => {
  // Hook *********************
  const { state } = useStockContext();
  //const authContext = useAuth();
  // Local Variable *****************
  const list: Option_t[] = [
    { code: "001B01", value: "อังกฤษ" },
    { code: "002CH02", value: "ไก่กลาง" },
    { code: "003P01", value: "เม็ดพลาสติก" },
  ];
  // Local Function *****************
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries((formData as any).entries());

    const data = formJson as {id: string, id_value: string, amount: string, price?: string};

    console.log("Add Product", data);
  };

  return (
    <Field maxWidth="1280px">
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          gap: 1,
          flexWrap: "wrap",
          width: "100%",
        }}
      >
        <FieldAutoComplete
          labelCode="ProductID"
          required
          labelValue="Name"
          name="id"
          option={list}
          hideField
          duble
          onChange={(val) => console.log(val)}
        />
        <Field hide >
          <FieldText label="Amount" required name="amount" type="number" minWidth="100px" hideField />
          {props.type==="in"&&<FieldText label="Price" required name="price" type="number" minWidth="100px" hideField />}
          <Button variant="contained" type="submit" sx={{ width: "150px" }}>
            add
          </Button>
        </Field>
      </Box>
    </Field>
  );
};
export default FormStock;
