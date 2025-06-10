import axios from "axios";
import { LoginForm_t, responstLogin_t } from "./type";

export async function postLogin(
    data: LoginForm_t
): Promise<responstLogin_t<"none">> {
    try {
        const res = await axios.post(
            `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_LOGIN
            }/login`,
            data,
            { withCredentials: true }
        );
        return res.data as responstLogin_t<"none">;
    } catch (err) {
        throw err;
    }
}
export async function getToken(
): Promise<responstLogin_t<"getToken">> {
    try {
        const res = await axios.get(
            `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_LOGIN
            }/token`,
            { withCredentials: true }
        );
        return res.data as responstLogin_t<"getToken">;
    } catch (err) {
        throw err;
    }
}
export async function postLogout(
): Promise<responstLogin_t<"none">> {
    try {
        const res = await axios.post(
            `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_LOGIN
            }/logout`,null,
            { withCredentials: true }
        );
        return res.data as responstLogin_t<"none">;
    } catch (err) {
        throw err;
    }
}

