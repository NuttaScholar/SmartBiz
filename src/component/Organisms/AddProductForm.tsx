import React, { useMemo, useState } from "react";
import { Box, Button } from "@mui/material";
import FieldAutoComplete, { Option_t } from "../Molecules/FieldAutoComplete";
import { productInfo_t } from "../../API/StockService/type";
import Field from "../Atoms/Field";
import FieldText from "../Molecules/FieldText";
import { useNavigate } from "react-router-dom";

//*********************************************
// Type
//*********************************************
export type FormAddProduce_t = {
  product: Option_t | null;
  amount?: number;
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
  list: productInfo_t[];
  hideFieldPrice?: boolean;
  hideFieldAmount?: boolean;
  autoComplete?: boolean;
  onAdd?: (from: FormAddProduce_t) => void;
}
//*********************************************
// Component
//*********************************************
const AddProductForm: React.FC<myProps> = (props) => {
  // Hook *********************
  const [form, setForm] = useState<FormAddProduce_t>();
  const [clear, setClear] = useState(0);
  const nevigate = useNavigate();
  // Local Variable *****************
  const options: Option_t[] = useMemo(() => {
    return (
      props.list?.map((item: productInfo_t) => ({
        code: item.id,
        value: item.name,
      })) ?? []
    );
  }, [props.list]);
  // Local Function *****************
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form) return;
    const formData: FormAddProduce_t = {
      ...form,
      price: form.price !== undefined ? Number(form.price) : undefined,
      amount: form.amount !== undefined ? Number(form.amount) : undefined,
    };
    props.onAdd?.(formData);
    setForm(undefined);
    setClear(clear + 1);
  };
  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    } as FormAddProduce_t);
  };
  const onSelectHandler = (option: Option_t | null) => {
    if (props.autoComplete) {
      const product = props.list?.find((item) => item.id === option?.code);
      setForm({
        ...form,
        product: option,
        price: props.hideFieldPrice ? undefined : product?.price,
        amount: props.hideFieldAmount ? undefined : product?.amount,
      } as FormAddProduce_t);
    } else {
      setForm({ ...form, product: option } as FormAddProduce_t);
    }
  };
  // UI *****************************
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
          option={options || []}
          hideField
          duble
          clear={clear}
          onChange={onSelectHandler}
        />
        <Field hide>
          {!props.hideFieldAmount && (
            <FieldText
              label="Amount"
              required
              name="amount"
              type="number"
              minWidth="100px"
              hideField
              value={form?.amount?.toString() || ""}
              onChange={onChangeHandler}
            />
          )}
          {!props.hideFieldPrice && (
            <FieldText
              label="Price"
              required
              name="price"
              type="number"
              minWidth="100px"
              hideField
              value={form?.price?.toString() || ""}
              onChange={onChangeHandler}
            />
          )}
          <Button variant="contained" type="submit" sx={{ width: "150px" }}>
            add
          </Button>
        </Field>
      </Box>
    </Field>
  );
};
export default AddProductForm;
