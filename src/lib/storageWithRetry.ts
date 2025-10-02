import Storage_f from "../API/StorageService/Storage";
import { AuthContext_t } from "../context/AuthContext";
import ApiWithRetry, { resApiWithRetry_t } from "./apiWithRetry";


export async function postImg(context: AuthContext_t, data: FormData): Promise<resApiWithRetry_t> {
    try {
        const res: resApiWithRetry_t = await ApiWithRetry(context, Storage_f.postImg, data);
        return res;
    } catch (err) {
        throw new Error(`${err}`);
    }
}

const storageWithRetry_f = {
    postImg
}

export default storageWithRetry_f; 