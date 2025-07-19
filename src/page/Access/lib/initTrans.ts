import { statement_t } from "../../../API/AccountService/type";
import { SearchTransForm_t } from "../component/DialogSearchTransaction";
import { AccessContext_t } from "../context/AccessContext";
import { AuthContext_t } from "../../../context/AuthContext";
import accessWithRetry_f from "./accessWithRetry";

export const initTrans = async (authContext: AuthContext_t, accessContext: AccessContext_t):Promise<void> => {
  const { state, setState } = accessContext;

  let finish = false;
  let _month = 12;
  let cnt = 0;
  let trans: statement_t[] = [];
  while (!finish) {
    const condition: SearchTransForm_t = {
      from: new Date(state.yearSelect, _month - 1, 1),
      to: new Date(state.yearSelect, _month, 0),
    };
    try {
      const res = await accessWithRetry_f.get(authContext, condition);
      if (res.result?.length) {
        console.log(res);
        trans.push(...res.result);
        cnt++;
        if (_month > 1) {
          _month--;
        }
        if (cnt > 1) {
          console.log(cnt);
          finish = true;
        }
      } else {
        if (_month > 1) {
          _month--;
        } else {
          finish = true;
        }
      }
    } catch (err) {
      throw err;
    }
  }
  console.log("Wallet:");
  try {
    const wallet = await accessWithRetry_f.getWallet(authContext);
    if (wallet.result!== undefined) {      
      setState({
        ...state,
        transaction: trans,
        hasMore: _month > 1,
        month: _month,
        totalMoney: wallet.result,
      });
    }
    return;
  } catch (err) {
    setState({
      ...state,
      transaction: trans,
      hasMore: _month > 1,
      month: _month,
    });
    throw err;
  }
};