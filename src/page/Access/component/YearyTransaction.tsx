import YearSelector from "../../../component/Molecules/YearSelector";
import InfiniteScroll from "react-infinite-scroll-component";
import MonthlyTotalList from "../../../component/Organisms/MonthlyTotalList";
import React from "react";
import { statement_t, TransitionForm_t } from "../../../API/AccountService/type";
import { useAuth } from "../../../hooks/useAuth";
import { useAccess } from "../hooks/useAccess";
import accessWithRetry_f from "../lib/accessWithRetry";
import { SearchTransForm_t } from "./DialogSearchTransaction";
import { accessDialog_e } from "../context/AccessContext";
import { initTrans } from "../lib/initTrans";

/**************************************************** */
//  Interface
/**************************************************** */

/**************************************************** */
//  Component
/**************************************************** */
const YearyTransaction: React.FC = () => {
  // Hook *********************
  const authContext = useAuth();
  const { state, setState } = useAccess();
  // Local Function ***********  
  const fetchTrans = async () => {
    let finish = false;
    let _month = state.month;
    console.log(_month);
    const condition: SearchTransForm_t = {
      from: new Date(state.yearSelect, _month - 1, 1),
      to: new Date(state.yearSelect, _month, 0),
    };
    while (!finish) {
      try {
        const res = await accessWithRetry_f.get(authContext, condition);
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
      } catch (err) {
        console.log(err);
        return;
      }
    }
  };
  const onClickTransHandler = (value: TransitionForm_t) => {
    console.log(value);
    setState({
      ...state,
      transitionForm: value,
      fieldContact: value.who,
      open: accessDialog_e.transactionForm,
    });
  };  

  React.useEffect(() => {    
    initTrans(authContext, { state, setState });
  }, [state.yearSelect, state.refaceTrans]);
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
    </>
  );
};
export default YearyTransaction;
