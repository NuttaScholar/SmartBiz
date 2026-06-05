import Contact_f, { ContactSearchParams_t } from "../../../API/AccountService/Contact";
import { ContactForm_t, ContactInfo_t } from "../../../API/AccountService/type";
import Login_f from "../../../API/LoginService/Login";
import { contactInfo_t } from "../../../component/Molecules/ContactInfo";
import { AuthContext_t } from "../../../context/AuthContextCore";
import { errorCode_e } from "../../../enum";

interface resApiWithRetry_t {
    data?: any;
    success: boolean;
    errCode?: errorCode_e;
    message?: string;
}
interface resContactWithRetry_t extends resApiWithRetry_t {
    data?: ContactInfo_t[];
    index?: number;
    size?: number;
    total?: number;
    hasMore?: boolean;
}

function normalizeContactData(response: Awaited<ReturnType<typeof Contact_f.get>>): resContactWithRetry_t {
    if (!response.success) {
        return {
            success: false,
            errCode: response.errCode,
            message: response.message,
        };
    }

    if (Array.isArray(response.data)) {
        return {
            success: true,
            data: response.data,
        };
    }

    return {
        success: true,
        data: response.data?.contacts ?? [],
        index: response.data?.index,
        size: response.data?.size,
        total: response.data?.total,
        hasMore: response.data?.hasMore,
    };
}

async function contactWithRetry(context: AuthContext_t, func: (token: string, data: any) => Promise<resApiWithRetry_t>, data: any) {
    if (!context.auth) {
        throw new Error("apiWithRetry_f must be used within an AuthProvider");
    }

    const firstRes = await func(context.auth.token, data);
    if (firstRes.success) {
        return get(context);
    }

    if (firstRes.errCode === errorCode_e.TokenExpiredError) {
        const tokenRes = await Login_f.getToken();
        if (tokenRes.success && tokenRes.data) {
            const retryRes = await func(tokenRes.data.token, data);
            context.setAuth(tokenRes.data);
            if (retryRes.success) {
                return get(context);
            }
            return { success: false, errCode: retryRes.errCode, message: retryRes.message };
        }
        return { success: false, errCode: tokenRes.errCode, message: tokenRes.message };
    }

    return { success: false, errCode: firstRes.errCode, message: firstRes.message };
}

export async function get(
    context: AuthContext_t,
    keyword?: string | ContactSearchParams_t
): Promise<resContactWithRetry_t> {
    if (!context.auth) {
        throw new Error("apiWithRetry_f must be used within an AuthProvider");
    }

    const contactRes = await Contact_f.get(context.auth.token, keyword);
    if (contactRes.success) {
        return normalizeContactData(contactRes);
    }

    if (contactRes.errCode === errorCode_e.TokenExpiredError) {
        const tokenRes = await Login_f.getToken();
        if (tokenRes.success && tokenRes.data) {
            const retryRes = await Contact_f.get(tokenRes.data.token, keyword);
            context.setAuth(tokenRes.data);
            return normalizeContactData(retryRes);
        }
        return { success: false, errCode: tokenRes.errCode, message: tokenRes.message };
    }

    return { success: false, errCode: contactRes.errCode, message: contactRes.message };
}

export async function post(context: AuthContext_t, data: ContactForm_t): Promise<resContactWithRetry_t> {
    return contactWithRetry(context, Contact_f.post, data);
}

export async function put(context: AuthContext_t, data: ContactForm_t): Promise<resContactWithRetry_t> {
    return contactWithRetry(context, Contact_f.put, data);
}

export async function del(context: AuthContext_t, data: contactInfo_t): Promise<resContactWithRetry_t> {
    return contactWithRetry(context, Contact_f.del, data);
}

const contactWithRetry_f = {
    get,
    post,
    put,
    del
}

export default contactWithRetry_f;
