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
  hideFieldPrice?: boolean;
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
      amount: 0,
      price: 0,
      img: "",
      type: productType_e.another,
    } as productInfo_t);

  // Local Function ***********
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries((formData as any).entries());
    const data = formJson as form_t;
    const newData: productInfo_t = {
      ...info,
      amount: Number(data.amount),
      price: Number(data.price || 0),
    };
    console.log(newData);
    props.onSubmit?.(newData);    
  };
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
    >
      <DialogTitle>แก้ไขรายการ</DialogTitle>
      <DialogContent>
        {info && (
          <DialogContentText>{`${info.name} (ID: ${info.id})`}</DialogContentText>
        )}
        <Box
          id="form-stock-edit"
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ mt: 1, gap: 1, display: "flex", flexDirection: "row" }}
        >
          <FieldText
            label="Amount"
            defauleValue={info?.amount?.toString()}
            required
            name="amount"
            type="number"
            minWidth="100px"
            hideField
          />
          {props.hideFieldPrice !== true && (
            <FieldText
              label="Price"
              defauleValue={info?.price?.toString()}
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
        <Button
          form="form-stock-edit"
          variant="contained"
          type="submit"
        >
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
