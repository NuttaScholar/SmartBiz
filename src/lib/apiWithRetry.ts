import Login_f from "../API/LoginService/Login";
import { AuthContext_t } from "../context/AuthContext";
import { errorCode_e } from "../enum";
import { initPage } from "./initPage";

export interface resApiWithRetry_t {
    result?: any;
    status: "success" | "error"
    errCode?: errorCode_e;
}

export default async function ApiWithRetry(context: AuthContext_t, func: (token: string, data: any) => Promise<resApiWithRetry_t>, data?: any) {
    try {
        const auth = await initPage(context);
        const firstRes = await func(auth.token, data);
        if (firstRes.status === "success") {
            const result: resApiWithRetry_t = { status: "success", result: firstRes.result }
            return result;
        }

        if (firstRes.errCode === errorCode_e.TokenExpiredError) {
            const tokenRes = await Login_f.getToken();
            if (tokenRes.status === "success" && tokenRes.result) {
                const retryRes = await func(tokenRes.result.token, data);
                context.setAuth(tokenRes.result);
                if (retryRes.status === "success") {
                    const result: resApiWithRetry_t = { status: "success", result: retryRes.result }
                    return result;
                } else if (retryRes.errCode) {
                    const result: resApiWithRetry_t = { status: "error", errCode: tokenRes.errCode };
                    return result;
                } else {
                    throw new Error("Server Error");
                }
            } else if (tokenRes.errCode) {
                const result: resApiWithRetry_t = { status: "error", errCode: tokenRes.errCode };
                return result;
            } else {
                throw new Error("Server Error");
            }
        } else if (firstRes.errCode) {
            const result: resApiWithRetry_t = { status: "error", errCode: firstRes.errCode };
            return result;
        } else {
            throw new Error("Server Error");
        }

    } catch (err) {
        throw new Error(`${err}`);
    }   
}