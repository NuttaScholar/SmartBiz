import axios from "axios";
import { ContactForm_t, responst_t} from "./type";
import { contactInfo_t } from "../../component/Molecules/ContactInfo";

export async function get(id?: string): Promise<responst_t<"getContact">> {
  try {
    const res = await axios.get(
      `http://${import.meta.env.VITE_HOST}:${
        import.meta.env.VITE_PORT_ACCESS
      }/contact${id?`?id=${id}`:""}`
    );
    return res.data as responst_t<"getContact">;
  } catch (err) {
    throw err;
  }
}
export async function post(data:ContactForm_t): Promise<responst_t<"none">> {
  try {
    const res = await axios.post(
      `http://${import.meta.env.VITE_HOST}:${
        import.meta.env.VITE_PORT_ACCESS
      }/contact`, data
    );
    return res.data as responst_t<"none">;
  } catch (err) {
    throw err;
  }
}
export async function put(data:ContactForm_t): Promise<responst_t<"none">> {
  try {
    const res = await axios.put(
      `http://${import.meta.env.VITE_HOST}:${
        import.meta.env.VITE_PORT_ACCESS
      }/contact`, data
    );
    return res.data as responst_t<"none">;
  } catch (err) {
    throw err;
  }
}
export async function del(data:contactInfo_t): Promise<responst_t<"none">> {
  console.log(data);
  try {
    const res = await axios.delete(
      `http://${import.meta.env.VITE_HOST}:${
        import.meta.env.VITE_PORT_ACCESS
      }/contact?id=${data.codeName}`
    );
    return res.data as responst_t<"none">;
  } catch (err) {
    throw err;
  }
}