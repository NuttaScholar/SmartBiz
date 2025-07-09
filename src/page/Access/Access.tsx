import * as React from "react";
import AppBar_c from "../../component/Organisms/AppBar_c";
import MoneyTotal from "../../component/Molecules/MoneyTotal";
import YearSelector from "../../component/Molecules/YearSelector";
import MonthlyTotalList from "../../component/Molecules/MonthlyTotalList";
import MySpeedDial from "../../component/Molecules/MySpeedDial";
import { menuList_t } from "../../component/Molecules/AppBar_Mobile";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DialogAddTransaction, {
  TransitionForm_t,
} from "./component/DialogFormTransaction";
import DialogSearchTransaction, {
  SearchTransForm_t,
} from "../../component/Organisms/DialogSearchTransaction";
import { GoToTop } from "../../function/Window";
import * as Access_f from "../../API/AccountService/Account";
import * as Contact_f from "../../API/AccountService/Contact";
import * as Login_f from "../../API/LoginService/Login";
import { ContactForm_t, statement_t } from "../../API/AccountService/type";
import InfiniteScroll from "react-infinite-scroll-component";
import { contactInfo_t } from "../../component/Molecules/ContactInfo";
import { errorCode_e } from "../../enum";
import { useNavigate } from "react-router-dom";
import DialogSetUser from "../../component/Organisms/DialogSetUser";
import { useAuth } from "../../hooks/useAuth";
import YearyTransaction from "./component/YearyTransaction";
import {
  access_t,
  AccessContext,
  AccessDefaultState,
  AccessProvider,
} from "../../context/AccessContext";

