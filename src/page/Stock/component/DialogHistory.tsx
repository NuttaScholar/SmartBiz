import {
  Box,
  Dialog,
  Slide,
} from "@mui/material";
import HeaderDialog from "../../../component/Molecules/HeaderDialog";
import { useStockContext } from "../hooks/useStockContex";
import { stockDialog_e } from "../context/StockContext";
import React from "react";
import { TransitionProps } from "@mui/material/transitions";
import CardProduct from "../../../component/Organisms/CardProduct";
import TebleLog from "./TebleLog";

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
interface myProps {}
//*********************************************
// Component
//*********************************************
const DialogHistory: React.FC<myProps> = () => {
  const { state, setState } = useStockContext();
  const onClose = () => {
    setState({
      ...state,
      dialogOpen: stockDialog_e.none,
    });
  };

  return (
    <Dialog
      fullScreen
      open={state.dialogOpen === stockDialog_e.logs}
      onClose={onClose}
      slots={{
        transition: Transition,
      }}
    >
      <HeaderDialog label={"ประวัติการเคลื่อนไหว"} onClick={onClose} />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          alignItems: "center",
          mt: "64px",
          gap: "8px",
        }}
      >
        {state.productForm && (
          <CardProduct
            type={state.productForm.type}
            value={state.productForm}
            maxWidth="400px"
            variant={"readonly"}
          />
        )}
        <TebleLog productID={state.productForm?.id||""}/>
      </Box>
    </Dialog>
  );
};
export default DialogHistory;
