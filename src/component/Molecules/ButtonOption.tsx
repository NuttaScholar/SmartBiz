import * as React from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { Box, SxProps, Theme } from "@mui/material";

//************************************************
// Type
//************************************************
export type menuList_t = {
  icon?: React.ReactNode;
  text: string;
  path?: string;
};
/**************************************************** */
//  Interface
/**************************************************** */
interface MyProps {
  title?: string;
  menuList: menuList_t[];
  onClick?: (data: menuList_t) => void;
  icon?: React.ReactNode;
  sx?: SxProps<Theme>;
}
/**************************************************** */
//  Function
/**************************************************** */
const ButtonOption: React.FC<MyProps> = (props) => {
  /* UseState */
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );
  const navigate = useNavigate();
  /* Local Function */
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  const handleOnClick = (menuList: menuList_t) => {
    setAnchorElUser(null);
    props.onClick?.(menuList);
    if (menuList.path) navigate(menuList.path);
  };
  return (
    <Box sx={props.sx}>
      <Tooltip title={props.title}>
        <IconButton
          onClick={handleOpenUserMenu}
          sx={{ p: "10px", height: "44px", color: "secondary.contrastText" }}
        >
          {props.icon||<MoreVertIcon />}
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
        {props.menuList.map((value) => (
          <MenuItem
            key={value.text}
            onClick={() => {
              handleOnClick(value);
            }}
          >
            <Typography sx={{ textAlign: "center" }}>{value.text}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};
export default ButtonOption;
