import React from "react";
import { Box, Button, Dialog, IconButton, Slide } from "@mui/material";
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
import DialogAddContact, { ContactForm_t } from "./DialogAddContact";
import DeleteIcon from "@mui/icons-material/Delete";
import { contactInfo_t } from "../component/Molecules/ContactInfo";

//*********************************************
// Type
//*********************************************
export type TransitionForm_t = {
  id?: string;
  date: Date;
  topic: string;
  type: transactionType_e;
  money: number;
  who?: string;
  description?: string;
};
type form_t = {
  date: string;
  topic: string;
  type: string;
  money: string;
  who: string;
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
interface myProps {
  open: boolean;
  title?: string;
  dafaultValue?: TransitionForm_t;
  contactList?: contactInfo_t[];
  onClose?: () => void;
  onSubmitTransaction?: (data: TransitionForm_t) => void;
  onSubmitContact?: (data: ContactForm_t) => void;
  onDelTransaction?: (data?: TransitionForm_t) => void;
  onDelContact?: (data: contactInfo_t) => void;
  onEditContact?: (data: ContactForm_t) => void;
  onSearchContact?: (keyword: string) => void;
}

//*********************************************
// Component
//*********************************************
const DialogAddTransaction: React.FC<myProps> = (props) => {
  const [openAddContact, setOpenAddContact] = React.useState(false);
  const [openEditContact, setOpenEditContact] = React.useState(false);
  const [contactInfo, setContactInfo] = React.useState<contactInfo_t>();

  const listSelect: listSelect_t[] = [
    { label: "รายรับ", value: transactionType_e.income },
    { label: "รายจ่าย", value: transactionType_e.expenses },
    { label: "เงินกู้", value: transactionType_e.loan },
    { label: "ให้ยืม", value: transactionType_e.lend },
  ];
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    let formJson = Object.fromEntries((formData as any).entries());
    const form = formJson as form_t;
    const [day, month, year] = form.date.split("/").map(Number);

    props.onSubmitTransaction?.({
      id: props.dafaultValue?.id,
      date: new Date(year, month - 1, day),
      money: Number(form.money),
      topic: form.topic,
      type: Number(form.type),
      description: form.description === "" ? undefined : form.description,
      who: form.who === "" ? (props.dafaultValue?.who?"":undefined) : form.who,
    });
  };
  const addContactHandler = (data: ContactForm_t) => {
    props.onSubmitContact?.(data);
    setOpenAddContact(false);
  };
  const editContactHandler = (data: ContactForm_t) => {
    props.onEditContact?.(data);
    setOpenEditContact(false);
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
      >
        {props.onDelTransaction && props.dafaultValue && (
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", flexGrow: 1 }}
          >
            <IconButton
              color="inherit"
              onClick={() => props.onDelTransaction?.(props.dafaultValue)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      </HeaderDialog>
      <Box
        component="form"
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
          icon={<PaidIcon />}
          required
          defauleValue={props.dafaultValue?.money.toString()}
          label="Amount"
          name="money"
          type="number"
        />
        <FieldSelector
          icon={<SyncAltIcon />}
          required
          defauleValue={props.dafaultValue?.type.toString()}
          name="type"
          label="Transaction"
          list={listSelect}
        />
        <FieldText
          icon={<PaidIcon />}
          required
          defauleValue={props.dafaultValue?.topic}
          name="topic"
          label="Topic"
        />
        <FieldText
          icon={<SubjectIcon />}
          defauleValue={props.dafaultValue?.description}
          name="description"
          label="Description"
          multiline
        />
        <FieldContact
          icon={<AccountBoxIcon />}
          list={props.contactList}
          onAdd={() => setOpenAddContact(true)}
          onDel={props.onDelContact}
          onEdit={(val) => {
            setContactInfo(val);
            setOpenEditContact(true);
          }}
          onSearch={props.onSearchContact}
          defaultValue={props.dafaultValue?.who}
          placeholder="Contact"
          name="who"
        />
        <FieldDate
          icon={<CalendarMonthIcon />}
          defaultValue={props.dafaultValue?.date || new Date()}
          name="date"
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
          <Button
            variant="outlined"
            sx={{ width: "150px" }}
            onClick={props.onClose}
          >
            cancle
          </Button>
        </Box>
      </Box>
      <DialogAddContact
        open={openAddContact}
        onSubmit={addContactHandler}
        onClose={() => setOpenAddContact(false)}
      />
      <DialogAddContact
        title="แก้ไขรายการ"
        open={openEditContact}
        onSubmit={editContactHandler}
        defaultValue={contactInfo}
        onClose={() => setOpenEditContact(false)}
      />
    </Dialog>
  );
};
export default DialogAddTransaction;
