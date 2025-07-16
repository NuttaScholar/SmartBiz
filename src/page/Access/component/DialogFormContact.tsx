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
import NotesIcon from "@mui/icons-material/Notes";
import { useAccess } from "../hooks/useAccess";
import { accessDialog_e } from "../context/AccessContext";
import contactWithRetry_f from "../lib/contactWithRetry";
import { useAuth } from "../../../hooks/useAuth";
import { ErrorString } from "../../../function/Enum";

//*********************************************
// Type
//*********************************************
export type ContactForm_t = {
  codeName: string;
  billName: string;
  address: string;
  tel: string;
  taxID: string;
  description: string;
};

//*********************************************
// Style
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

//*********************************************
// Component
//*********************************************
const DialogFormContact: React.FC = () => {
  const { state, setState } = useAccess();
  const authContext = useAuth();
  // Local Function ***********
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    let formJson = Object.fromEntries((formData as any).entries());
    const form = formJson as ContactForm_t;
    if (state.contactInfo) {
      // Edit
      contactWithRetry_f
        .put(authContext, form)
        .then((val) => {
          if(val.result) {
            setState({...state, contactList: val.result, open: accessDialog_e.contactList });
          }else if (val.errCode) {
            alert(ErrorString(val.errCode));
          }          
        })
        .catch((err) => {
          console.log(err);
          alert("Error: " + err.message);
        });
    } else {
      // Add
      contactWithRetry_f
        .post(authContext, form)
        .then((val) => {
          if(val.result) {
            setState({...state, contactList: val.result, open: accessDialog_e.contactList });
          }else if (val.errCode) {
            alert(ErrorString(val.errCode));
          }          
        })
        .catch((err) => {
          console.log(err);
          alert("Error: " + err.message);
        });
    }
  };
  const onClose = () => {
    setState({
      ...state,
      open: accessDialog_e.contactList,
      contactInfo: undefined,
    });
  };
  return (
    <Dialog
      fullScreen
      open={state.open === accessDialog_e.contactFrom}
      onClose={onClose}
      slots={{
        transition: Transition,
      }}
    >
      <HeaderDialog
        label={state.contactInfo ? "แก้ไขรายการ" : "เพิ่มรายการ"}
        onClick={onClose}
      />
      <Box
        component="form"
        id="formAddContact"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          alignItems: "center",
          my: "8px",
          gap: "8px",
        }}
      >
        <FieldText
          icon={<AccountCircleIcon />}
          required
          label="Code Name"
          name="codeName"
          defauleValue={state.contactInfo?.codeName}
        />
        <FieldText
          icon={<ContactPageIcon />}
          required
          label="Bill Name"
          name="billName"
          defauleValue={state.contactInfo?.billName}
        />
        <FieldText
          icon={<LocationOnIcon />}
          name="address"
          label="Address"
          multiline
          defauleValue={state.contactInfo?.address}
        />
        <FieldText
          icon={<LocalPhoneIcon />}
          label="Tel."
          name="tel"
          defauleValue={state.contactInfo?.tel}
        />
        <FieldText
          icon={<RecentActorsIcon />}
          label="Tax. ID"
          name="taxID"
          defauleValue={state.contactInfo?.taxID}
        />
        <FieldText
          icon={<NotesIcon />}
          name="description"
          label="More Detail"
          multiline
          defauleValue={state.contactInfo?.description}
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
          <Button
            variant="contained"
            type="submit"
            form="formAddContact"
            sx={{ width: "150px" }}
          >
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
export default DialogFormContact;
