import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  SxProps,
  Theme,
} from "@mui/material";

import { menuList_t } from "./AppBar_Mobile";
import { ReactNode } from "react";
//*********************************************
// Style
//*********************************************

//*********************************************
// Variable
//*********************************************

//*********************************************
// Interface
//*********************************************
interface myProps {
  sx?: SxProps<Theme>;
  menuList: menuList_t[];
  onClick?: (index: number) => void;
  icon?: ReactNode;
}
//*********************************************
// Component
//*********************************************
const MySpeedDial: React.FC<myProps> = (props) => {

  return (
    <SpeedDial
      ariaLabel="SpeedDial basic example"
      sx={{ position: "fixed", bottom: 16, right: 16 }}
      icon={props.icon||<SpeedDialIcon />}
    >
      {props.menuList.map((action, index) => (
        <SpeedDialAction
          key={action.text}
          icon={action.icon}
          tooltipTitle={action.text}
          onClick={()=>props.onClick?.(index)}
        />
      ))}
    </SpeedDial>
  );
};
export default MySpeedDial;
