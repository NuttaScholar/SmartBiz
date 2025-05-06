import React from "react";
import { Box, Button, Dialog, Slide } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import HeaderDialog from "../component/Molecules/HeaderDialog";
import FieldText from "../component/Molecules/FieldText";
import PaidIcon from "@mui/icons-material/Paid";
import FieldSelector, {
  listSelect_t,
} from "../component/Molecules/FieldSelector";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import { transactionType_e } from "../type";
import SubjectIcon from "@mui/icons-material/Subject";
import FieldContact from "../component/Molecules/FieldContact";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FieldDate from "../component/Molecules/FieldDate";
import { ContactList_dataSet } from "../dataSet/DataContactList";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ContactPageIcon from "@mui/icons-material/ContactPage";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import NotesIcon from "@mui/icons-material/Notes";
import { contactInfo_t } from "../component/Molecules/ContactInfo";

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
  return <Slide direction="left" ref={ref} {...props} />;
});

//*********************************************
// Interface
//*********************************************
interface myProps {
  open: boolean;
  title?: string;
  defaultValue?: contactInfo_t;
  onClose?: () => void;
  onSubmit?: (data: ContactForm_t) => void;
}
//*********************************************
// Component
//*********************************************
const DialogAddContact: React.FC<myProps> = (props) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    let formJson = Object.fromEntries((formData as any).entries());
    const form = formJson as ContactForm_t;

    props.onSubmit?.(form);
  };

  return (
    <Dialog
      fullScreen
      open={props.open}
      onClose={props.onClose}
      TransitionComponent={Transition}
    >
      <HeaderDialog
        label={props.title || "เพิ่มรายการ"}
        onClick={props.onClose}
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
          defauleValue={props.defaultValue?.codeName}
        />
        <FieldText
          icon={<ContactPageIcon />}
          required
          label="Bill Name"
          name="billName"
          defauleValue={props.defaultValue?.billName}
        />
        <FieldText
          icon={<LocationOnIcon />}
          name="address"
          label="Address"
          multiline
          defauleValue={props.defaultValue?.address}
        />
        <FieldText
          icon={<LocalPhoneIcon />}
          label="Tel."
          name="tel"
          defauleValue={props.defaultValue?.tel}
        />
        <FieldText
          icon={<RecentActorsIcon />}
          label="Tax. ID"
          name="taxID"
          defauleValue={props.defaultValue?.taxID}
        />
        <FieldText
          icon={<NotesIcon />}
          name="description"
          label="More Detail"
          multiline
          defauleValue={props.defaultValue?.description}
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
          <Button
            variant="outlined"
            sx={{ width: "150px" }}
            onClick={props.onClose}
          >
            cancle
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};
export default DialogAddContact;
