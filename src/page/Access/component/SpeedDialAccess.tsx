import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MySpeedDial from "../../../component/Molecules/MySpeedDial";
import { useAccess } from "../hooks/useAccess";
import { menuList_t } from "../../../component/Molecules/ButtonOption";
import { GoToTop } from "../../../function/Window";
import React, { useMemo } from "react";
import { accessDialog_e } from "../context/AccessContext";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";

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
        setState({ ...state, expanded: !state.expanded });
        break;
      case 1:
        setState({
          ...state,
          open: accessDialog_e.transactionForm,
          transitionForm: undefined,
          fieldContact: undefined,
        });
        break;
      case 2:
        setState({ ...state, open: accessDialog_e.searchTransaction });
        break;
      case 3:
        state.containerRef?.current?.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        break;
    }
  };

  const list: menuList_t[] = useMemo(() => {
    if (state.expanded) {
      return [{ text: "Unfold Less", icon: <UnfoldLessIcon /> }, ...MenuList];
    } else {
      return [{ text: "Unfold More", icon: <UnfoldMoreIcon /> }, ...MenuList];
    }
  }, [state.expanded]);
  return (
    <>
      {state.open === accessDialog_e.none && (
        <MySpeedDial
          menuList={list}
          icon={<MoreVertIcon />}
          onClick={speedDialHandler}
        />
      )}
    </>
  );
};
export default SpeedDial_Access;
