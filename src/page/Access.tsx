import * as React from "react";
import AppBar_c, { pageApp_e } from "../component/Organisms/AppBar_c";
import MoneyTotal from "../component/Organisms/MoneyTotal";
import YearSelector from "../component/Organisms/YearSelector";
import MonthlyTotalList from "../component/Organisms/MonthlyTotalList";
import { DailyMoneyList } from "../dataSet/DataMoney";
import { Box } from "@mui/material";
import MySpeedDial from "../component/Organisms/MySpeedDial";
import { menuList_t } from "../component/Molecules/AppBar_Mobile";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { DailyTotal_t } from "../component/Molecules/DailyTotalList";
import DialogAddTransaction, { TransitionForm_t } from "../dialog/DialogAddTransaction";
import DialogSearchTransaction from "../dialog/DialogSearchTransaction";
import { GoToTop } from "../function/Window";

const Page_Access: React.FC = () => {
  // Local Variable **************
  const [yearSelect, setYearSelect] = React.useState(new Date().getFullYear());
  const [openDialogAdd, setOpenDialogAdd] = React.useState(false);
  const [openDialogEdit, setOpenDialogEdit] = React.useState(false);
  const [openDialogSearch, setOpenDialogSearch] = React.useState(false);
  const [TransitionForm, setTransitionForm] = React.useState<TransitionForm_t>();
  const [transaction, setTransaction] =
    React.useState<DailyTotal_t[]>(DailyMoneyList);
  const TotalMoney = 10000;
  const MenuList: menuList_t[] = [
    { text: "Add", icon: <AddIcon /> },
    { text: "Search", icon: <SearchIcon /> },
    { text: "Go to Top", icon: <KeyboardArrowUpIcon /> },
  ];

  // Local Function **************
  const yearSelectorHandler = (year: number) => {
    setYearSelect(year);
  };
  const onClickTransHanler = (value: TransitionForm_t) =>{
    setOpenDialogEdit(true);
    console.log(value);
    setTransitionForm(value);
  }
  const speedDialHandler = (index: number) => {
    console.log(`SpeedDial: ${index}`);
    switch (index) {
      case 0:
        setOpenDialogAdd(true);
        break;
      case 1:
        setOpenDialogSearch(true);
        console.log(`SpeedDial: ${index}`);
        break;
      case 2:
        GoToTop();
    }
  };
  return (
    <>
      <AppBar_c role="admin" page={pageApp_e.access} />
      <MoneyTotal
        sx={{ textAlign: "center", mt: "16px" }}
        label="ยอดเงินคงเหลือ"
        value={TotalMoney}
      />
      <YearSelector year={yearSelect} onChange={yearSelectorHandler} />
      <Box sx={{ justifyItems: "center", my: "16px" }}>
        <MonthlyTotalList value={transaction} onClick={onClickTransHanler}/>
      </Box>
      <MySpeedDial
        menuList={MenuList}
        icon={<MoreVertIcon />}
        onClick={speedDialHandler}
      />
      <DialogAddTransaction
        open={openDialogAdd}
        onClose={() => setOpenDialogAdd(false)}
        onSubmitTransaction={(data) => {
          console.log(data);
          setOpenDialogAdd(false);
        }}
        onSubmitContact={(data)=>{console.log(data)}}
      />
      <DialogAddTransaction
        title="แก้ไขรายการ"
        dafaultValue={TransitionForm}
        open={openDialogEdit}
        onClose={() => setOpenDialogEdit(false)}
        onSubmitTransaction={(data) => {
          console.log(data);
          setOpenDialogEdit(false);
        }}
        onSubmitContact={(data)=>{console.log(data)}}
      />
      <DialogSearchTransaction open={openDialogSearch} onClose={() => setOpenDialogSearch(false)}/>
    </>
  );
};

export default Page_Access;
