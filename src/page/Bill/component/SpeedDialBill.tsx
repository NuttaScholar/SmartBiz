import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MySpeedDial from "../../../component/Molecules/MySpeedDial";
import { menuList_t } from "../../../component/Molecules/ButtonOption";
import React from "react";
import { billDialog_e } from "../context/BillContext";
import { useBillContext } from "../hooks/useBillContex";

//*********************************************
// Style
//*********************************************

//*********************************************
// Variable
//*********************************************
const MenuList: menuList_t[] = [
  { text: "Create", icon: <AddIcon /> },
  { text: "Go to Top", icon: <KeyboardArrowUpIcon /> },
];
//*********************************************
// Interface
//*********************************************

//*********************************************
// Component
//*********************************************
const SpeedDial_Bill: React.FC = () => {
  // Hook ************************************
  const { state, setState } = useBillContext();
  // Local function **************************
  const speedDialHandler = (index: number) => {
    console.log(`SpeedDial: ${index}`);
    switch (index) {
      case 0:
        setState({ ...state, dialogOpen: billDialog_e.form });
        break;
      case 1:
        setState({...state, triger_gotoTop: (state.triger_gotoTop || 0) + 1});
        break;
    }
  };

  return (
    <>
      {state.dialogOpen === billDialog_e.none && (
        <MySpeedDial
          menuList={MenuList}
          icon={<MoreVertIcon />}
          onClick={speedDialHandler}
        />
      )}
    </>
  );
};
export default SpeedDial_Bill;
