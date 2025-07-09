import { EditPassFrom_t, EditUserFrom_t, RegistFrom_t, responstLogin_t } from "./type";
import { axios_user } from "../../lib/axios";

export async function post(
    token: string,
    data: RegistFrom_t
): Promise<responstLogin_t<"none">> {
    try {
        const res = await axios_user.post(
            "/user",
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
        const res = await axios_user.delete(
            `/user?id=${id}`,
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
        const res = await axios_user.get(
            `/user${(keyName!==undefined)?`?name=${keyName}`:""}`,
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
        const res = await axios_user.put(
            "/user", data,
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
export async function putPass(
    token: string,
    data: EditPassFrom_t
): Promise<responstLogin_t<"none">> {
    try {
        const res = await axios_user.put(
            "pass", data, {
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

const User_f = {
  post,
  del,
  get,
  put,
  putPass
};
export default User_f;