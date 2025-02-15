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

//************************************************
// Define
//************************************************
export enum pageApp_e {
  access,
  lone,
  bill,
  stock,
  logger,
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
  { text: "Set User", path: "/setUser" },
  { text: "Set Password", path: "/setPass" },
  { text: "Logout", path: "/"}
];
const option_staff = ["Set Password", "Logout"];
//*********************************************
// Interface
//*********************************************
interface myProps {
  role?: "admin" | "cashier" | "laber";
  page?: pageApp_e;
  onClick?: (page: pageApp_e) => void;
}

//************************************************
// Component
//************************************************
const AppBar_c: React.FC<myProps> = (props) => {
  let index = props.page || 0 - pageApp_e.access;
  const handleAppBar = (index: number) => {
    props.onClick?.(pageApp_e.access + index);
  };
  const handleOption = (index: number) => {
    props.onClick?.(pageApp_e.setPass + index);
  };
  let menuList_AppBar = pagesList_labor;
  let menuList_Option = option_staff;

  if (props.role === "admin") {
    menuList_AppBar = pagesList_admin;
    menuList_Option = option_admin;
  } else if (props.role === "cashier") {
    menuList_AppBar = pagesList_cashier;
  }
  return (
    <AppBar color="secondary" position="static">
      <Toolbar variant="dense" disableGutters>
        <Box_Mobile sx={{ flexGrow: 1 }}>
          <AppBar_Mobile
            menuList={menuList_AppBar}
            value={index}
            onClick={handleAppBar}
          />
        </Box_Mobile>
        <Box_PC sx={{ flexGrow: 1 }}>
          <AppBar_PC
            menuList={menuList_AppBar}
            value={index}
            onClick={handleAppBar}
          />
        </Box_PC>
        <Box sx={{ flexGrow: 0 }}>
          <ButtonOption menuList={menuList_Option} onClick={handleOption} />
        </Box>
      </Toolbar>
    </AppBar>
  );
};
export default AppBar_c;
