import axios from "axios";
import { ContactForm_t, responst_t } from "./type";
import { contactInfo_t } from "../../component/Molecules/ContactInfo";

export type ContactSearchParams_t = {
  id?: string;
  index?: number;
  size?: number;
};

function toContactQuery(params?: string | ContactSearchParams_t) {
  const search = new URLSearchParams();

  if (typeof params === "string") {
    if (params) search.set("id", params);
  } else if (params) {
    if (params.id) search.set("id", params.id);
    if (params.index !== undefined) search.set("index", String(params.index));
    if (params.size !== undefined) search.set("size", String(params.size));
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function get(
  token: string,
  params?: string | ContactSearchParams_t,
): Promise<responst_t<"getContact">> {
  try {
    const res = await axios.get(
      `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_ACCESS
      }/contact${toContactQuery(params)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data as responst_t<"getContact">;
  } catch (err) {
    throw err;
  }
}
export async function post(token: string, data: ContactForm_t): Promise<responst_t<"none">> {
  try {
    const res = await axios.post(
      `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_ACCESS
      }/contact`, data, {
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
export async function put(token: string, data: ContactForm_t): Promise<responst_t<"none">> {
  try {
    const res = await axios.put(
      `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_ACCESS
      }/contact`, data, {
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
export async function del(token: string, data: contactInfo_t): Promise<responst_t<"none">> {
  console.log(data);
  try {
    const res = await axios.delete(
      `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_ACCESS
      }/contact?id=${data.codeName}`, {
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

const Contact_f = {
  get,
  post,
  put,
  del
}

export default Contact_f;
