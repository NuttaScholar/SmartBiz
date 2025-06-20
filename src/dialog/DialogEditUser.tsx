import React from "react";
import { Box, Button, Dialog, Slide } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import HeaderDialog from "../component/Molecules/HeaderDialog";
import FieldText from "../component/Molecules/FieldText";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ContactPageIcon from "@mui/icons-material/ContactPage";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import NotesIcon from "@mui/icons-material/Notes";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import { EditUserFrom_t, RegistFrom_t, UserProfile_t } from "../API/LoginService/type";
import FieldSelector, {
  listSelect_t,
} from "../component/Molecules/FieldSelector";
import { role_e } from "../enum";

//*********************************************
// Type
//*********************************************

//*********************************************
// ListSelect
//*********************************************
const roleSelect: listSelect_t[] = [
  { label: "Admin", value: role_e.admin },
  { label: "Cashier", value: role_e.cashier },
  { label: "Laber", value: role_e.laber },
];
const enSelect: listSelect_t[] = [
  { label: "Disable", value: 0 },
  { label: "Enable", value: 1 },
];
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
  defaultValue: UserProfile_t;
  onClose?: () => void;
  onSubmit?: (data: EditUserFrom_t) => void;
}
//*********************************************
// Component
//*********************************************
const DialogEditUser: React.FC<myProps> = (props) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    let formJson = Object.fromEntries((formData as any).entries());
    const form = formJson as EditUserFrom_t;

    props.onSubmit?.(form);
  };

  return (
    <Dialog
      fullScreen
      open={props.open}
      onClose={props.onClose}
      slots={{
        transition: Transition,
      }}
    >
      <HeaderDialog
        label={props.title || "แก้ไขรายการ"}
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
          my: "32px",
          gap: "8px",
        }}
      >
        <FieldText
          icon={<AccountCircleIcon />}
          required
          label="Email"
          name="email"
          defauleValue={props.defaultValue?.email}
        />
        <FieldText
          icon={<ContactPageIcon />}
          required
          label="Name"
          name="name"
          defauleValue={props.defaultValue?.name}
        />
        <FieldSelector
          required
          icon={<ManageAccountsIcon />}
          defauleValue={props.defaultValue?.role.toString()}
          name="role"
          label="Role"
          list={roleSelect}
        />
        <FieldText
          icon={<LocalPhoneIcon />}
          label="Tel."
          name="tel"
          defauleValue={props.defaultValue?.tel}
        />
        <FieldSelector
          required
          icon={<ManageAccountsIcon />}
          defauleValue={props.defaultValue?.enable?"1":"0"}
          name="enable"
          label="Enable"
          list={enSelect}
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
export default DialogEditUser;
