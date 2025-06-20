import axios from "axios";
import { EditUserFrom_t, RegistFrom_t, responstLogin_t } from "./type";

export async function post(
    token: string,
    data: RegistFrom_t
): Promise<responstLogin_t<"none">> {
    try {
        const res = await axios.post(
            `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_LOGIN
            }/user`,
            data,
            {
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
export async function del(
    token: string,
    id: string
): Promise<responstLogin_t<"none">> {
    try {
        const res = await axios.delete(
            `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_LOGIN
            }/user?id=${id}`,
            {
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
export async function get(
    token: string,
    keyName?: string
): Promise<responstLogin_t<"getUser">> {
    try {
        const res = await axios.get(
            `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_LOGIN
            }/user${(keyName!==undefined)?`?name=${keyName}`:""}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return res.data as responstLogin_t<"getUser">;
    } catch (err) {
        throw err;
    }
}
export async function put(
    token: string,
    data: EditUserFrom_t
): Promise<responstLogin_t<"none">> {
    try {
        const res = await axios.put(
            `http://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT_LOGIN
            }/user`, data,
            {
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