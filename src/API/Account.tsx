import axios from "axios";
import { statement_t } from "../type";

export async function getStatement(
  month: number,
  year: number,
  resault: (val: statement_t[]|null, error: string|null) => void
) {
  axios
    .get(
      `http://${import.meta.env.VITE_HOST}:${
        import.meta.env.VITE_PORT_ACCESS
      }/transaction?from=${year}-${month
        .toString()
        .padStart(2, "0")}-1&to=${year}-${month
        .toString()
        .padStart(2, "0")}-${new Date(year, month, 0).getDate()}`
    )
    .then((val) => {resault(val.data as statement_t[], null)})
    .catch((error) => {resault(null,error)});
}
