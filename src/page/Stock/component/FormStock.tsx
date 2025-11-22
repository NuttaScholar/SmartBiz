import React, { useMemo, useState } from "react";
import { Box, Button } from "@mui/material";
import FieldText from "../../../component/Molecules/FieldText";
import { useStockContext } from "../hooks/useStockContex";
import { productType_e } from "../../../component/Organisms/CardProduct";
import Field from "../../../component/Atoms/Field";
import FieldAutoComplete, {
  Option_t,
} from "../../../component/Molecules/FieldAutoComplete";
import { productInfo_t } from "../../../API/StockService/type";
import { stockStatus_e } from "../../../enum";

//*********************************************
// Type
//*********************************************
type Form_t = {
  product: Option_t | null;
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
  listOption?: productInfo_t[];
}
//*********************************************
// Component
//*********************************************
const FormStock: React.FC<myProps> = (props) => {
  // Hook *********************
  const { state, setState } = useStockContext();
  const [form, setForm] = useState<Form_t>();
  const [clear, setClear] = useState(0);
  //const authContext = useAuth();
  // Local Variable *****************
  const options: Option_t[] = useMemo(() => {
    return (
      props.listOption?.map((item: productInfo_t) => ({
        code: item.id,
        value: item.name,
      })) ?? []
    );
  }, [props.listOption]);
  // Local Function *****************
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form) return;
    const newList: productInfo_t = {
      id: form.product?.code || "",
      name: form.product?.value || "",
      amount: form.amount ? Number(form.amount) : 0,
      price: form.price ? Number(form.price) : 0,
      type: props.type==="in"?productType_e.merchandise:productType_e.material,
      status: stockStatus_e.normal,
      img: props.listOption?.find(
        (item) => item.id === form.product?.code
      )?.img|| "",
    };
    setState({
      ...state,
      productList: [...(state.productList || []), newList],
    });
    setForm(undefined);
    setClear(clear + 1);
    console.log("Add Product", form);
  };
  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [event.target.name]: event.target.value } as Form_t);
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
          onChange={(val) => setForm({ ...form, product: val } as Form_t)}
        />
        <Field hide>
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
          {props.type === "in" && (
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
export default FormStock;
