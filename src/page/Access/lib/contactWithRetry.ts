import Contact_f from "../../../API/AccountService/Contact";
import { ContactForm_t, ContactInfo_t } from "../../../API/AccountService/type";
import Login_f from "../../../API/LoginService/Login";
import { contactInfo_t } from "../../../component/Molecules/ContactInfo";
import { AuthContext_t } from "../../../context/AuthContext";
import { errorCode_e } from "../../../enum";

interface resApiWithRetry_t {
    result?: any;
    status: "success" | "error"
    errCode?: errorCode_e;
}
interface resContactWithRetry_t extends resApiWithRetry_t {
    result?: ContactInfo_t[];
}
async function contactWithRetry(context: AuthContext_t, func: (token: string, data: any) => Promise<resApiWithRetry_t>, data: any) {
    if (!context.auth) {
        throw new Error("apiWithRetry_f must be used within an AuthProvider");
    }
    try {
        const putContactRes = await func(context.auth.token, data);
        if (putContactRes.status === "success") {
            const list = await get(context);
            const result: resApiWithRetry_t = { status: "success", result: list.result }
            return result;
        }

        if (putContactRes.errCode === errorCode_e.TokenExpiredError) {
            const tokenRes = await Login_f.getToken();
            if (tokenRes.status === "success" && tokenRes.result) {
                const retryRes = await func(tokenRes.result.token, data);
                context.setAuth(tokenRes.result);
                if (retryRes.status === "success") {
                    const list = await get(context);
                    const result: resApiWithRetry_t = { status: "success", result: list.result }
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
        } else if (putContactRes.errCode) {
            const result: resApiWithRetry_t = { status: "error", errCode: putContactRes.errCode };
            return result;
        } else {
            throw new Error("Server Error");
        }

    } catch (err) {
        throw new Error(`${err}`);
    }
}
export async function get(context: AuthContext_t, keyword?: string): Promise<resContactWithRetry_t> {
    if (!context.auth) {
        throw new Error("apiWithRetry_f must be used within an AuthProvider");
    }
    try {
        const contactRes = await Contact_f.get(context.auth.token, keyword);
        if (contactRes.status === "success" && contactRes.result) {
            const result: resContactWithRetry_t = { status: "success", result: contactRes.result }
            return result;
        }

        if (contactRes.errCode === errorCode_e.TokenExpiredError) {
            const tokenRes = await Login_f.getToken();
            if (tokenRes.status === "success" && tokenRes.result) {
                const retryRes = await Contact_f.get(tokenRes.result.token, keyword);
                context.setAuth(tokenRes.result);
                if (retryRes.status === "success" && retryRes.result) {
                    const result: resContactWithRetry_t = { status: "success", result: retryRes.result }
                    return result;
                } else if (retryRes.errCode) {
                    const result: resContactWithRetry_t = { status: "error", errCode: retryRes.errCode }
                    return result;
                } else {
                    throw new Error("Server Error");
                }
            } else if (tokenRes.errCode) {
                const result: resContactWithRetry_t = { status: "error", errCode: tokenRes.errCode }
                return result;
            } else {
                throw new Error("Server Error");
            }
        } else if (contactRes.errCode) {
            const result: resContactWithRetry_t = { status: "error", errCode: contactRes.errCode };
            return result;
        } else {
            throw new Error("Server Error");
        }

    } catch (err) {
        throw new Error(`${err}`);
    }
}

export async function post(context: AuthContext_t, data: ContactForm_t): Promise<resContactWithRetry_t> {
    try {
        const res: resContactWithRetry_t = await contactWithRetry(context, Contact_f.post, data);
        return res;
    } catch (err) {
        throw new Error(`${err}`);
    }
}

export async function put(context: AuthContext_t, data: ContactForm_t): Promise<resContactWithRetry_t> {
    try {
        const res: resContactWithRetry_t = await contactWithRetry(context, Contact_f.put, data);
        return res;
    } catch (err) {
        throw new Error(`${err}`);
    }
}

export async function del(context: AuthContext_t, data: contactInfo_t): Promise<resContactWithRetry_t> {
    try {
        const res: resContactWithRetry_t = await contactWithRetry(context, Contact_f.del, data);
        return res;
    } catch (err) {
        throw new Error(`${err}`);
    }
}

const contactWithRetry_f = {
    get,
    post,
    put,
    del
}

export default contactWithRetry_f; 