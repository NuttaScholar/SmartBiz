import Login_f from "../API/LoginService/Login";
import { AuthContext_t } from "../context/AuthContext";
import { errorCode_e } from "../enum";
import { initPage } from "./initPage";

export interface resApiWithRetry_t {
    result?: any;
    status: "success" | "error" | "warning";
    errCode?: errorCode_e;
}

export default async function ApiWithRetry(context: AuthContext_t, func: (token: string, data: any) => Promise<resApiWithRetry_t>, data?: any) {
    try {
        const auth = await initPage(context);
        const firstRes = await func(auth.token, data);
        if (firstRes.status === "success" || firstRes.status === "warning") {
            const result: resApiWithRetry_t = { status: firstRes.status, result: firstRes.result }
            return result;
        }

        if (firstRes.errCode === errorCode_e.TokenExpiredError) {
            const tokenRes = await Login_f.getToken();
            if (tokenRes.status === "success" && tokenRes.result) {
                const retryRes = await func(tokenRes.result.token, data);
                context.setAuth(tokenRes.result);
                if (retryRes.status === "success" || retryRes.status === "warning") {
                    console.log("ApiWithRetry retryRes", retryRes);
                    const result: resApiWithRetry_t = { status: retryRes.status, result: retryRes.result }
                    return result;
                } else if (retryRes.errCode) {
                    const result: resApiWithRetry_t = { status: "error", errCode: tokenRes.errCode };
                    return result;
                } else {
                    throw "Server Error";
                }
            } else if (tokenRes.errCode) {
                const result: resApiWithRetry_t = { status: "error", errCode: tokenRes.errCode };
                return result;
            } else {
                throw "Server Error";
            }
        } else if (firstRes.errCode) {
            const result: resApiWithRetry_t = { status: "error", errCode: firstRes.errCode };
            return result;
        } else {
            throw "Server Error";
        }

    } catch (err) {
        console.log("ApiWithRetry err", err);
        throw new Error(`${err}`);
    }
}