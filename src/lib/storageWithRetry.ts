import Storage_f from "../API/StorageService/Storage";
import { endPoint_t } from "../API/StorageService/type";
import { AuthContext_t } from "../context/AuthContext";
import ApiWithRetry, { resApiWithRetry_t } from "./apiWithRetry";

interface resPostImgWithRetry_t extends resApiWithRetry_t {
    result?: {url: string;};
}

export async function postImg(context: AuthContext_t, data: FormData): Promise<resPostImgWithRetry_t> {
    try {
        const res: resPostImgWithRetry_t = await ApiWithRetry(context, Storage_f.postImg, data);
        return res;
    } catch (err) {
        throw new Error(`${err}`);
    }
}
export async function delImg(context: AuthContext_t, data: endPoint_t): Promise<resApiWithRetry_t> {
    try {
        const res: resApiWithRetry_t = await ApiWithRetry(context, Storage_f.delImg, data);
        return res;
    } catch (err) {
        throw new Error(`${err}`);
    }
}
export async function getImg(context: AuthContext_t, data: endPoint_t): Promise<resPostImgWithRetry_t> {
    try {
        const res: resPostImgWithRetry_t = await ApiWithRetry(context, Storage_f.getImg, data);
        return res;
    } catch (err) {
        throw new Error(`${err}`);
    }
}

const storageWithRetry_f = {
    postImg,
    delImg,
    getImg
}

export default storageWithRetry_f; 