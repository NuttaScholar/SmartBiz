import axios from "axios";
import dayjs from "dayjs";
import {
  responstDB_t,
  statement_t,
  transactionDetail_t,
  TransitionForm_t,
} from "../type";
import { SearchTransForm_t } from "../dialog/DialogSearchTransaction";

export async function getStatement(
  month: number,
  year: number
): Promise<responstDB_t<"getTransaction">> {
  const from = new Date(year,month-1,1);
  const to = new Date(year,month,0);  // new Date(year, month, 0).getDate() = วันสิ้นเดือน
  try {
    const res = await axios.get(
      `http://${import.meta.env.VITE_HOST}:${
        import.meta.env.VITE_PORT_ACCESS
      }/transaction?from=${from.toISOString()}&to=${to.toISOString()}` 
    );
    return res.data as responstDB_t<"getTransaction">;
  } catch (err) {
    throw err;
  }
}
export async function getWallet(
): Promise<responstDB_t<"getWallet">> {
  try {
    const res = await axios.get(
      `http://${import.meta.env.VITE_HOST}:${
        import.meta.env.VITE_PORT_ACCESS
      }/wallet` 
    );
    return res.data as responstDB_t<"getWallet">;
  } catch (err) {
    throw err;
  }
}
export async function searchStatement(
  data: SearchTransForm_t
): Promise<responstDB_t<"getTransaction">> {
  try {
    const {from, to, type, who, topic} = data;
    
    const res = await axios.get(
      `http://${import.meta.env.VITE_HOST}:${
        import.meta.env.VITE_PORT_ACCESS
      }/transaction?from=${from.toISOString()}&to=${to.toISOString()}${data.type && `&type=${type}`}${data.topic && `&topic=${topic}`}
      ${who && `&who=${who}`}`
    );
    return res.data as responstDB_t<"getTransaction">;
  } catch (err) {
    throw err;
  }
}
export async function delStatement(id: string): Promise<responstDB_t<"del">> {
  try {
    const res = await axios.delete(
      `http://${import.meta.env.VITE_HOST}:${
        import.meta.env.VITE_PORT_ACCESS
      }/transaction?id=${id}`
    );
    return res.data as responstDB_t<"del">;
  } catch (err) {
    throw err;
  }
}
export async function postStatement(
  data: TransitionForm_t
): Promise<responstDB_t<"post">> {
  console.log(data);
  try {
    const res = await axios.post(
      `http://${import.meta.env.VITE_HOST}:${
        import.meta.env.VITE_PORT_ACCESS
      }/transaction`,
      data
    );
    return res.data as responstDB_t<"post">;
  } catch (err) {
    throw err;
  }
}
export async function putStatement(
  id: string,
  data: TransitionForm_t
): Promise<responstDB_t<"put">> {
  console.log(data);
  try {
    const res = await axios.put(
      `http://${import.meta.env.VITE_HOST}:${
        import.meta.env.VITE_PORT_ACCESS
      }/transaction?id=${id}`,
      data
    );
    return res.data as responstDB_t<"put">;
  } catch (err) {
    throw err;
  }
}
