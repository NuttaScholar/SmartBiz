import axios from "axios";
import { responstDB_t, statement_t } from "../type";

export async function getStatement(
  month: number,
  year: number,
):Promise<responstDB_t<"getTransaction">> {
  try{
    const res = await axios
    .get(
      `http://${import.meta.env.VITE_HOST}:${
        import.meta.env.VITE_PORT_ACCESS
      }/transaction?from=${year}-${month
        .toString()
        .padStart(2, "0")}-1&to=${year}-${month
        .toString()
        .padStart(2, "0")}-${new Date(year, month, 0).getDate()}` // new Date(year, month, 0).getDate() = วันสิ้นเดือน
    )
    return res.data as responstDB_t<"getTransaction">;
  }catch(err){
    throw err;
  }
}
export async function delStatement(
  id: string
):Promise<responstDB_t<"del">> {
  try{
    const res = await axios
    .delete(
      `http://${import.meta.env.VITE_HOST}:${
        import.meta.env.VITE_PORT_ACCESS
      }/transaction?id=${id}` 
    )
    return res.data as responstDB_t<"del">;
  }catch(err){
    throw err;
  }
}
