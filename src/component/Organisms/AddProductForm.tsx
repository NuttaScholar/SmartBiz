import React, { useMemo, useState } from "react";
import { Box, Button } from "@mui/material";
import FieldAutoComplete, { Option_t } from "../Molecules/FieldAutoComplete";
import { productInfo_t } from "../../API/StockService/type";
import { productType_e } from "./CardProduct";
import { errorCode_e, stockStatus_e } from "../../enum";
import Field from "../Atoms/Field";
import FieldText from "../Molecules/FieldText";
import stockWithRetry_f from "../../page/Stock/lib/stockWithRetry";
import { useAuth } from "../../hooks/useAuth";
import { ErrorString } from "../../function/Enum";
import { useNavigate } from "react-router-dom";

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
  fieldPriceEnable?: boolean;
  onAdd?: (product: productInfo_t) => void;
}
//*********************************************
// Component
//*********************************************
const AddProductForm: React.FC<myProps> = (props) => {
  // Hook *********************
  const [form, setForm] = useState<Form_t>();
  const [clear, setClear] = useState(0);
  const [listOption, setListOption] = useState<productInfo_t[]>([]);
  const authContext = useAuth();
  const nevigate = useNavigate();
  // Local Variable *****************
  const options: Option_t[] = useMemo(() => {
    return (
      listOption?.map((item: productInfo_t) => ({
        code: item.id,
        value: item.name,
      })) ?? []
    );
  }, [listOption]);
  // Local Function *****************
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form) return;
    const newList: productInfo_t = {
      id: form.product?.code || "",
      name: form.product?.value || "",
      amount: form.amount ? Number(form.amount) : 0,
      price: form.price ? Number(form.price) : 0,
      type: props.fieldPriceEnable
        ? productType_e.merchandise
        : productType_e.material,
      status: stockStatus_e.normal,
      img:
        listOption?.find((item) => item.id === form.product?.code)?.img ||
        "",
    };
    props.onAdd?.(newList);
    setForm(undefined);
    setClear(clear + 1);
    console.log("Add Product", form);
  };
  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [event.target.name]: event.target.value } as Form_t);
  };
  // Use Effect **********************
  React.useEffect(() => {
    stockWithRetry_f
      .getStock(authContext)
      .then((res) => {
        if (res.status === "success" && res.result !== undefined) {
          res.result && setListOption(res.result);
        } else {
          alert(
            `เกินข้อผิดพลาด: ${ErrorString(res.errCode || errorCode_e.UnknownError)}`,
          );
        }
      })
      .catch((err) => {
        nevigate("/");
        console.log(err);
      });
  }, []);
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
          {props.fieldPriceEnable && (
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
