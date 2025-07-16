import {
  responst_t,
  TransitionForm_t,
} from "./type";
import { SearchTransForm_t } from "../../page/Access/component/DialogSearchTransaction";
import { axios_account } from "../../lib/axios";

export async function getDetail(
  token: string,
  id: string
): Promise<responst_t<"getTransDetail">> {
  try {
    const res = await axios_account.get(
      `/trandetail?id=${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    );
    return res.data as responst_t<"getTransDetail">;
  } catch (err) {
    throw err;
  }
}

export async function getWallet(token: string
): Promise<responst_t<"getWallet">> {
  try {
    const res = await axios_account.get(
      `/wallet`, {
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
export async function get(
  token: string,
  data: SearchTransForm_t
): Promise<responst_t<"getTransaction">> {
  try {
    const { from, to, type, who, topic } = data;
    let condition:string = `from=${from.toISOString()}&to=${to.toISOString()}`;
    type && (condition += `&type=${type}`);
    who && (condition += `&who=${who}`);
    topic && (condition += `&topic=${topic}`);
    const res = await axios_account.get(
      `/transaction?${condition}`, {
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
export async function del(token: string, id: string): Promise<responst_t<"none">> {
  try {
    const res = await axios_account.delete(
      `/transaction?id=${id}`, {
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
export async function post(
  token: string,
  data: TransitionForm_t
): Promise<responst_t<"none">> {
  try {
    const res = await axios_account.post(
      `/transaction`,
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
export async function put(
  token: string,
  data: TransitionForm_t
): Promise<responst_t<"none">> {
  console.log(data);
  try {
    const res = await axios_account.put(
      `/transaction?id=${data.id}`,
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

const Access_f = {
  getDetail,
  getWallet,
  get,
  del,
  post,
  put
}

export default Access_f;