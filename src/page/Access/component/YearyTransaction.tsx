import YearSelector from "../../../component/Molecules/YearSelector";
import InfiniteScroll from "react-infinite-scroll-component";
import MonthlyTotalList from "../../../component/Molecules/MonthlyTotalList";
import React from "react";
import {
  ContactForm_t,
  DailyTotal_t,
  statement_t,
} from "../../../API/AccountService/type";
import * as Access_f from "../../../API/AccountService/Account";
import * as Contact_f from "../../../API/AccountService/Contact";
import { useAuth } from "../../../hooks/useAuth";
import DialogAddTransaction, {
  TransitionForm_t,
} from "./DialogFormTransaction";
import { contactInfo_t } from "../../../component/Molecules/ContactInfo";
import { errorCode_e } from "../../../enum";
import { useAccess } from "../../../hooks/useAccess";

/**************************************************** */
//  Interface
/**************************************************** */
interface myProps {}
/**************************************************** */
//  Component
/**************************************************** */
const YearyTransaction: React.FC<myProps> = (props) => {
  const { state, setState } = useAccess();
  // Hook *********************
  const { auth, setAuth } = useAuth();
  // Local Function ***********
  const initTrans = async (token: string) => {
    try {
      let finish = false;
      let _month = 12;
      let cnt = 0;
      let trans: statement_t[] = [];

      while (!finish) {
        const res = await Access_f.getStatement(
          token,
          _month,
          state.yearSelect
        );
        if (res.result?.length) {
          console.log(res);
          trans.push(...res.result);

          cnt += res.result.length;
          if (cnt > 1) {
            console.log(cnt);
            if (_month > 1) {
              _month--;
            }
            setState({
              ...state,
              transaction: trans,
              hasMore: _month > 1,
              month: _month,
            });
            finish = true;
          }
        } else {
          if (_month > 1) {
            _month--;
          } else {
            setState({
              ...state,
              transaction: trans,
              hasMore: _month > 1,
              month: _month,
            });
            finish = true;
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  const fetchTrans = async () => {
    if (auth?.token) {
      try {
        let finish = false;
        let _month = state.month;
        console.log(_month);
        while (!finish) {
          const res = await Access_f.getStatement(
            auth.token,
            _month,
            state.yearSelect
          );
          if (res.result?.length) {
            console.log(res);
            const statement: statement_t[] = res.result;
            if (_month > 1) {
              _month--;
            }
            setState({
              ...state,
              transaction: [...state.transaction, ...statement],
              hasMore: _month > 1,
              month: _month,
            });
            finish = true;
          } else {
            if (_month > 1) {
              _month--;
            } else {
              setState({
                ...state,
                hasMore: _month > 1,
                month: _month,
              });
              finish = true;
            }
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  };
  const onClickTransHandler = (value: TransitionForm_t) => {
    console.log(value);
    setState({ ...state, transitionForm: value, openDialogEdit: true });
  };
  const onClickEditTransHandler = async (data: TransitionForm_t) => {
    console.log(data.id);
    if (data?.id && auth?.token) {
      try {
        const res = await Access_f.putStatement(auth.token, data.id, data);
        if (res.status == "success") {
          initTrans(auth?.token);
        }
      } catch (err) {
        console.log(err);
      }
    }
    setState({ ...state, openDialogEdit: false });
  };
  const onAddContact = async (data: ContactForm_t) => {
    if (auth?.token) {
      try {
        const res = await Contact_f.post(auth.token, data);
        if (res.status == "success") {
          const res = await Contact_f.get(auth.token);
          res.result && setState({ ...state, contactList: res.result });
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
          res.result && setState({ ...state, contactList: res.result });
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
          res.result && setState({ ...state, contactList: res.result });
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
  const onSearchContact = async (keyword: string) => {
    if (auth?.token) {
      try {
        const res = await Contact_f.get(auth.token, keyword);

        res.result && setState({ ...state, contactList: res.result });
      } catch (err) {
        alert("Unknow Error");
        console.log(err);
      }
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
    setState({ ...state, openDialogEdit: false });
  };
  React.useEffect(() => {
    if (auth?.token) {
      initTrans(auth?.token);
    } else {
      console.log("unAuth");
    }
  }, [state.yearSelect]);
  return (
    <>
      <YearSelector
        year={state.yearSelect}
        onChange={(year) => setState({ ...state, yearSelect: year })}
      />

      <InfiniteScroll
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          margin: "16px 0",
          gap: "16px",
        }}
        dataLength={state.transaction?.length || 0}
        next={fetchTrans}
        hasMore={state.hasMore}
        loader={<h4>กำลังโหลด...</h4>}
      >
        {state.transaction?.map((val, index) => (
          <MonthlyTotalList
            key={index}
            value={val.detail}
            onClick={onClickTransHandler}
          />
        ))}
      </InfiniteScroll>
      <DialogAddTransaction
        title="แก้ไขรายการ"
        dafaultValue={state.transitionForm}
        contactList={state.contactList}
        open={state.openDialogEdit}
        onClose={() => setState({ ...state, openDialogEdit: false })}
        onSubmitTransaction={onClickEditTransHandler}
        onSubmitContact={onAddContact}
        onEditContact={onEditContact}
        onDelTransaction={onClickDelTransHandler}
        onDelContact={onDelContacat}
        onSearchContact={onSearchContact}
      />
    </>
  );
};
export default YearyTransaction;
