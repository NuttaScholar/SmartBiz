import * as React from "react";
import AppBar_c from "../../component/Organisms/AppBar_c";
import MoneyTotal from "./component/MoneyTotal";
import MySpeedDial from "../../component/Molecules/MySpeedDial";
import { menuList_t } from "../../component/Molecules/AppBar_Mobile";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DialogFormTransaction, {
  TransitionForm_t,
} from "./component/DialogFormTransaction";
import DialogSearchTransaction from "./component/DialogSearchTransaction";
import { GoToTop } from "../../function/Window";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import YearyTransaction from "./component/YearyTransaction";
import {
  access_t,
  AccessContext,
  AccessDefaultState,
} from "../../context/AccessContext";
import { initTrans } from "./lib/initTrans";
import SpeedDial_Access from "./component/SpeedDialAccess";

const Page_Access: React.FC = () => {
  // Hook **************
  const navigate = useNavigate();
  const authContext = useAuth();
  const [state, setState] = React.useState<access_t>(AccessDefaultState);

  // Local Variable **************
  const MenuList: menuList_t[] = [
    { text: "Add", icon: <AddIcon /> },
    { text: "Search", icon: <SearchIcon /> },
    { text: "Go to Top", icon: <KeyboardArrowUpIcon /> },
  ];
  // Local Function **************
  const onClickTransHandler = (value: TransitionForm_t) => {
    console.log(value);
    setState((prev) => ({
      ...prev,
      transitionForm: value,
      openDialogEdit: true,
    }));
  };
  const speedDialHandler = (index: number) => {
    console.log(`SpeedDial: ${index}`);
    switch (index) {
      case 0:
        setState((prev) => ({ ...prev, openDialogAdd: true }));
        break;
      case 1:
        setState((prev) => ({ ...prev, openDialogSearch: true }));
        break;
      case 2:
        GoToTop();
    }
  };

  // Use Effect **************
  React.useEffect(() => {
    try {
      initTrans(authContext, { state, setState });
    } catch (err) {
      alert(`${err}`);
      navigate("/");
    }
  }, []);
  return (
    <AccessContext.Provider value={{ state, setState }}>
      <AppBar_c />
      <MoneyTotal
        sx={{ textAlign: "center", mt: "16px" }}
      />
      <YearyTransaction />
    
      <SpeedDial_Access/>
      
    </AccessContext.Provider>
  );
};

export default Page_Access;
