import axios, { AxiosRequestConfig } from "axios";
import { EditPassFrom_t, LoginForm_t, responstLogin_t } from "./type";
import useAxios from "../../hooks/useAxios";
import { errorCode_e, service_e } from "../../enum";
import { axios_login } from "../../lib/axios";

export async function postLogin(
    data: LoginForm_t
): Promise<responstLogin_t<"postLogin">> {
    try {
        const res = await axios_login.post(
            "/login", data
        );
        return res.data as responstLogin_t<"postLogin">;

    } catch (err) {
        throw err;
    }
}
export async function getToken(
): Promise<responstLogin_t<"getToken">> {
    try {
        const res = await axios_login.get(
            "/token"
        );
        return res.data as responstLogin_t<"getToken">;
    } catch (err) {
        throw err;
    }
}
export async function postLogout(
): Promise<responstLogin_t<"none">> {
    try {
        const res = await axios_login.post(
            "/logout", null
        );
        return res.data as responstLogin_t<"none">;
    } catch (err) {
        throw err;
    }
}

