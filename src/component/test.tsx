import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Adb";
import Box_Mobile from "./Atoms/Box_Mobile";
import Box_PC from "./Atoms/Box_PC";
import Divider from "@mui/material/Divider";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import WidgetsIcon from "@mui/icons-material/Widgets";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";

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

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar color="secondary" position="fixed">
      <Toolbar variant="dense" disableGutters>
        <Box_Mobile sx={{ flexGrow: 1 }}>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleOpenNavMenu}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorElNav}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            sx={{ display: { xs: "block", md: "none" } }}
          >
            {pages.map((page, index) => (
              <MenuItem
                key={index}
                onClick={handleCloseNavMenu}
                sx={{ gap: "4px" }}
              >
                {page.icon}
                <Typography sx={{ textAlign: "center" }}>
                  {page.text}
                </Typography>
              </MenuItem>
            ))}
          </Menu>
          <Box
            sx={{
              display: 'flex',
              flexGrow: "1",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
            }}
          >
            {pages[0].icon}
            <Typography
              variant="h5"
              noWrap
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                fontWeight: 500,
                //letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              {pages[0].text}
            </Typography>
          </Box>
        </Box_Mobile>

        <Box_PC sx={{ flexGrow: 1 }}>
          {pages.map((page, index) => (
            <>
              <Button
                key={index}
                onClick={handleCloseNavMenu}
                sx={{ color: "black", minWidth: "120px", height: "48px" }}
                startIcon={page.icon}
                variant="text"
                color="secondary"
                size="large"
              >
                {page.text}
              </Button>
              <Divider orientation="vertical" variant="middle" flexItem />
            </>
          ))}
        </Box_PC>
        <Box sx={{ flexGrow: 0 }}>
          <Tooltip title="Open settings">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: "10px" }}>
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ mt: "45px" }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            {settings.map((setting) => (
              <MenuItem key={setting} onClick={handleCloseUserMenu}>
                <Typography sx={{ textAlign: "center" }}>{setting}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
export default ResponsiveAppBar;
