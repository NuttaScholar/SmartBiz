import React from "react";
import { Box, Dialog, Slide } from "@mui/material";
import FieldSearch from "../component/Molecules/FieldSearch";
import HeaderContactList from "../component/Organisms/HeaderDialog_Search";
import ListContact from "../component/Organisms/ListContact";
import { TransitionProps } from "@mui/material/transitions";
import DialogAddContact from "./DialogAddContact";
import HeaderDialog_Search from "../component/Organisms/HeaderDialog_Search";
import ListUser from "../component/Organisms/ListUser";
import { userInfo_t } from "../component/Molecules/UserInfo";
import DialogAddUser from "./DialogAddUser";
import DialogEditUser from "./DialogEditUser";
import { role_e } from "../enum";
import * as User_f from "../API/LoginService/User"
import * as Login_f from '../API/LoginService/Login'
import { useNavigate } from "react-router-dom";
import { UserProfile_t } from "../API/LoginService/type";
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
  onClose?: () => void;
}
//*********************************************
// Component
//*********************************************
const DialogSetUser: React.FC<myProps> = (props) => {
  // Hook **************
  const navigate = useNavigate();
  const [key, setKey] = React.useState("");
  const [list, setList] = React.useState<UserProfile_t[]>([]);
  const [openAdd, setOpenAdd] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);

  // Local Function **************
  function onChangeHandler(event: React.ChangeEvent<HTMLInputElement>) {
    setKey(event.target.value);
  }
  const onSearch = (keyword: string) => {};
  const onAdd = () => {
    setOpenAdd(true);
  };
  const onEdit = (val: UserProfile_t) => {
    setOpenEdit(true);
  };
  const onDel = (val: UserProfile_t) => {};
  const initPage = async () => {
      try {
        const resLogin = await Login_f.getToken();
        console.log(resLogin);
        if (resLogin.status === "error" || !resLogin.token) {
          navigate("/");
        } else {
          const resUser = await User_f.get(resLogin.token);
          if(resUser.status==="success"&&resUser.result){
            setList(resUser.result);
            console.log(resUser);
          }else{
            // Alert Err Msg 
          }
          
        }
      } catch (err) {
        console.log(err);
      }
    };
  // Use Effect **************
  React.useEffect(() => {
    console.log("get user!");
    initPage();
  }, [props.open]);
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
        label="Set User"
        onBack={props.onClose}
        onChange={onChangeHandler}
        onSearch={onSearch}
        onAdd={onAdd}
        value={key}
      />
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <FieldSearch
          label="Search"
          display={{ xs: "flex", sm: "none" }}
          value={key}
          onChange={onChangeHandler}
          onSubmit={onSearch}
        />
      </Box>
      <ListUser list={list} onDel={onDel} onEdit={onEdit} />
      <DialogAddUser open={openAdd} onClose={() => setOpenAdd(false)} />
      <DialogEditUser
        open={openEdit}
        defaultValue={{
          email: "admin@default.com",
          enable: true,
          name: "NuttaScholar",
          role: role_e.admin,    
          tel: "123456789"      
        }}
        onClose={() => setOpenEdit(false)}
      />
    </Dialog>
  );
};
export default DialogSetUser;
