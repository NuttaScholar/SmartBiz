import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { menuList_t } from "./AppBar_Mobile";

type AvatarOptionProps = {
  name?: string;
  menuList: menuList_t[];
  onClick: (option: menuList_t) => void;
};

export default function AvatarOption({ name, menuList, onClick }: AvatarOptionProps) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const menuId = React.useId();
  const navigate = useNavigate();
  const initials = name?.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase() || "?";

  const selectOption = (option: menuList_t) => {
    setAnchorEl(null);
    onClick(option);
    if (option.path) navigate(option.path);
  };

  return (
    <>
      <IconButton
        aria-label={`เมนูผู้ใช้ ${name || ""}`.trim()}
        aria-controls={anchorEl ? menuId : undefined}
        aria-haspopup="true"
        aria-expanded={Boolean(anchorEl)}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{ p: 0.5 }}
      >
        <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText", width: 36, height: 36 }}>
          {initials}
        </Avatar>
      </IconButton>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { minWidth: 220 } } }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="caption" color="text.secondary">ผู้ใช้งาน</Typography>
          <Typography fontWeight={600}>{name?.trim() || "ผู้ใช้"}</Typography>
        </Box>
        <Divider />
        {menuList.map((option) => (
          <MenuItem key={option.text} onClick={() => selectOption(option)}>
            <Typography>{option.text}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
