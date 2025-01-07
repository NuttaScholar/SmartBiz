import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import WidgetsIcon from "@mui/icons-material/Widgets";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import AppBar_Mobile from "./AppBar_Mobile";
import AppBar_PC from "./AppBar_PC";
import ButtonOption from "../Molecules/ButtonOption";

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
// Type
//************************************************
type iconLabel_t = { icon?: React.ReactNode; text: string };

//************************************************
// Variable
//************************************************
const pagesList_admin: iconLabel_t[] = [
  { text: "รายรับ/รายจ่าย", icon: <AccountBalanceWalletIcon /> },
  { text: "กู้ยืม", icon: <AccountBalanceIcon /> },
  { text: "ออกบิล", icon: <ReceiptLongIcon /> },
  { text: "สต็อก", icon: <WidgetsIcon /> },
  { text: "บันทึกเวลา", icon: <AssignmentIndIcon /> },
];
const pagesList_cashier: iconLabel_t[] = [
  { text: "ออกบิล", icon: <ReceiptLongIcon /> },
  { text: "บันทึกเวลา", icon: <AssignmentIndIcon /> },
];
const pagesList_labor: iconLabel_t[] = [
  { text: "บันทึกเวลา", icon: <AssignmentIndIcon /> },
];
const option_admin = ["Set User", "Set Password", "Logout"];
const option_staff = ["Set Password", "Logout"];
//*********************************************
// Interface
//*********************************************
interface myProps {
  role?:"admin"|"cashier"|"laber"; 
  page?: pageApp_e;
  onClick?: (page: pageApp_e) => void;
}

//************************************************
// Component
//************************************************
const AppBar_c: React.FC<myProps> = (props) => {
  let index = props.page||0 - pageApp_e.access;
  const handleAppBar = (index: number) => {
    props.onClick?.(pageApp_e.access+index);
  };
  const handleOption = (index: number) => {
    props.onClick?.(pageApp_e.setPass+index);
  }
  let menuList_AppBar = pagesList_labor;
  let menuList_Option = option_staff;

  if(props.role==="admin"){
    menuList_AppBar = pagesList_admin;
    menuList_Option = option_admin;
  }else if(props.role==="cashier"){
    menuList_AppBar = pagesList_cashier;
  }
  return (
    <AppBar color="secondary" position="static">
      <Toolbar variant="dense" disableGutters>
        <AppBar_Mobile menuList={menuList_AppBar} value={index} onClick={handleAppBar} />
        <AppBar_PC menuList={menuList_AppBar} value={index} onClick={handleAppBar} />
        <Box sx={{ flexGrow: 0 }}>
          <ButtonOption
            menuList={menuList_Option}
            onClick={handleOption}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};
export default AppBar_c;
