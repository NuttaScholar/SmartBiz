import * as React from "react";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";

//************************************************
// Type
//************************************************
export type menuList_t = {
  icon?: React.ReactNode;
  text: string;
  path?: string;
};

//*********************************************
// Interface
//*********************************************
interface myProps {
  menuList: menuList_t[];
  value?: number;
  onClick?: (index: number) => void;
}
//*********************************************
// Component
//*********************************************
const AppBar_Mobile: React.FC<myProps> = (props) => {
  /* UseState */
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );
  const navigate = useNavigate();
  /* Local Function */
  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };
  const handleOnClick = (index: number) => {
    setAnchorElNav(null);
    props.onClick?.(index);
    if (props.menuList[index].path) navigate(props.menuList[index].path);
  };
  /* Local Variable*/
  const size_list = props.menuList.length;
  let index = 0;
  if (props.value !== undefined) {
    if (props.value >= size_list) {
      index = size_list - 1;
    } else {
      index = props.value;
    }
  }
  /* Return */
  return (
    <Box sx={{ display: "flex", flexGrow: 1 }}>
      <IconButton
        size="large"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleOpenNavMenu}
        sx={{color: "secondary.contrastText"}}
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
        {props.menuList.map((page, index) => (
          <MenuItem
            key={index}
            onClick={() => handleOnClick(index)}
            sx={{ gap: "4px" }}
          >
            {page.icon}
            <Typography sx={{ textAlign: "center" }}>{page.text}</Typography>
          </MenuItem>
        ))}
      </Menu>
      <Box
        sx={{
          display: "flex",
          flexGrow: "1",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
        }}
      >
        {props.menuList[index].icon}
        <Typography
          variant="h5"
          noWrap
          sx={{
            mr: 2,
            display: { xs: "flex", md: "none" },
            fontWeight: 500,
            //letterSpacing: ".3rem",
            color: "secondary.contrastText",
            textDecoration: "none",
          }}
        >
          {props.menuList[index].text}
        </Typography>
      </Box>
    </Box>
  );
};
export default AppBar_Mobile;
