import Login_f from "../API/LoginService/Login";
import { AuthContext_t } from "../context/AuthContextCore";
import { errorCode_e } from "../enum";
import { initPage } from "./initPage";

export interface resApiWithRetry_t {
    data?: any;
    success: boolean;
    errCode?: errorCode_e;
    message?: string;
}

export default async function ApiWithRetry(context: AuthContext_t, func: (token: string, data: any) => Promise<resApiWithRetry_t>, data?: any) {
    try {
        const auth = await initPage(context);
        const firstRes = await func(auth.token, data);
        if (firstRes.success) {
            return firstRes;
        }

        if (firstRes.errCode === errorCode_e.TokenExpiredError) {
            const tokenRes = await Login_f.getToken();
            if (tokenRes.success && tokenRes.data) {
                const retryRes = await func(tokenRes.data.token, data);
                context.setAuth(tokenRes.data);
                if (retryRes.success) {
                    console.log("ApiWithRetry retryRes", retryRes);
                    return retryRes;
                } else if (retryRes.errCode) {
                    const result: resApiWithRetry_t = { success: false, errCode: tokenRes.errCode };
                    return result;
                } else {
                    throw "Server Error";
                }
            } else if (tokenRes.errCode) {
                const result: resApiWithRetry_t = { success: false, errCode: tokenRes.errCode };
                return result;
            } else {
                throw "Server Error";
            }
        } else if (firstRes.errCode) {
            const result: resApiWithRetry_t = { success: false, errCode: firstRes.errCode };
            return result;
        } else {
            throw "Server Error";
        }

    } catch (err) {
        console.log("ApiWithRetry err", err);
        throw new Error(`${err}`);
    }
}
