import axios from "axios";
import { ContactForm_t, responstDB_t} from "../type";

export async function get(): Promise<responstDB_t<"getContact">> {
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
export async function post(data:ContactForm_t): Promise<responstDB_t<"post">> {
  try {
    const res = await axios.post(
      `http://${import.meta.env.VITE_HOST}:${
        import.meta.env.VITE_PORT_ACCESS
      }/contact`, data
    );
    return res.data as responstDB_t<"post">;
  } catch (err) {
    throw err;
  }
}
export async function put(data:ContactForm_t): Promise<responstDB_t<"put">> {
  console.log(data);
  try {
    const res = await axios.put(
      `http://${import.meta.env.VITE_HOST}:${
        import.meta.env.VITE_PORT_ACCESS
      }/contact`, data
    );
    return res.data as responstDB_t<"put">;
  } catch (err) {
    throw err;
  }
}