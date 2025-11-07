import React, { useMemo } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  styled,
  Typography,
} from "@mui/material";
import FieldText from "../Molecules/FieldText";
import { useStockContext } from "../../page/Stock/hooks/useStockContex";
import { stockDialog_e } from "../../page/Stock/context/StockContext";
import { productType_e } from "./CardProduct";
import { productInfo_t } from "../../API/StockService/type";
import CloseIcon from "@mui/icons-material/Close";

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
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));
//*********************************************
// Interface
//*********************************************
interface myProps {
  open: boolean;
  onClose?: () => void;
  img: string;
}
//*********************************************
// Component
//*********************************************
const DialogShowImg: React.FC<myProps> = (props) => {
  // Hook *********************
  // Local Variable ***********

  // Local Function ***********
  return (
    <BootstrapDialog
      onClose={props.onClose}
      aria-labelledby="customized-dialog-title"
      open={props.open}
    >
      <DialogTitle sx={{ m: 0, px: 2 }} id="customized-dialog-title">
        Modal title
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={props.onClose}
        sx={(theme) => ({
          position: "absolute",
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>
        <img
          src= {props.img}
          alt="img"
          style={{ width: "auto", height: "auto" }}
        />
      </DialogContent>
    </BootstrapDialog>
  );
};
export default DialogShowImg;
