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
  const [key, setKey] = React.useState("");
  const [list, setList] = React.useState<userInfo_t[]>([]);

  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKey(event.target.value);
  };
  // Local Function **************
  const onSearch = (keyword: string) => {};
  const onAdd = () => {};
  const onEdit = (val: userInfo_t) => {};
  const onDel = (val: userInfo_t) => {};
  // Use Effect **************
  React.useEffect(() => {
    console.log("get user!");
    setList([
      {
        email: "admin@default.com",
        enable: true,
        name: "NuttaScholar",
        role: "admin",
        tel: "123456789",
      },
      {
        email: "admin@default.com",
        enable: false,
        name: "NuttaScholar",
        role: "admin",
        tel: "123456789",
      },
    ]);
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
    </Dialog>
  );
};
export default DialogSetUser;
