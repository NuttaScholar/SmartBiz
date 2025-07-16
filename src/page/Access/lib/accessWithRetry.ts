import Access_f from "../../../API/AccountService/Account";
import { statement_t, TransitionForm_t } from "../../../API/AccountService/type";
import Login_f from "../../../API/LoginService/Login";
import { SearchTransForm_t } from "../component/DialogSearchTransaction";
import { AuthContext_t } from "../../../context/AuthContext";
import { errorCode_e } from "../../../enum";
import { initPage } from "../../../lib/initPage";

interface resApiWithRetry_t {
    result?: any;
    status: "success" | "error"
    errCode?: errorCode_e;
}
interface resStatementWithRetry_t extends resApiWithRetry_t {
    result?: statement_t[];
}
interface resSlipWithRetry_t extends resApiWithRetry_t {
    result?: TransitionForm_t;
}
interface resWalletWithRetry_t extends resApiWithRetry_t {
    result?: number;
}
async function ApiWithRetry(context: AuthContext_t, func: (token: string, data: any) => Promise<resApiWithRetry_t>, data?: any) {

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
    /*if (!context.auth) {
        throw new Error("apiWithRetry_f must be used within an AuthProvider");
    }*/

}
export async function get(context: AuthContext_t, condition: SearchTransForm_t): Promise<resStatementWithRetry_t> {
    try {
        const res: resStatementWithRetry_t = await ApiWithRetry(context, Access_f.get, condition);
        return res;
    } catch (err) {
        throw new Error(`${err}`);
    }
}

export async function getSlip(context: AuthContext_t, condition: SearchTransForm_t): Promise<resSlipWithRetry_t> {
    try {
        const res: resSlipWithRetry_t = await ApiWithRetry(context, Access_f.getDetail, condition);
        return res;
    } catch (err) {
        throw new Error(`${err}`);
    }
}

export async function getWallet(context: AuthContext_t): Promise<resWalletWithRetry_t> {
    try {
        const res: resWalletWithRetry_t = await ApiWithRetry(context, Access_f.getWallet);
        return res;
    } catch (err) {
        throw new Error(`${err}`);
    }
}

export async function post(context: AuthContext_t, data: TransitionForm_t): Promise<resApiWithRetry_t> {
    try {
        const res: resApiWithRetry_t = await ApiWithRetry(context, Access_f.post, data);
        return res;
    } catch (err) {
        throw new Error(`${err}`);
    }
}

export async function put(context: AuthContext_t, data: TransitionForm_t): Promise<resApiWithRetry_t> {
    try {
        const res: resApiWithRetry_t = await ApiWithRetry(context, Access_f.put, data);
        return res;
    } catch (err) {
        throw new Error(`${err}`);
    }
}

export async function del(context: AuthContext_t, id: string): Promise<resApiWithRetry_t> {
    try {
        const res: resApiWithRetry_t = await ApiWithRetry(context, Access_f.del, id);
        return res;
    } catch (err) {
        throw new Error(`${err}`);
    }
}

const accessWithRetry_f = {
    get,
    getSlip,
    getWallet,
    post,
    put,
    del
}

export default accessWithRetry_f; 