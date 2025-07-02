import axios, { AxiosRequestConfig } from "axios";
import { EditPassFrom_t, LoginForm_t, responstLogin_t } from "./type";

const config: AxiosRequestConfig = { withCredentials: true }
export async function postLogin(
    data: LoginForm_t
): Promise<responstLogin_t<"none">> {
    try {
        const res = await axios.post(
            `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_LOGIN
            }/login`, data, config
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
            }/token`, config
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
            }/logout`, null, config
        );
        return res.data as responstLogin_t<"none">;
    } catch (err) {
        throw err;
    }
}
export async function putPass(
    token: string,
    data: EditPassFrom_t
): Promise<responstLogin_t<"none">> {
    try {
        const res = await axios.post(
            `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_LOGIN
            }/pass`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
        );
        return res.data as responstLogin_t<"none">;
    } catch (err) {
        throw err;
    }
}