const Page_Access: React.FC = () => {
  // Hook **************
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();
  const [state, setState] = React.useState<access_t>(AccessDefaultState);

  // Local Variable **************
  const MenuList: menuList_t[] = [
    { text: "Add", icon: <AddIcon /> },
    { text: "Search", icon: <SearchIcon /> },
    { text: "Go to Top", icon: <KeyboardArrowUpIcon /> },
  ];

  // Local Function **************
  const onClickTransHandler = (value: TransitionForm_t) => {
    console.log(value);
    setState((prev) => ({
      ...prev,
      transitionForm: value,
      openDialogEdit: true,
    }));
  };
  const speedDialHandler = (index: number) => {
    console.log(`SpeedDial: ${index}`);
    switch (index) {
      case 0:
        setState((prev) => ({ ...prev, openDialogAdd: true }));
        break;
      case 1:
        setState((prev) => ({ ...prev, openDialogSearch: true }));
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
      if (wallet.status === "success") {
        setState((prev) => ({ ...prev, totalMoney: wallet.result || 0 }));
      } else {
        navigate("/");
      }

      while (!finish) {
        const res = await Access_f.getStatement(
          token,
          _month,
          state.yearSelect
        );
        if (res.result?.length) {
          trans.push(...res.result);
          cnt += res.result.length;
          if (cnt > 2) {
            if (_month > 1) {
              _month--;
            }
            setState((prev) => ({
              ...prev,
              transaction: trans,
              hasMore: _month > 1,
              month: _month,
            }));
            finish = true;
          }
        }
        if (_month > 1) {
          _month--;
        } else {
          setState((prev) => ({
            ...prev,
            transaction: trans,
            hasMore: _month > 1,
            month: _month,
          }));
          finish = true;
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  const initPage = async () => {
    try {
      if (auth) {
        const resContact = await Contact_f.get(auth.token);
        if (resContact.status === "success" && resContact.result) {
          const list = resContact.result;
          setState((prev) => ({
            ...prev,
            contactList: list,
          }));
          initTrans(auth.token);
        } else {
          const resLogin = await Login_f.getToken();
          if (resLogin.status === "error" || !resLogin.result) {
            navigate("/");
          } else {
            setAuth(resLogin.result);
            initTrans(resLogin.result.token);
          }
        }
      } else {
        const resLogin = await Login_f.getToken();
        if (resLogin.status === "error" || !resLogin.result) {
          navigate("/");
        } else {
          setAuth(resLogin.result);
          initTrans(resLogin.result.token);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  const onClickDelTransHandler = async (data?: TransitionForm_t) => {
    if (data?.id && auth?.token) {
      try {
        const res = await Access_f.delStatement(auth.token, data.id);

        if (res.status == "success") {
          initTrans(auth.token);
        }
      } catch (err) {
        console.log(err);
      }
    }
    setState((prev) => ({ ...prev, openDialogEdit: false }));
  };
  const onClickAddTransHandler = async (data: TransitionForm_t) => {
    if (auth?.token)
      try {
        const res = await Access_f.postStatement(auth.token, data);
        if (res.status == "success") {
          initTrans(auth.token);
        } else {
          alert("ทำรายการไม่สำเร็จ!");
        }
      } catch (err) {
        console.log(err);
      }
    setState((prev) => ({ ...prev, openDialogAdd: false }));
  };
  const onAddContact = async (data: ContactForm_t) => {
    if (auth?.token) {
      try {
        const res = await Contact_f.post(auth.token, data);
        if (res.status == "success") {
          const res = await Contact_f.get(auth.token);
          if (res.result) {
            const list = res.result;
            setState((prev) => ({ ...prev, contactList: list }));
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  };
  const onEditContact = async (data: ContactForm_t) => {
    if (auth?.token) {
      try {
        const res = await Contact_f.put(auth.token, data);
        if (res.status == "success") {
          const res = await Contact_f.get(auth.token);
          if (res.result) {
            const list = res.result;
            setState((prev) => ({ ...prev, contactList: list }));
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  };
  const onDelContacat = async (data: contactInfo_t) => {
    if (auth?.token) {
      try {
        const res = await Contact_f.del(auth.token, data);
        if (res.status == "success") {
          const res = await Contact_f.get(auth.token);
          if (res.result) {
            const list = res.result;
            setState((prev) => ({ ...prev, contactList: list }));
          }
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
    }
  };
  const onSearchTran = async (data: SearchTransForm_t) => {
    console.log(data);
    if (auth?.token) {
      try {
        const res = await Access_f.searchStatement(auth?.token, data);
        if (res.result) {
          const list = res.result;
          setState((prev) => ({ ...prev, searchTranResult: list }));
        }
      } catch (err) {
        alert("Unknow Error");
        console.log(err);
      }
    }
  };

  // Use Effect **************
  React.useEffect(() => {
    initPage();
  }, [state.yearSelect]);
  return (
    <AccessContext.Provider value={{ state, setState }}>
      <AppBar_c />
      <MoneyTotal
        sx={{ textAlign: "center", mt: "16px" }}
        label="ยอดเงินคงเหลือ"
        value={state.totalMoney}
      />
      <YearyTransaction />

      {!state.openDialogAdd && !state.openDialogSearch && (
        <MySpeedDial
          menuList={MenuList}
          icon={<MoreVertIcon />}
          onClick={speedDialHandler}
        />
      )}

      <DialogAddTransaction
        open={state.openDialogAdd}
        contactList={state.contactList}
        onClose={() => setState((prev) => ({ ...prev, openDialogAdd: false }))}
        onSubmitTransaction={onClickAddTransHandler}
        onSubmitContact={onAddContact}
        onEditContact={onEditContact}
        onDelTransaction={onClickDelTransHandler}
        onDelContact={onDelContacat}
      />
      <DialogSearchTransaction
        open={state.openDialogSearch}
        onClose={() => {
          setState((prev) => ({
            ...prev,
            openDialogSearch: false,
            searchTranResult: [],
          }));
        }}
        onSearch={onSearchTran}
        onClick={onClickTransHandler}
        contactList={state.contactList}
        value={state.searchTranResult}
      />
      <DialogSetUser
        open={state.openDialogSetUser}
        onClose={() => {
          setTimeout(
            () => setState((prev) => ({ ...prev, openDialogSetUser: false })),
            300
          );
        }}
      />
    </AccessContext.Provider>
  );
};

export default Page_Access;
