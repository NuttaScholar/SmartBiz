import axios from "axios";
import { responstDB_t, statement_t, transactionDetail_t, TransitionForm_t } from "../type";

export async function getStatement(
  month: number,
  year: number
): Promise<responstDB_t<"getTransaction">> {
  try {
    const res = await axios.get(
      `http://${import.meta.env.VITE_HOST}:${
        import.meta.env.VITE_PORT_ACCESS
      }/transaction?from=${year}-${month
        .toString()
        .padStart(2, "0")}-1&to=${year}-${month
        .toString()
        .padStart(2, "0")}-${new Date(year, month, 0).getDate()}` // new Date(year, month, 0).getDate() = วันสิ้นเดือน
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
  console.log(data.date);
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
