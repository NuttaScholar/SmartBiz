import { axios_storage } from "../../lib/axios";
import { endPoint_t, responst_t } from "./type";

export async function postImg(
    token: string,
    data: FormData
): Promise<responst_t<"postImg">> {
    try {
        const res = await axios_storage.post(
            `/image`,
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
export async function delImg(
    token: string,
    data: endPoint_t
): Promise<responst_t<"none">> {
    try {
        const res = await axios_storage.delete(
            `/image?Bucket=${data.Bucket}&Key=${data.Key}`,{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
        );
        return res.data as responst_t<"none">;
    } catch (err) {
        throw err;
    }
}
export async function getImg(
    token: string,
    data: endPoint_t
): Promise<responst_t<"getPresigned">> {
    try {
        const res = await axios_storage.get(
            `/presignedGet?Bucket=${data.Bucket}&Key=${data.Key}`,{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
        );
        return res.data as responst_t<"getPresigned">;
    } catch (err) {
        throw err;
    }
}

const Storage_f = {
    postImg,
    delImg,
    getImg
}

export default Storage_f;