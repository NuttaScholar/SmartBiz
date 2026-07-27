import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import React from "react";
import type { menuList_t } from "../../../component/Molecules/ButtonOption";
import MySpeedDial from "../../../component/Molecules/MySpeedDial";

export default function SpeedDialCustomer({
  onGoToTop,
}: {
  onGoToTop: () => void;
}) {
  const menuList = React.useMemo<menuList_t[]>(
    () => [
      { text: "Create", icon: <AddIcon />, path: "/customer/create" },
      { text: "Go to Top", icon: <KeyboardArrowUpIcon /> },
    ],
    [],
  );

  function handleClick(index: number) {
    if (menuList[index]?.text === "Go to Top") {
      onGoToTop();
    }
  }

  return (
    <MySpeedDial
      menuList={menuList}
      icon={<MoreVertIcon />}
      onClick={handleClick}
    />
  );
}
