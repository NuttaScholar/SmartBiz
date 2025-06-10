import axios from "axios";
import { LoginForm_t, responstLogin_t } from "./type";


export async function postLogin(
    data: LoginForm_t
): Promise<responstLogin_t<"none">> {
    console.log(data);
    try {
        const res = await axios.post(
            `https://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_LOGIN
            }/login`,
            data,
            { withCredentials: true }
        );
        return res.data as responstLogin_t<"none">;
    } catch (err) {
        throw err;
    }
}
