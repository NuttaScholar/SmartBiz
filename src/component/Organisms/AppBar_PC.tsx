import * as React from "react";
import { iconLabel_t } from "../../Typedef";
import Box_PC from "../Atoms/Box_PC";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import { SxProps, Theme } from "@mui/material";

//*********************************************
// Style
//*********************************************
const Button_Style: SxProps<Theme> = {
  borderRadius: 0,
  minWidth: "120px",
  height: "48px",
};
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
  console.log(select);
  return (
    <Box_PC sx={{ flexGrow: 1 }}>
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
              color: select === index ? "white" : "black",
              bgcolor:
                select === index ? "primary.main" : "secondary.main" /* Note */,
              m: index === 0 ? "0 4px 0 0" : "0 4px",
              ...Button_Style
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
    </Box_PC>
  );
};
export default AppBar_PC;
