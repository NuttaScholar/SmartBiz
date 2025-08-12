import {  LoginForm_t, responstLogin_t } from "./type";
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
    console.log("logout");
    try {
        const res = await axios_login.post(
            "/logout", null
        );
        return res.data as responstLogin_t<"none">;
    } catch (err) {
        throw err;
    }
}

const Login_f = {
    postLogin,
    getToken,
    postLogout
};

export default Login_f
