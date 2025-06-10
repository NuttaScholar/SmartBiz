import axios from "axios";
import {
  responst_t,
  TransitionForm_t,
} from "./type";
import { SearchTransForm_t } from "../../dialog/DialogSearchTransaction";

export async function getStatement(
  token: string,
  month: number,
  year: number
): Promise<responst_t<"getTransaction">> {
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0);  // new Date(year, month, 0).getDate() = วันสิ้นเดือน
  try {
    const res = await axios.get(
      `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_ACCESS
      }/transaction?from=${from.toISOString()}&to=${to.toISOString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    );
    return res.data as responst_t<"getTransaction">;
  } catch (err) {
    throw err;
  }
}
export async function getWallet(token: string
): Promise<responst_t<"getWallet">> {
  try {
    const res = await axios.get(
      `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_ACCESS
      }/wallet`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    );
    return res.data as responst_t<"getWallet">;
  } catch (err) {
    throw err;
  }
}
export async function searchStatement(
  token: string,
  data: SearchTransForm_t
): Promise<responst_t<"getTransaction">> {
  try {
    const { from, to, type, who, topic } = data;

    const res = await axios.get(
      `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_ACCESS
      }/transaction?from=${from.toISOString()}&to=${to.toISOString()}${data.type && `&type=${type}`}${data.topic && `&topic=${topic}`}
      ${who && `&who=${who}`}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    );
    return res.data as responst_t<"getTransaction">;
  } catch (err) {
    throw err;
  }
}
export async function delStatement(token: string, id: string): Promise<responst_t<"none">> {
  try {
    const res = await axios.delete(
      `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_ACCESS
      }/transaction?id=${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    );
    return res.data as responst_t<"none">;
  } catch (err) {
    throw err;
  }
}
export async function postStatement(
  token: string,
  data: TransitionForm_t
): Promise<responst_t<"none">> {
  console.log(data);
  try {
    const res = await axios.post(
      `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_ACCESS
      }/transaction`,
      data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    );
    return res.data as responst_t<"none">;
  } catch (err) {
    throw err;
  }
}
export async function putStatement(
  token: string,
  id: string,
  data: TransitionForm_t
): Promise<responst_t<"none">> {
  console.log(data);
  try {
    const res = await axios.put(
      `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_ACCESS
      }/transaction?id=${id}`,
      data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    );
    return res.data as responst_t<"none">;
  } catch (err) {
    throw err;
  }
}
