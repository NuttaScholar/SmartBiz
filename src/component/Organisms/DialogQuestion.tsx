import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

//*********************************************
// Type
//*********************************************
type questionType_t = "yesNo" | "confirmCancel";

//*********************************************
// Interface
//*********************************************
interface myProps {
  open: boolean;
  title?: string;
  content?: React.ReactNode;
  questionType?: questionType_t;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: "primary" | "error" | "success" | "warning";
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

//*********************************************
// Helper function
//*********************************************
function getButtonText(props: myProps) {
  if (props.questionType === "yesNo") {
    return {
      confirmText: props.confirmText || "Yes",
      cancelText: props.cancelText || "No",
    };
  }

  return {
    confirmText: props.confirmText || "OK",
    cancelText: props.cancelText || "Cancel",
  };
}

//*********************************************
// Component
//*********************************************
const DialogQuestion: React.FC<myProps> = (props) => {
  // Local variable ***********
  const { confirmText, cancelText } = getButtonText(props);

  // Local function ***********
  const handleCancel = () => {
    props.onCancel?.();
    props.onClose?.();
  };

  const handleConfirm = () => {
    props.onConfirm?.();
  };

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      aria-labelledby="dialog-question-title"
      aria-describedby="dialog-question-description"
    >
      {props.title && (
        <DialogTitle id="dialog-question-title">{props.title}</DialogTitle>
      )}
      {props.content && (
        <DialogContent>
          <DialogContentText id="dialog-question-description" component="div">
            {props.content}
          </DialogContentText>
        </DialogContent>
      )}
      <DialogActions>
        <Button variant="outlined" onClick={handleCancel}>
          {cancelText}
        </Button>
        <Button
          variant="contained"
          color={props.confirmColor || "primary"}
          onClick={handleConfirm}
          autoFocus
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogQuestion;
