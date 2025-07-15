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
import contactWithRetry_f from "../../../lib/contactWithRetry";
import DialogAddContact, {
  ContactForm_t,
} from "../../../component/Molecules/DialogFormContact";
import { ErrorString } from "../../../function/Enum";
import { errorCode_e } from "../../../enum";
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
  return <Slide direction="left" ref={ref} {...props} />;
});

//*********************************************
// Interface
//*********************************************
interface myProps {
  open: boolean;
  onClose?: () => void;
  onSelect?: (codeName: string) => void;
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
    contactWithRetry_f
      .get(authContext, keyword)
      .then((val) => {
        if (val.result) {
          setState({ ...state, contactList: val.result });
        } else if (val.errCode) {
          alert(ErrorString(val.errCode));
          if (val.errCode === errorCode_e.TokenExpiredError) {
            navigate("/");
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const onAddContact = async (data: ContactForm_t) => {
    contactWithRetry_f
      .post(authContext, data)
      .then((res) => {
        if (res.result) {
          const val = res.result;
          setTimeout(() => setState({ ...state, contactList: val }), 500);
        } else if (res.errCode) {
          alert(ErrorString(res.errCode));
          if (res.errCode === errorCode_e.TokenExpiredError) {
            navigate("/");
          }
        }
        setMyState({ ...myState, openAdd: false });
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const onEditContact = async (data: ContactForm_t) => {
    contactWithRetry_f
      .put(authContext, data)
      .then((res) => {
        if (res.result) {
          const val = res.result;
          setTimeout(() => setState({ ...state, contactList: val }), 500);
        } else if (res.errCode) {
          alert(ErrorString(res.errCode));
          if (res.errCode === errorCode_e.TokenExpiredError) {
            navigate("/");
          }
        }
        setMyState({ ...myState, openEdit: false });
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const onDelContacat = async (data: contactInfo_t) => {
    contactWithRetry_f
      .del(authContext, data)
      .then((res) => {
        if (res.status === "success") {
          res.result && setState({ ...state, contactList: res.result });
        } else {
          res.errCode && alert(ErrorString(res.errCode));
        }
      })
      .catch((err) => {
        console.log(err);
        navigate("/");
      });
  };
  return (
    <>
      {(!myState.openEdit && !myState.openAdd) && (
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
            onDel={onDelContacat}
            onEdit={(val) =>
              setMyState({ ...myState, openEdit: true, contactInfo: val })
            }
          />
        </Dialog>
      )}
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
    </>
  );
};
export default DialogContactList;
