import * as React from "react";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import { Box, SxProps, Theme } from "@mui/material";
import { useNavigate } from "react-router-dom";

//*********************************************
// Style
//*********************************************
const Button_Style: SxProps<Theme> = {
  borderRadius: 0,
  minWidth: "120px",
  height: "48px",
};
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
  onClick?: (page: menuList_t) => void;
}
//*********************************************
// Component
//*********************************************
const AppBar_PC: React.FC<myProps> = (props) => {
  /* Local Variable*/
  let select = props.value ?? 0; //  ถ้า props.value เป็น undefine หรือ Null ให้ select = 0
  const navigate = useNavigate();

  /* Local Function*/
  const handleOnClick = (menuList: menuList_t) => {
    props.onClick?.(menuList);
    if (menuList.path) navigate(menuList.path);
  };
  return (
    <Box sx={{ display: "flex" }}>
      {props.menuList.map((page, index) => (
        <React.Fragment key={index}>
          <Button
            key={page.text}
            onClick={() => {
              handleOnClick(page);
            }}
            sx={{
              color:
                select === index
                  ? "primary.contrastText"
                  : "secondary.contrastText",
              bgcolor:
                select === index ? "primary.main" : "secondary.main" /* Note */,
              m: index === 0 ? "0 4px 0 0" : "0 4px",
              ...Button_Style,
            }}
            startIcon={page.icon}
            variant="text"
            size="large"
          >
            {page.text}
          </Button>
          <Divider orientation="vertical" variant="middle" flexItem />
        </React.Fragment>
      ))}
    </Box>
  );
};
export default AppBar_PC;
