import * as React from "react";
import FieldContact from "./Molecules/FieldContact";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import { Alert, Box } from "@mui/material";
import { ContactList_dataSet } from "../dataSet/DataContactList";

export default function FullScreenDialog() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{marginTop: "16px"}}>
    <FieldContact
      defaultValue="test"
      placeholder="Contact"
      onSearch={(key) => console.log(`onSearch: ${key}`)}
      onChange={(value)=>{console.log(`onChange: ${value}`)}}
      icon={<AccountBoxIcon />}
      list={ContactList_dataSet}
    />
    </Box>
  );
}
