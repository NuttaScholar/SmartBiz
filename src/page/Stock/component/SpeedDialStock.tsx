import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MySpeedDial from "../../../component/Molecules/MySpeedDial";
import { menuList_t } from "../../../component/Molecules/ButtonOption";
import { GoToTop } from "../../../function/Window";
import React, { useMemo } from "react";
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import { useStockContext } from "../hooks/useStockContex";
import { stockDialog_e } from "../context/StockContext";

//*********************************************
// Style
//*********************************************

//*********************************************
// Variable
//*********************************************
const MenuList: menuList_t[] = [
  { text: "Create", icon: <AddIcon /> },
  { text: "Stock In", icon: <DownloadIcon /> },
  { text: "Stock Out", icon: <UploadIcon /> },
  { text: "Go to Top", icon: <KeyboardArrowUpIcon /> },
];
//*********************************************
// Interface
//*********************************************

//*********************************************
// Component
//*********************************************
const SpeedDial_Stock: React.FC = () => {
  const { state, setState } = useStockContext();

  const speedDialHandler = (index: number) => {
    console.log(`SpeedDial: ${index}`);
    switch (index) {
      case 0:
        setState({ ...state, dialogOpen: stockDialog_e.createForm });
        break;
      case 1:
        console.log("Stock In Form");
        break;
      case 2:
        console.log("Stock Out Form");
        break;
      case 3:
        GoToTop();
        break;      
    }
  };
  
  return (
    <>
      {state.dialogOpen===stockDialog_e.none && (
        <MySpeedDial          
          menuList={MenuList}
          icon={<MoreVertIcon />}
          onClick={speedDialHandler}
        />
      )}      
    </>
  );
};
export default SpeedDial_Stock;
