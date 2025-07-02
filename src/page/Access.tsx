import * as React from "react";
import AppBar_c from "../component/Organisms/AppBar_c";
import MoneyTotal from "../component/Organisms/MoneyTotal";
import YearSelector from "../component/Organisms/YearSelector";
import MonthlyTotalList from "../component/Organisms/MonthlyTotalList";
import MySpeedDial from "../component/Organisms/MySpeedDial";
import { menuList_t } from "../component/Molecules/AppBar_Mobile";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DialogAddTransaction, {
  TransitionForm_t,
} from "../dialog/DialogAddTransaction";
import DialogSearchTransaction, {
  SearchTransForm_t,
} from "../dialog/DialogSearchTransaction";
import { GoToTop } from "../function/Window";
import * as Access_f from "../API/AccountService/Account";
import * as Contact_f from "../API/AccountService/Contact";
import * as Login_f from "../API/LoginService/Login";
import { ContactForm_t, statement_t } from "../API/AccountService/type";
import InfiniteScroll from "react-infinite-scroll-component";
import { contactInfo_t } from "../component/Molecules/ContactInfo";
import { errorCode_e } from "../enum";
import { useNavigate } from "react-router-dom";
import DialogSetUser from "../dialog/DialogSetUser";

const Page_Access: React.FC = () => {
  // Hook **************
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = React.useState("");
  const [yearSelect, setYearSelect] = React.useState(new Date().getFullYear());
  const [openDialogSetUser, setOpenDialogSetUser] = React.useState(false);
  const [openDialogAdd, setOpenDialogAdd] = React.useState(false);
  const [openDialogEdit, setOpenDialogEdit] = React.useState(false);
  const [openDialogSearch, setOpenDialogSearch] = React.useState(false);
  const [TransitionForm, setTransitionForm] =
    React.useState<TransitionForm_t>();
  const [transaction, setTransaction] = React.useState<statement_t[]>([]);
  const [month, setMonth] = React.useState(12);
  const [hasMore, setHasMore] = React.useState(true);
  const [contactList, setContactList] = React.useState<contactInfo_t[]>([]);
  const [searchTranResult, setSearchTranResult] = React.useState<statement_t[]>(
    []
  );
  const [totalMoney, setTotalMoney] = React.useState(0);
  // Local Variable **************

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
    console.log(value);
    setTransitionForm(value);
    setOpenDialogEdit(true);
  };
  const speedDialHandler = (index: number) => {
    console.log(`SpeedDial: ${index}`);
    switch (index) {
      case 0:
        setOpenDialogAdd(true);
        break;
      case 1:
        setOpenDialogSearch(true);
        break;
      case 2:
        GoToTop();
    }
  };
  const initTrans = async (token: string) => {
    try {
      let finish = false;
      let _month = 12;
      let cnt = 0;
      let trans: statement_t[] = [];
      const wallet = await Access_f.getWallet(token);
      console.log(wallet);
      if (wallet.status === "success") {
        setTotalMoney(wallet.result || 0);
      } else {
        navigate("/");
      }

      while (!finish) {
        const res = await Access_f.getStatement(token, _month, yearSelect);
        if (res.result.length) {
          console.log(res);
          trans.push(...res.result);

          cnt += res.result.length;
          if (cnt > 1) {
            console.log(cnt);
            setTransaction(trans);
            finish = true;
          }
        }
        if (_month > 1) {
          _month--;
        } else {
          setTransaction(trans);
          finish = true;
        }
      }

      setHasMore(_month > 1); // ถ้าไม่มีข้อมูลเพิ่ม = จบการโหลด
      setMonth(_month);
    } catch (err) {
      console.log(err);
    }
  };
  const initPage = async () => {
    try {
      const resLogin = await Login_f.getToken();
      console.log(resLogin);
      if (resLogin.status === "error" || !resLogin.result?.token) {
        navigate("/");
      } else {
        const resContact = await Contact_f.get(resLogin.result.token);
        setContactList(resContact.result);
        setAccessToken(resLogin.result.token);
        initTrans(resLogin.result.token);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const fetchTrans = async () => {
    try {
      let finish = false;
      let _month = month;
      while (!finish) {
        const res = await Access_f.getStatement(
          accessToken,
          _month,
          yearSelect
        );
        if (res.result.length) {
          console.log(res);

          setTransaction((prev) => {
            if (prev) {
              return [...prev, ...res.result];
            }
            return res.result;
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
        const res = await Access_f.delStatement(accessToken, data.id);

        if (res.status == "success") {
          initTrans(accessToken);
        }
      } catch (err) {
        console.log(err);
      }
    }
    setOpenDialogEdit(false);
  };
  const onClickAddTransHandler = async (data: TransitionForm_t) => {
    try {
      const res = await Access_f.postStatement(accessToken, data);
      if (res.status == "success") {
        initTrans(accessToken);
      } else {
        alert("ทำรายการไม่สำเร็จ!");
      }
    } catch (err) {
      console.log(err);
    }
    setOpenDialogAdd(false);
  };
  const onClickEditTransHandler = async (data: TransitionForm_t) => {
    console.log(data.id);
    if (data?.id) {
      try {
        const res = await Access_f.putStatement(accessToken, data.id, data);
        if (res.status == "success") {
          initTrans(accessToken);
        }
      } catch (err) {
        console.log(err);
      }
    }
    setOpenDialogEdit(false);
  };
  const onAddContact = async (data: ContactForm_t) => {
    try {
      const res = await Contact_f.post(accessToken, data);
      if (res.status == "success") {
        const res = await Contact_f.get(accessToken);
        setContactList(res.result);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const onEditContact = async (data: ContactForm_t) => {
    try {
      const res = await Contact_f.put(accessToken, data);
      if (res.status == "success") {
        const res = await Contact_f.get(accessToken);
        setContactList(res.result);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const onDelContacat = async (data: contactInfo_t) => {
    try {
      const res = await Contact_f.del(accessToken, data);
      if (res.status == "success") {
        const res = await Contact_f.get(accessToken);
        setContactList(res.result);
      } else {
        switch (res.errCode) {
          case errorCode_e.InUseError:
            alert("รายการนี้ยังมีการใช้งานอยู่");
            break;
          default:
            alert("Unknow Error");
            break;
        }
      }
    } catch (err) {
      alert("Unknow Error");
      console.log(err);
    }
  };
  const onSearchContact = async (keyword: string) => {
    try {
      const res = await Contact_f.get(accessToken, keyword);

      setContactList(res.result);
    } catch (err) {
      alert("Unknow Error");
      console.log(err);
    }
  };
  const onSearchTran = async (data: SearchTransForm_t) => {
    console.log(data);
    try {
      const res = await Access_f.searchStatement(accessToken, data);

      setSearchTranResult(res.result);
    } catch (err) {
      alert("Unknow Error");
      console.log(err);
    }
  };
  const onClickPage = async (page: menuList_t) => {
    try {
      if (page.path === "/") {
        const res = await Login_f.postLogout();
        console.log(res);
      } else if (page.text === "Set User") {
        setTimeout(()=>setOpenDialogSetUser(true),300);
      } else if (page.text === "Set Password") {

      }
    } catch (err) {
      console.log(err);
    }
  };
  // Use Effect **************
  React.useEffect(() => {
    initPage();
  }, [yearSelect]);
  return (
    <>
      <AppBar_c role="admin" onClick={onClickPage}/>
      <MoneyTotal
        sx={{ textAlign: "center", mt: "16px" }}
        label="ยอดเงินคงเหลือ"
        value={totalMoney}
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
      {!openDialogAdd && !openDialogSearch && (
        <MySpeedDial
          menuList={MenuList}
          icon={<MoreVertIcon />}
          onClick={speedDialHandler}
        />
      )}

      <DialogAddTransaction
        open={openDialogAdd}
        contactList={contactList}
        onClose={() => setOpenDialogAdd(false)}
        onSubmitTransaction={onClickAddTransHandler}
        onSubmitContact={onAddContact}
        onEditContact={onEditContact}
        onDelTransaction={onClickDelTransHandler}
        onDelContact={onDelContacat}
      />
      <DialogAddTransaction
        title="แก้ไขรายการ"
        dafaultValue={TransitionForm}
        contactList={contactList}
        open={openDialogEdit}
        onClose={() => setOpenDialogEdit(false)}
        onSubmitTransaction={onClickEditTransHandler}
        onSubmitContact={onAddContact}
        onEditContact={onEditContact}
        onDelTransaction={onClickDelTransHandler}
        onDelContact={onDelContacat}
        onSearchContact={onSearchContact}
      />
      <DialogSearchTransaction
        open={openDialogSearch}
        onClose={() => {
          setOpenDialogSearch(false);
          setSearchTranResult([]);
        }}
        onSearch={onSearchTran}
        onClick={onClickTransHandler}
        contactList={contactList}
        value={searchTranResult}
      />
      <DialogSetUser
        open={openDialogSetUser}
        onClose={() => {
          setOpenDialogSetUser(false);
        }}
      />
    </>
  );
};

export default Page_Access;
