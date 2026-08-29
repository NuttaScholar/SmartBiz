import { SearchTransForm_t, statement_t } from "../../../API/AccountService/type";
import { AccessContext_t } from "../context/AccessContext";
import { AuthContext_t } from "../../../context/AuthContextCore";
import accessWithRetry_f from "./accessWithRetry";

export const initTrans = async (authContext: AuthContext_t, accessContext: AccessContext_t):Promise<void> => {
  const { state, setState } = accessContext;

  let finish = false;
  let _month = 12;
  let cnt = 0;
  const trans: statement_t[] = [];
  while (!finish && _month >= 1) {
    const condition: SearchTransForm_t = {
      from: new Date(state.yearSelect, _month - 1, 1),
      to: new Date(state.yearSelect, _month, 0),
    };
    try {
      const res = await accessWithRetry_f.get(authContext, condition);
      if (res.data?.length) {
        trans.push(...res.data);
        cnt++;
        _month--;
        if (cnt >= 4) {
          finish = true;
        }
      } else {
        _month--;
      }
    } catch (err) {
      console.log(err);
      finish = true;
      throw err;
    }
  }
  try {
    const wallet = await accessWithRetry_f.getWallet(authContext);
    if (wallet.data!== undefined) {
      const totalMoney = wallet.data;
      setState((currentState) => ({
        ...currentState,
        transaction: trans,
        hasMore: _month >= 1,
        month: _month,
        totalMoney,
      }));
    }
    return;
  } catch (err) {
    setState((currentState) => ({
      ...currentState,
      transaction: trans,
      hasMore: _month >= 1,
      month: _month,
    }));
    throw err;
  }
};
