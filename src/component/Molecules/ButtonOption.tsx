import * as React from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

/**************************************************** */
//  Interface
/**************************************************** */
interface MyProps {
  title?: string;
  menuList: string[];
  onClick?: (index: number) => void;
}
/**************************************************** */
//  Function
/**************************************************** */
const ButtonOption: React.FC<MyProps> = (props) => {
  /* UseState */
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );
  /* Local Function */
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  const handleOnClick = (index:number) => {
    setAnchorElUser(null);
    if(props.onClick)props.onClick(index)
  };
  return (
    <>
      <Tooltip title={props.title}>
        <IconButton onClick={handleOpenUserMenu} sx={{ p: "10px", height: "44px", color: "secondary.contrastText" }}>
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
        {props.menuList.map((value, index) => (
          <MenuItem key={value} onClick={()=>{handleOnClick(index)}}>
            <Typography sx={{ textAlign: "center" }}>{value}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
export default ButtonOption;
