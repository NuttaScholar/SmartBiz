import YearSelector from "../../../component/Molecules/YearSelector";
import InfiniteScroll from "react-infinite-scroll-component";
import MonthlyTotalList from "../../../component/Organisms/MonthlyTotalList";
import React from "react";
import {
  SearchTransForm_t,
  statement_t,
  TransitionForm_t,
} from "../../../API/AccountService/type";
import { useAuth } from "../../../hooks/useAuth";
import { useAccess } from "../hooks/useAccess";
import accessWithRetry_f from "../lib/accessWithRetry";
import { accessDialog_e } from "../context/AccessContext";
import { initTrans } from "../lib/initTrans";
import { Box } from "@mui/material";
import storageWithRetry_f from "../../../lib/storageWithRetry";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
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
  const onClickTransHandler = async (value: TransitionForm_t) => {
    let data = value;
    if (value.bill) {
      try {
        const spitUrl = value.bill.split("/");
        const res = await storageWithRetry_f.getImg(authContext, {
          Bucket: spitUrl[0],
          Key: spitUrl[1],
        });
        if (res.status !== "success" || res.result === undefined) {
          alert("ไม่สามารถโหลดรูปภาพได้");
        } else {
          data = { ...value, bill: res.result.url };
        }
      } catch (err) {
        console.error("Get image error:", err);
        alert("ไม่สามารถโหลดรูปภาพได้");
      }
    }
    console.log(data);
    setState({
      ...state,
      transitionForm: data,
      fieldContact: value.who,
      open: accessDialog_e.transactionForm,
    });
  };

  React.useEffect(() => {
    initTrans(authContext, { state, setState }).catch((err) => {
      console.log(err);
      navigate("/");
    });
  }, [state.yearSelect, state.refaceTrans]);
  return (
    <Box sx={{ width: "100%" }}>
      <YearSelector
        year={state.yearSelect}
        onChange={(year) => setState({ ...state, yearSelect: year })}
      />

      {state.transaction?.length === 0 ? (
        <Box
          sx={{
            m: "16px 0",
            height: "calc(100vh - 250px)",
            justifyContent: "center",
            display: "flex",
            alignItems: "center",
          }}
        >
          <h4>ไม่มีข้อมูลการทำรายการ</h4>
        </Box>
      ) : (
        <Box id="scrollable" ref={state.containerRef} sx={{ height: "calc(100vh - 220px)", overflow: "auto" }}>
          <InfiniteScroll           
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "16px 0",
              gap: "16px",
            }}
            scrollableTarget="scrollable"
            dataLength={state.transaction?.length || 0}
            next={fetchTrans}
            hasMore={state.hasMore}
            loader={<h4>กำลังโหลด...</h4>}
          >
            {state.transaction?.map((val, index) => (
              <MonthlyTotalList
                expanded={state.expanded}
                key={index}
                value={val.detail}
                onClick={onClickTransHandler}
              />
            ))}
          </InfiniteScroll>
        </Box>
      )}
    </Box>
  );
};
export default YearyTransaction;
