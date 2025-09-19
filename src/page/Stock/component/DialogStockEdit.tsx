import React, { useMemo } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import FieldText from "../../../component/Molecules/FieldText";
import { useStockContext } from "../hooks/useStockContex";
import { stockDialog_e } from "../context/StockContext";
import {
  productInfo_t,
  productType_e,
} from "../../../component/Organisms/CardProduct";

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
  type: "in" | "out";
}
//*********************************************
// Component
//*********************************************
const DialogStockEdit: React.FC<myProps> = (props) => {
  // Hook *********************
  const { state, setState } = useStockContext();
  //const authContext = useAuth();
  // Local Variable ***********
  const info = useMemo(() => {
    if (state.productList && state.indexList !== undefined) {
      return state.productList[state.indexList];
    } else {
      return {
        id: "",
        name: "",
        amount: 0,
        price: 0,
        img: "",
        type: productType_e.another,
      } as productInfo_t;
    }
  }, [state.productList, state.indexList]);
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
    setState({
      ...state,
      dialogOpen: stockDialog_e.none,
      productList: state.productList?.map((item, index) =>
        index === state.indexList ? newData : item
      ),
    });
  };
  const onClose = () => {
    setState({ ...state, dialogOpen: stockDialog_e.none });
  };
  return (
    <Dialog
      open={state.dialogOpen === stockDialog_e.editForm}
      onClose={onClose}
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
          {props.type === "in" && (
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
          onClick={onClose}
        >
          Save
        </Button>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default DialogStockEdit;
