import * as React from "react";
import AppBar_c, { pageApp_e } from "../component/Organisms/AppBar_c";
import MoneyTotal from "../component/Organisms/MoneyTotal";
import YearSelector from "../component/Organisms/YearSelector";
import MonthlyTotalList from "../component/Organisms/MonthlyTotalList";
import { DailyMoneyList, transactionList } from "../dataSet/DataMoney";
import { Box } from "@mui/material";
import MySpeedDial from "../component/Organisms/MySpeedDial";
import { menuList_t } from "../component/Molecules/AppBar_Mobile";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { DailyTotal_t } from "../component/Molecules/DailyTotalList";
import DialogAddTransaction, {
  TransitionForm_t,
} from "../dialog/DialogAddTransaction";
import DialogSearchTransaction from "../dialog/DialogSearchTransaction";
import { GoToTop } from "../function/Window";
import * as Access from "../API/Account";
import { statement_t } from "../type";
import InfiniteScroll from "react-infinite-scroll-component";

const Page_Access: React.FC = () => {
  // Hook **************
  const [yearSelect, setYearSelect] = React.useState(new Date().getFullYear());
  const [openDialogAdd, setOpenDialogAdd] = React.useState(false);
  const [openDialogEdit, setOpenDialogEdit] = React.useState(false);
  const [openDialogSearch, setOpenDialogSearch] = React.useState(false);
  const [TransitionForm, setTransitionForm] =
    React.useState<TransitionForm_t>();
  const [transaction, setTransaction] = React.useState<statement_t[]>([]);
  const [month, setMonth] = React.useState(12);
  const [hasMore, setHasMore] = React.useState(true);
  // Local Variable **************
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
  const onClickTransHandler = (value: TransitionForm_t) => {
    setOpenDialogEdit(true);
    console.log(value);
    setTransitionForm(value);
  };
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
  const initTrans = async () => {
    try {
      let finish = false;
      let _month = 12;
      let cnt = 0;
      let trans: statement_t[] = [];

      while (!finish) {
        const res = await Access.getStatement(_month, yearSelect);
        if (res.length) {
          console.log(res);          
          trans.push(...res);        
          
          cnt += res.length;
          if(cnt>1){
            console.log(cnt);
            setTransaction(trans);
            finish = true;
          }          
        }
        if (_month > 1) {
          _month--;
        } else {
          finish = true;
        }
      }
      setHasMore(_month > 1); // ถ้าไม่มีข้อมูลเพิ่ม = จบการโหลด
      setMonth(_month);
    } catch (err) {
      console.log(err);
    }
  }
  const fetchTrans = async () => {
    try {
      let finish = false;
      let _month = month;
      while (!finish) {
        const res = await Access.getStatement(_month, yearSelect);
        if (res.length) {
          console.log(res);
          
          setTransaction((prev) => {
            if (prev) {
              return [...prev, ...res];
            }
            return res;
          });       
        }
        if (_month > 1) {
          _month--;
        } else {
          finish = true;
        }
      }
      setHasMore(_month > 1); // ถ้าไม่มีข้อมูลเพิ่ม = จบการโหลด
      setMonth(_month);
    } catch (err) {
      console.log(err);
    }
  };
  const onClickDelTransHandler = async (data?: TransitionForm_t) => {
    if (data?.id) {
      try {
        const res = await Access.delStatement(data.id);

        if(res.status=="success"){
          initTrans();
        }       
        
      } catch (err) {
        console.log(err);
      }
    }
    setOpenDialogEdit(false);
  };
  // Use Effect **************
  React.useEffect(() => {
    initTrans();
  }, []);
  return (
    <>
      <AppBar_c role="admin" page={pageApp_e.access} />
      <MoneyTotal
        sx={{ textAlign: "center", mt: "16px" }}
        label="ยอดเงินคงเหลือ"
        value={TotalMoney}
      />
      <YearSelector year={yearSelect} onChange={yearSelectorHandler} />

      <InfiniteScroll
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          margin: "16px 0",
          gap: "16px",
        }}
        dataLength={transaction?.length || 0}
        next={fetchTrans}
        hasMore={hasMore}
        loader={<h4>กำลังโหลด...</h4>}
      >
        {transaction?.map((val, index) => (
          <MonthlyTotalList
            key={index}
            value={val.detail}
            onClick={onClickTransHandler}
          />
        ))}
      </InfiniteScroll>

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
        onSubmitContact={(data) => {
          console.log(data);
        }}
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
        onSubmitContact={(data) => {
          console.log(data);
        }}
        onDelete={onClickDelTransHandler}
      />
      <DialogSearchTransaction
        open={openDialogSearch}
        onClose={() => setOpenDialogSearch(false)}
      />
    </>
  );
};

export default Page_Access;
