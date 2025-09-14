import React from "react";
import { Box, Button, Dialog, Slide } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import HeaderDialog from "../../../component/Molecules/HeaderDialog";
import FieldText from "../../../component/Molecules/FieldText";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ContactPageIcon from "@mui/icons-material/ContactPage";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import { useStockContext } from "../hooks/useStockContex";
import { stockDialog_e } from "../context/StockContext";
import { productInfo_t } from "../../../component/Organisms/CardProduct";
import FieldImage from "../../../component/Molecules/FieldImage";

//*********************************************
// Type
//*********************************************

//*********************************************
// Constante
//*********************************************

//*********************************************
// Transition
//*********************************************
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

//*********************************************
// Interface
//*********************************************
interface myProps {
  onClose: (val?: productInfo_t[]) => void;
}
//*********************************************
// Component
//*********************************************
const DialogFormProduct: React.FC<myProps> = (props) => {
  // Hook *********************
  const { state } = useStockContext();
  //const authContext = useAuth();
  // Local Function ***********
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const  formJson = Object.fromEntries((formData as any).entries());

    const data = formJson as productInfo_t;

    if (state.productForm) {
      // Edit
      console.log("Edit Product", data);
    } else {
      // Add
      console.log("Add Product", data);
    }
  };
  const onClose = () => {    
    props.onClose();
  };
  return (
    <Dialog
      fullScreen
      open={state.dialogOpen === stockDialog_e.createForm}
      onClose={onClose}
      slots={{
        transition: Transition,
      }}
    >
      <HeaderDialog
        label={state.productForm ? "แก้ไขรายการ" : "เพิ่มรายการ"}
        onClick={onClose}
      />
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          alignItems: "center",
          my: "72px",
          gap: "8px",
        }}
      >
        <FieldImage label="Product Image" defauleValue={state.productForm?.img} buttonSize={100}/>
        <FieldText
          required
          label="Product ID"
          name="id"
          defauleValue={state.productForm?.id}
        />
        <FieldText
          required
          label="Name"
          name="name"
          defauleValue={state.productForm?.name}
        />
        <FieldText
          name="Description"
          label="description"
          defauleValue={state.productForm?.description}
        />
        <FieldText
          required
          type="number"
          label="Price"
          name="price"
          defauleValue={state.productForm?.price.toString()}
        />
        <FieldText
          required
          type="number"
          label="Stock"
          name="stock"
          defauleValue={state.productForm?.stock.toString()}
        />
        
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "16px",
            my: "32px",
          }}
        >
          <Button variant="contained" type="submit" sx={{ width: "150px" }}>
            save
          </Button>
          <Button variant="outlined" sx={{ width: "150px" }} onClick={onClose}>
            cancle
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};
export default DialogFormProduct;
