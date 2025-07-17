import React from "react";
import { Box, Dialog, Slide } from "@mui/material";
import FieldSearch from "../../../component/Molecules/FieldSearch";
import HeaderDialog_Search from "../../../component/Molecules/HeaderDialog_Search";
import ListContact from "../../../component/Molecules/ListContact";
import { TransitionProps } from "@mui/material/transitions";
import { contactInfo_t } from "../../../component/Molecules/ContactInfo";
import { useAuth } from "../../../hooks/useAuth";
import { useAccess } from "../hooks/useAccess";
import { useNavigate } from "react-router-dom";
import contactWithRetry_f from "../lib/contactWithRetry";
import DialogFormContact from "./DialogFormContact";
import { ErrorString } from "../../../function/Enum";
import { errorCode_e } from "../../../enum";
import { accessDialog_e } from "../context/AccessContext";
//*********************************************
// Type
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

//*********************************************
// Component
//*********************************************
const DialogContactList: React.FC = () => {
  // Hook *********************
  const navigate = useNavigate();
  const authContext = useAuth();
  const { state, setState } = useAccess();

  // Local Function ***********
  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, contactKey: event.target.value });
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
      <Dialog
        fullScreen
        open={state.open === accessDialog_e.contactList}
        onClose={() =>
          setState({
            ...state,
            open: accessDialog_e.transactionForm,
          })
        }
        slots={{
          transition: Transition,
        }}
      >
        <HeaderDialog_Search
          label="รายชื่อผู้ติดต่อ"
          onBack={() =>
            setState({
              ...state,
              open: accessDialog_e.transactionForm,
            })
          }
          onChange={onChangeHandler}
          onAdd={() =>
            setState({
              ...state,
              open: accessDialog_e.contactFrom,
              contactInfo: undefined,
            })
          }
          value={state.contactKey}
          onSearch={onSearch}
        />
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <FieldSearch
            label="Search"
            display={{ xs: "flex", sm: "none" }}
            value={state.contactKey}
            onChange={onChangeHandler}
            onSubmit={onSearch}
          />
        </Box>
        <ListContact
          list={state.contactList}
          onClick={(codeName) => {
            setState({
              ...state,
              fieldContact: codeName,
              open: accessDialog_e.transactionForm,
            });
          }}
          onDel={onDelContacat}
          onEdit={(val) => {
            setState({
              ...state,
              open: accessDialog_e.contactFrom,
              contactInfo: val,
            });
          }}
        />
      </Dialog>

      <DialogFormContact />
    </>
  );
};
export default DialogContactList;
