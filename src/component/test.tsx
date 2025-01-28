import * as React from "react";
import Button from "@mui/material/Button";
import DialogContactList from "./Organisms/DialogContactList";

export default function FullScreenDialog() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button variant="outlined" onClick={handleClickOpen}>
        Open full-screen dialog
      </Button>
      <DialogContactList open={open} onClose={handleClose} onSearch={(key)=>console.log(key)}/>
    </React.Fragment>
  );
}
