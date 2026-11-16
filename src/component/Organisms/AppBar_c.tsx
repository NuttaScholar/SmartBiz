import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import WidgetsIcon from "@mui/icons-material/Widgets";
import AppBar_Mobile, { menuList_t } from "../Molecules/AppBar_Mobile";
import AppBar_PC from "../Molecules/AppBar_PC";
import ButtonOption from "../Molecules/ButtonOption";
import Box_Mobile from "../Atoms/Box_Mobile";
import Box_PC from "../Atoms/Box_PC";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { role_e } from "../../enum";
import * as Login_f from "../../API/LoginService/Login";
import { Typography } from "@mui/material";

//************************************************
// Define
//************************************************
export enum pageApp_e {
  access,
  customer,
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
  { text: "ลูกค้า", icon: <PeopleAltIcon />, path: "/customer" },
  { text: "ออกบิล", icon: <ReceiptLongIcon />, path: "/bill" },
  { text: "สต็อก", icon: <WidgetsIcon />, path: "/stock" },
];
const pagesList_cashier: menuList_t[] = [
  { text: "ออกบิล", icon: <ReceiptLongIcon />, path: "/bill" },
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
const sidebarWidth = 240;
//*********************************************
// Interface
//*********************************************
interface myProps {
  children?: React.ReactNode;
}
//************************************************
// Component
//************************************************
const AppBar_c: React.FC<myProps> = (props) => {
  // Hook ********************
  const location = useLocation();
  const { auth } = useAuth();
  // Local Function **********
  const handleOption = async (menuList: menuList_t) => {
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
  let menuList_AppBar: menuList_t[] = [];
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
    (val) =>
      val.path === location.pathname ||
      (val.path && location.pathname.startsWith(`${val.path}/`)),
  );
  // XML Code *****************
  return (
    <>
      <AppBar
        sx={{ display: { xs: "block", md: "none" } }}
        color="secondary"
        position="fixed"
      >
        <Toolbar variant="dense" disableGutters>
          <Box_Mobile sx={{ flexGrow: 1 }}>
            <AppBar_Mobile menuList={menuList_AppBar} value={index} />
          </Box_Mobile>

          <Box sx={{ flexGrow: 0 }}>
            <ButtonOption menuList={menuList_Option} onClick={handleOption} />
          </Box>
        </Toolbar>
      </AppBar>
      <Box_PC
        component="nav"
        aria-label="เมนูหลัก"
        sx={{
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          width: sidebarWidth,
          overflowY: "auto",
          bgcolor: "background.paper",
          borderRight: 1,
          borderColor: "divider",
        }}
      >
        <List
          dense
          sx={{ px: 1, py: 2, flexGrow: 1, minHeight: 0, overflowY: "auto" }}
        >
          {menuList_AppBar.map((page, pageIndex) => (
            <ListItemButton
              key={page.path ?? page.text}
              component={RouterLink}
              to={page.path ?? "#"}
              selected={index === pageIndex}
              aria-current={index === pageIndex ? "page" : undefined}
              sx={{ borderRadius: 1, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{page.icon}</ListItemIcon>
              <ListItemText primary={page.text} />
            </ListItemButton>
          ))}
        </List>
      </Box_PC>
      <Box
        sx={{
          display: "flex",
          mt: { xs: "50px", md: 0 },
          ml: { md: `${sidebarWidth}px` },
          minWidth: 0,
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            width: "100%",
            bgcolor: "secondary.main",
            py: 1,
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          <Box sx={{ display: "flex", flexGrow: 1, pl: "44px" }}>
          <AppBar_PC menuList={menuList_AppBar} value={index} />
          </Box>
          <Box sx={{ flexGrow: 0, pr: 1 }}>
            <ButtonOption menuList={menuList_Option} onClick={handleOption} />
          </Box>
        </Box>
        {props.children}
      </Box>
    </>
  );
};
export default AppBar_c;
