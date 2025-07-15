import { SxProps, Theme } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { ReactNode } from "react";
import MySpeedDial from "../../../component/Molecules/MySpeedDial";
import { useAccess } from "../../../hooks/useAccess";
import { menuList_t } from "../../../component/Molecules/ButtonOption";
import { GoToTop } from "../../../function/Window";
import DialogFormTransaction, { TransitionForm_t } from "./DialogFormTransaction";
import DialogSearchTransaction from "./DialogSearchTransaction";
import React from "react";
//*********************************************
// Style
//*********************************************

//*********************************************
// Variable
//*********************************************
const MenuList: menuList_t[] = [
  { text: "Add", icon: <AddIcon /> },
  { text: "Search", icon: <SearchIcon /> },
  { text: "Go to Top", icon: <KeyboardArrowUpIcon /> },
];
//*********************************************
// Interface
//*********************************************
interface myProps {
  sx?: SxProps<Theme>;
  onClick?: (index: number) => void;
  icon?: ReactNode;
}
//*********************************************
// Component
//*********************************************
const SpeedDial_Access: React.FC<myProps> = (props) => {
  const { state, setState } = useAccess();
  const [openAdd, setOpenAdd] = React.useState(false);

  const speedDialHandler = (index: number) => {
    console.log(`SpeedDial: ${index}`);
    switch (index) {
      case 0:
        setOpenAdd(true);
        break;
      case 1:
        setState({ ...state, openDialogSearch: true });
        break;
      case 2:
        GoToTop();
    }
  };
  const onClickTransHandler = (value: TransitionForm_t) => {
    console.log(value);
    setState({ ...state, transitionForm: value });
  };
  return (
    <>
      {!openAdd && !state.openDialogSearch && (
        <MySpeedDial
          menuList={MenuList}
          icon={<MoreVertIcon />}
          onClick={speedDialHandler}
        />
      )}

      <DialogFormTransaction
        open={openAdd}
        onClose={() => setOpenAdd(false)}
      />
      <DialogSearchTransaction
        open={state.openDialogSearch}
        onClose={() => {
          setState({
            ...state,
            openDialogSearch: false,
            searchTranResult: [],
          });
        }}
        onClick={onClickTransHandler}
        contactList={state.contactList}
        value={state.searchTranResult}
      />
    </>
  );
};
export default SpeedDial_Access;
