import * as React from "react";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import { Box, SxProps, Theme } from "@mui/material";

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
export type iconLabel_t = { icon?: React.ReactNode; text: string };

//*********************************************
// Interface
//*********************************************
interface myProps {
  menuList: iconLabel_t[];
  value?: number;
  onClick?: (index: number) => void;
}
//*********************************************
// Component
//*********************************************
const AppBar_PC: React.FC<myProps> = (props) => {
  /* Local Variable*/
  let select = 0;
  if (props.value !== undefined) {
    select = props.value;
  }
  return (
    <Box sx={{ display: "flex" }}>
      {props.menuList.map((page, index) => (
        <React.Fragment key={index}>
          <Button
            key={page.text}
            onClick={() => {
              if (props.onClick) {
                props.onClick(index);
              }
            }}
            sx={{
              color: select === index ? "primary.contrastText" : "secondary.contrastText",
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
