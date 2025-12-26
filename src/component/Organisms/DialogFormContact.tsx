import React, { useEffect } from "react";
import { Box, Button, Dialog, Slide } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ContactPageIcon from "@mui/icons-material/ContactPage";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import NotesIcon from "@mui/icons-material/Notes";
import { ContactForm_t, ContactInfo_t } from "../../API/AccountService/type";
import { useAuth } from "../../hooks/useAuth";
import contactWithRetry_f from "../../page/Access/lib/contactWithRetry";
import { ErrorString } from "../../function/Enum";
import HeaderDialog from "../Molecules/HeaderDialog";
import FieldText from "../Molecules/FieldText";

//*********************************************
// Type
//*********************************************

//*********************************************
// Constante
//*********************************************
const defaultValue: ContactForm_t = {
  codeName: "",
  billName: "",
  address: "",
  tel: "",
  taxID: "",
  description: "",
};
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
  onClose: (val?:ContactInfo_t[]) => void;
  defaultValue?: ContactInfo_t;
}
//*********************************************
// Component
//*********************************************
const DialogFormContact: React.FC<myProps> = (props) => {
  // Hook *********************
  const authContext = useAuth();
  const [form, setForm] = React.useState<ContactForm_t>(defaultValue);
  // Local Function ***********
  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (props.defaultValue) {
      // Edit
      contactWithRetry_f
        .put(authContext, form)
        .then((val) => {
          if (val.result) {            
            props.onClose(val.result);
          } else if (val.errCode) {
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
          if (val.result) {
            props.onClose(val.result);
          } else if (val.errCode) {
            alert(ErrorString(val.errCode));
          }
        })
        .catch((err) => {
          console.log(err);
          alert(err.message);
        });
    }
    setForm(defaultValue);
  };
  const onClose = () => {
    props.onClose();
  };
  useEffect(() => {
    setForm({
      codeName: props.defaultValue?.codeName || "",
      billName: props.defaultValue?.billName || "",
      address: props.defaultValue?.address || "",
      tel: props.defaultValue?.tel || "",
      taxID: props.defaultValue?.taxID || "",
      description: props.defaultValue?.description || "",
    });
  }, [props.defaultValue]);
  return (
    <Dialog
      fullScreen
      open={props.open}
      onClose={onClose}
      slots={{
        transition: Transition,
      }}
    >
      <HeaderDialog
        label={props.defaultValue ? "แก้ไขรายการ" : "เพิ่มรายการ"}
        onClick={onClose}
      />
      <Box
        component= "form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          alignItems: "center",
          my: "72px",
          gap: "8px",
        }}
      >
        <FieldText
          icon={<AccountCircleIcon />}
          required
          label="Code Name"
          name="codeName"
          value={form.codeName}
          onChange={onChangeHandler}
        />
        <FieldText
          icon={<ContactPageIcon />}
          required
          label="Bill Name"
          name="billName"
          value={form.billName}
          onChange={onChangeHandler}
        />
        <FieldText
          icon={<LocationOnIcon />}
          name="address"
          label="Address"
          multiline
          value={form.address}
          onChange={onChangeHandler}
        />
        <FieldText
          icon={<LocalPhoneIcon />}
          label="Tel."
          name="tel"
          value={form.tel}
          onChange={onChangeHandler}
        />
        <FieldText
          icon={<RecentActorsIcon />}
          label="Tax. ID"
          name="taxID"
          value={form.taxID}
          onChange={onChangeHandler}
        />
        <FieldText
          icon={<NotesIcon />}
          name="description"
          label="More Detail"
          multiline
          value={form.description}
          onChange={onChangeHandler}
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
