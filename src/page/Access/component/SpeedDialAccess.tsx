import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MySpeedDial from "../../../component/Molecules/MySpeedDial";
import { useAccess } from "../hooks/useAccess";
import { menuList_t } from "../../../component/Molecules/ButtonOption";
import React, { useMemo } from "react";
import { accessDialog_e } from "../context/AccessContext";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import HistoryIcon from "@mui/icons-material/History";

//*********************************************
// Style
//*********************************************

//*********************************************
// Interface
//*********************************************

//*********************************************
// Component
//*********************************************
const SpeedDial_Access: React.FC = () => {
  const { state, setState } = useAccess();
  const menuList = useMemo<menuList_t[]>(
    () => [
      { text: "Add", icon: <AddIcon /> },
      { text: "Search", icon: <SearchIcon />, path: "/access/search" },
      { text: "History", icon: <HistoryIcon />, path: "/access/history" },
      { text: "Go to Top", icon: <KeyboardArrowUpIcon /> },
    ],
    [],
  );

  const speedDialHandler = (index: number) => {
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
        break;
      case 4:
        state.containerRef?.current?.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        break;
    }
  };

  const list: menuList_t[] = useMemo(() => {
    if (state.expanded) {
      return [{ text: "Unfold Less", icon: <UnfoldLessIcon /> }, ...menuList];
    } else {
      return [{ text: "Unfold More", icon: <UnfoldMoreIcon /> }, ...menuList];
    }
  }, [menuList, state.expanded]);
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
