import {
  Box,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import Text_Money from "../Atoms/Text_Money";
import FileCopyIcon from "@mui/icons-material/FileCopyOutlined";
import SaveIcon from "@mui/icons-material/Save";
import PrintIcon from "@mui/icons-material/Print";
import ShareIcon from "@mui/icons-material/Share";
import { menuList_t } from "../Molecules/AppBar_Mobile";
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
      sx={{ position: "absolute", bottom: 16, right: 16 }}
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
