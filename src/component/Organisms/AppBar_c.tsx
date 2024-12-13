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
const pages: iconLabel_t[] = [
  { text: "รายรับ/รายจ่าย", icon: <AccountBalanceWalletIcon /> },
  { text: "กู้ยืม", icon: <AccountBalanceIcon /> },
  { text: "ออกบิล", icon: <ReceiptLongIcon /> },
  { text: "สต็อก", icon: <WidgetsIcon /> },
  { text: "บันทึกเวลา", icon: <AssignmentIndIcon /> },
];
const settings = ["Set Password", "Logout"];

//*********************************************
// Interface
//*********************************************
interface myProps {
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

  return (
    <AppBar color="secondary" position="fixed">
      <Toolbar variant="dense" disableGutters>
        <AppBar_Mobile menuList={pages} value={index} onClick={handleAppBar} />
        <AppBar_PC menuList={pages} value={index} onClick={handleAppBar} />
        <Box sx={{ flexGrow: 0 }}>
          <ButtonOption
            menuList={settings}
            onClick={handleOption}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};
export default AppBar_c;
