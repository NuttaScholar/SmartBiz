import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MySpeedDial from "../../../component/Molecules/MySpeedDial";
import { useAccess } from "../hooks/useAccess";
import { menuList_t } from "../../../component/Molecules/ButtonOption";
import { GoToTop } from "../../../function/Window";
import React from "react";
import { accessDialog_e } from "../context/AccessContext";
//*********************************************
// Style
//*********************************************

//*********************************************
// Variable
//*********************************************
const MenuList: menuList_t[] = [
  { text: "Add", icon: <AddIcon /> },
  { text: "Search", icon: <SearchIcon />, path: "/access/search" },
  { text: "Go to Top", icon: <KeyboardArrowUpIcon /> },
];
//*********************************************
// Interface
//*********************************************

//*********************************************
// Component
//*********************************************
const SpeedDial_Access: React.FC = () => {
  const { state, setState } = useAccess();

  const speedDialHandler = (index: number) => {
    console.log(`SpeedDial: ${index}`);
    switch (index) {
      case 0:
        setState({
          ...state,
          open: accessDialog_e.transactionForm,
          transitionForm: undefined,
          fieldContact: undefined,
        });
        break;
      case 1:
        setState({ ...state,open: accessDialog_e.searchTransaction });
        break;
      case 2:
        GoToTop();
    }
  };
  return (
    <>
      {state.open===accessDialog_e.none && (
        <MySpeedDial          
          menuList={MenuList}
          icon={<MoreVertIcon />}
          onClick={speedDialHandler}
        />
      )}      
    </>
  );
};
export default SpeedDial_Access;
