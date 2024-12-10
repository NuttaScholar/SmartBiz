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

function AppBar_c() {  
  const [page, setPage] = React.useState<number>(0);
  const handleOnClick = (index:number) => {
    setPage(index);
  }

  return (
    <AppBar color="secondary" position="fixed">
      <Toolbar variant="dense" disableGutters>
      <AppBar_Mobile menuList={pages} value={page} onClick={handleOnClick}/>
      <AppBar_PC menuList={pages} value={page} onClick={handleOnClick}/>
        <Box sx={{ flexGrow: 0 }}>
          <ButtonOption menuList={settings} onClick={(index)=>console.log(index)}/>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
export default AppBar_c;
