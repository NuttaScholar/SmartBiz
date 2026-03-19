import { Box, Dialog, IconButton, Slide } from "@mui/material";
import HeaderDialog from "../../../component/Molecules/HeaderDialog";
import SaveIcon from "@mui/icons-material/Save";
import React from "react";
import { TransitionProps } from "@mui/material/transitions";
import { useBillContext } from "../hooks/useBillContex";
import { billDialog_e } from "../context/BillContext";
import FormBillHeader from "./FormBillHeader";
import AddProductForm from "../../../component/Organisms/AddProductForm";
import MerchList from "./MerchList";
import { productInfo_t } from "../../../API/StockService/type";

//*********************************************
// Transition
//*********************************************
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
//*********************************************
// Interface
//*********************************************
interface myProps {}
//*********************************************
// Component
//*********************************************
const DialogOrderForm: React.FC<myProps> = () => {
  // Hook ************************************
  const { state, setState } = useBillContext();
  // Local function **************************
  const onClose = () => {
    setState({ ...state, dialogOpen: billDialog_e.none });
  };
  const onSave = () => {
    console.log("save");
  };
  const onAdd = (product: productInfo_t) => {
    setState({
      ...state,
      merchList: [...(state.merchList || []), product],
    });
  };
  // Use Effect ******************************

  // Render **********************************
  return (
    <Dialog
      fullScreen
      open={state.dialogOpen === billDialog_e.form}
      onClose={onClose}
      slots={{
        transition: Transition,
      }}
    >
      <HeaderDialog label={"สร้างใบสั่งซื้อ"} onClick={onClose}>
        <Box sx={{ display: "flex", flexGrow: 1, justifyContent: "flex-end" }}>
          <IconButton
            onClick={onSave}
            size="large"
            sx={{
              color: "white",
            }}
          >
            <SaveIcon sx={{ fontSize: 32 }} />
          </IconButton>
        </Box>
      </HeaderDialog>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          alignItems: "center",
          my: "72px",
          gap: "8px",
        }}
      >
        <FormBillHeader />
        <AddProductForm variant="Bill" onAdd={onAdd} />
        <MerchList
          variant="deleteable"
          onClick={(edit, val) => {
            console.log("edit", edit);
          }}
        />
      </Box>
    </Dialog>
  );
};

export default DialogOrderForm;
