import React from "react";
import { Box, Dialog, Slide } from "@mui/material";
import FieldSearch from "../../../component/Molecules/FieldSearch";
import HeaderDialog_Search from "../../../component/Molecules/HeaderDialog_Search";
import ListContact from "../../../component/Molecules/ListContact";
import { TransitionProps } from "@mui/material/transitions";
import { contactInfo_t } from "../../../component/Molecules/ContactInfo";
import { useAuth } from "../../../hooks/useAuth";
import { useAccess } from "../../../hooks/useAccess";
import { useNavigate } from "react-router-dom";
import apiWithRetry_f from "../../../lib/apiWithRetry";
import DialogAddContact, {
  ContactForm_t,
} from "../../../component/Molecules/DialogFormContact";
import Contact_f from "../../../API/AccountService/Contact";
//*********************************************
// Type
//*********************************************
type myState_t = {
  key?: string;
  openAdd: boolean;
  openEdit: boolean;
  contactInfo?: contactInfo_t;
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
  onClose?: () => void;
  onSelect?: (codeName: string) => void;
  onDel?: (val: contactInfo_t) => void;
}
//*********************************************
// Component
//*********************************************
const DialogContactList: React.FC<myProps> = (props) => {
  // Hook *********************
  const navigate = useNavigate();
  const authContext = useAuth();
  const { state, setState } = useAccess();
  const [myState, setMyState] = React.useState<myState_t>({
    openAdd: false,
    openEdit: false,
  });

  // Local Function ***********
  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMyState({ ...myState, key: event.target.value });
  };
  const onSearch = async (keyword: string) => {
    console.log(keyword);
    apiWithRetry_f
      .getContact(authContext, keyword)
      .then((val) => {
        setState({ ...state, contactList: val });
      })
      .catch((err) => {
        console.log(err);
        navigate("/");
      });
  };
  const onAddContact = async (data: ContactForm_t) => {
    apiWithRetry_f
      .postContact(authContext, data)
      .then((val) => {
        setTimeout(()=>setState({ ...state, contactList: val}),500);
        setMyState({...myState, openAdd: false});
      })
      .catch((err) => {
        console.log(err);
        navigate("/");
      });
  };
  const onEditContact = async (data: ContactForm_t) => {
    apiWithRetry_f
      .putContact(authContext, data)
      .then((val) => {
        setTimeout(()=>setState({ ...state, contactList: val }),500);
        setMyState({...myState, openEdit: false});
      })
      .catch((err) => {
        console.log(err);
        navigate("/");
      });
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
      <HeaderDialog_Search
        label="รายชื่อผู้ติดต่อ"
        onBack={props.onClose}
        onChange={onChangeHandler}
        onAdd={() => setMyState({ ...myState, openAdd: true })}
        value={myState.key}
        onSearch={onSearch}
      />
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <FieldSearch
          label="Search"
          display={{ xs: "flex", sm: "none" }}
          value={myState.key}
          onChange={onChangeHandler}
          onSubmit={onSearch}
        />
      </Box>
      <ListContact
        list={state.contactList}
        onClick={props.onSelect}
        onDel={props.onDel}
        onEdit={(val) => setMyState({ ...myState, openEdit: true, contactInfo: val })}
      />

      <DialogAddContact
        open={myState.openAdd}
        onSubmit={onAddContact}
        onClose={() => setMyState({ ...myState, openAdd: false })}
      />
      <DialogAddContact
        title="แก้ไขรายการ"
        open={myState.openEdit}
        onSubmit={onEditContact}
        defaultValue={myState.contactInfo}
        onClose={() => setMyState({ ...myState, openEdit: false })}
      />
    </Dialog>
  );
};
export default DialogContactList;
