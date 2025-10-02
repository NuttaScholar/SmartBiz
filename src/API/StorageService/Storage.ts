import { axios_storage } from "../../lib/axios";
import { responst_t } from "./type";

export async function postImg(
    token: string,
    data: FormData
): Promise<responst_t<"postImg">> {
    try {
        const res = await axios_storage.post(
            `/uploadImg`,
            data, {
            headers: {
                Authorization: `Bearer ${token}`,
                ContentType: "multipart/form-data"
            },
        }
        );
        return res.data as responst_t<"postImg">;
    } catch (err) {
        throw err;
    }
}

const Storage_f = {
    postImg,
}

export default Storage_f;