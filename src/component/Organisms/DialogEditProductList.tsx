import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { productInfo_t } from "../../API/StockService/type";
import { productType_e } from "./CardProduct";
import FieldText from "../Molecules/FieldText";

//*********************************************
// Type
//*********************************************
type form_t = {
  amount: string;
  price?: string;
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
  open: boolean;
  hideFieldAmount?: boolean;
  hideFieldPrice?: boolean;
  priceField?: "price" | "priceAfterDiscount";
  defaultValue?: productInfo_t;
  onSubmit?: (data: productInfo_t) => void;
  onClose?: () => void;
}
//*********************************************
// Component
//*********************************************
const DialogEditProductList: React.FC<myProps> = (props) => {
  // Local Variable ***********
  const info =
    props.defaultValue ||
    ({
      id: "",
      name: "",
      img: "",
      type: productType_e.another,
    } as productInfo_t);

  // Local Function ***********
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());
    const data = formJson as form_t;

    const priceField = props.priceField || "price";
    const amount = data.amount !== undefined ? Number(data.amount) : info.amount;
    const price = data.price !== undefined ? Number(data.price) : undefined;
    let total: number | undefined = undefined;
    if (info.total !== undefined && amount !== undefined) {
      const basePrice =
        priceField === "priceAfterDiscount"
          ? price
          : info.priceAfterDiscount ?? price ?? info.price;
      if (basePrice !== undefined) {
        total = amount * basePrice;
      }
    }
    const newData: productInfo_t = {
      ...info,
      amount: amount,
      price: priceField === "price" ? price ?? info.price : info.price,
      priceAfterDiscount:
        priceField === "priceAfterDiscount"
          ? price ?? info.priceAfterDiscount
          : info.priceAfterDiscount,
      total: total,
    };
    console.log(newData);
    props.onSubmit?.(newData);
  };
  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle>แก้ไขรายการ</DialogTitle>
      <DialogContent>
        {info && (
          <DialogContentText>{`${info.name} (ID: ${info.id})`}</DialogContentText>
        )}
        <Box
          id="form-editProductList"
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ mt: 1, gap: 1, display: "flex", flexDirection: "row" }}
        >
          {!props.hideFieldAmount && (
            <FieldText
              label="Amount"
              defauleValue={info?.amount?.toString()}
              required
              name="amount"
              type="number"
              minWidth="100px"
              hideField
            />
          )}
          {!props.hideFieldPrice && (
            <FieldText
              label="Price"
              defauleValue={
                (props.priceField === "priceAfterDiscount"
                  ? info?.priceAfterDiscount
                  : info?.price
                )?.toString()
              }
              required
              name="price"
              type="number"
              minWidth="100px"
              hideField
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button form="form-editProductList" variant="contained" type="submit">
          Save
        </Button>
        <Button variant="outlined" onClick={props.onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default DialogEditProductList;
