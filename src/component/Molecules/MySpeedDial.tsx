import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  SxProps,
  Theme,
} from "@mui/material";

import { menuList_t } from "./AppBar_Mobile";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
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
  // Hook **************
  const navigate = useNavigate();
  // Local Function **************
  const handleClick = (index: number) => {
    if (props.onClick) {
      props.onClick(index);
    }
    if(props.menuList[index].path) {
      navigate(props.menuList[index].path);
    }
  }
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
          onClick={()=>handleClick(index)}
        />
      ))}
    </SpeedDial>
  );
};
export default MySpeedDial;
