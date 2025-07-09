import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import WidgetsIcon from "@mui/icons-material/Widgets";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import AppBar_Mobile, { menuList_t } from "../Molecules/AppBar_Mobile";
import AppBar_PC from "../Molecules/AppBar_PC";
import ButtonOption from "../Molecules/ButtonOption";
import Box_Mobile from "../Atoms/Box_Mobile";
import Box_PC from "../Atoms/Box_PC";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { role_e } from "../../enum";
import * as Login_f from "../../API/LoginService/Login";

//************************************************
// Define
//************************************************
export enum pageApp_e {
  access,
  lone,
  bill,
  stock,
  logger,
  setUser,
  setPass,
  logout,
}

//************************************************
// Variable
//************************************************
const pagesList_admin: menuList_t[] = [
  {
    text: "รายรับ/รายจ่าย",
    icon: <AccountBalanceWalletIcon />,
    path: "/access",
  },
  { text: "กู้ยืม", icon: <AccountBalanceIcon />, path: "/cadit" },
  { text: "ออกบิล", icon: <ReceiptLongIcon />, path: "/bill" },
  { text: "สต็อก", icon: <WidgetsIcon />, path: "/stock" },
  { text: "บันทึกเวลา", icon: <AssignmentIndIcon />, path: "/checkIn" },
];
const pagesList_cashier: menuList_t[] = [
  { text: "ออกบิล", icon: <ReceiptLongIcon />, path: "/bill" },
  { text: "บันทึกเวลา", icon: <AssignmentIndIcon />, path: "/checkIn" },
];
const pagesList_labor: menuList_t[] = [
  { text: "บันทึกเวลา", icon: <AssignmentIndIcon />, path: "/checkIn" },
];
const option_admin: menuList_t[] = [
  { text: "Set User", path: "/setuser" },
  { text: "Set Password", path: "/setpass" },
  { text: "Logout", path: "/" },
];
const option_staff: menuList_t[] = [
  { text: "Set Password", path: "/setpass" },
  { text: "Logout", path: "/" },
];
//*********************************************
// Interface
//*********************************************
interface myProps {
  onClick?: (page: menuList_t) => void;
}

//************************************************
// Component
//************************************************
const AppBar_c: React.FC<myProps> = (props) => {
  // Hook ********************
  const location = useLocation();
  const { auth, setAuth } = useAuth();
  // Local Function **********
  const handleOption = async(menuList: menuList_t) => {
    try {
      if (menuList.path === "/") {
        const res = await Login_f.postLogout();
        console.log(res);
      }
    } catch (err) {
      console.log(err);
    }
  };
  // Local Variable **********
  let menuList_AppBar = pagesList_labor;
  let menuList_Option = option_staff;
  switch (auth?.role) {
    case role_e.admin:
      menuList_AppBar = pagesList_admin;
      menuList_Option = option_admin;
      break;
    case role_e.cashier:
      menuList_AppBar = pagesList_cashier;
      break;
  }
  const index = menuList_AppBar.findIndex(
    (val) => val.path === location.pathname
  );
  // XML Code *****************
  return (
    <AppBar color="secondary" position="static">
      <Toolbar variant="dense" disableGutters>
        <Box_Mobile sx={{ flexGrow: 1 }}>
          <AppBar_Mobile menuList={menuList_AppBar} value={index} />
        </Box_Mobile>
        <Box_PC sx={{ flexGrow: 1 }}>
          <AppBar_PC menuList={menuList_AppBar} value={index} />
        </Box_PC>

        <Box sx={{ flexGrow: 0 }}>
          <ButtonOption menuList={menuList_Option} onClick={handleOption} />
        </Box>
      </Toolbar>
    </AppBar>
  );
};
export default AppBar_c;
