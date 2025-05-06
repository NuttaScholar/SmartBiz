import axios from "axios";
import { responstDB_t, statement_t, transactionDetail_t, TransitionForm_t } from "../type";

export async function getContact(): Promise<responstDB_t<"getContact">> {
  try {
    const res = await axios.get(
      `http://${import.meta.env.VITE_HOST}:${
        import.meta.env.VITE_PORT_ACCESS
      }/contact`
    );
    return res.data as responstDB_t<"getContact">;
  } catch (err) {
    throw err;
  }
}