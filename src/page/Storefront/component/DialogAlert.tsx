import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useId, type ReactNode } from "react";

type DialogAlertProps = {
  open: boolean;
  title?: string;
  content?: ReactNode;
  confirmText?: string;
  confirmColor?: "primary" | "error" | "success" | "warning";
  onClose: () => void;
};

export function DialogAlert({
  open,
  title,
  content = "ทำรายการสำเร็จแล้ว",
  confirmText = "ตกลง",
  confirmColor = "primary",
  onClose,
}: DialogAlertProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby={title ? titleId : descriptionId}
      aria-describedby={descriptionId}
    >
      {title && <DialogTitle id={titleId}>{title}</DialogTitle>}
      <DialogContent sx={{ width: "100%", minWidth: 350,  }}>
        <DialogContentText id={descriptionId} component="div">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color={confirmColor} autoFocus onClick={onClose}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
