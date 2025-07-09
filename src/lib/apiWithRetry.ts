import Contact_f from "../API/AccountService/Contact";
import { ContactForm_t, ContactInfo_t } from "../API/AccountService/type";
import Login_f from "../API/LoginService/Login";
import { Auth_t } from "../API/LoginService/type";
import { AuthContext_t } from "../context/AuthContext";
import { errorCode_e } from "../enum";
import { ErrorString } from "../function/Enum";

export async function getContact(context: AuthContext_t, keyword?: string): Promise<ContactInfo_t[]> {
    if (!context.auth) {
        throw new Error("apiWithRetry_f must be used within an AuthProvider");
    }
    try {
        const contactRes = await Contact_f.get(context.auth.token, keyword);
        if (contactRes.status === "success" && contactRes.result) {
            return contactRes.result;
        }

        if (contactRes.errCode === errorCode_e.TokenExpiredError) {
            const tokenRes = await Login_f.getToken();
            if (tokenRes.status === "success" && tokenRes.result) {
                const retryRes = await Contact_f.get(tokenRes.result.token, keyword);
                context.setAuth(tokenRes.result);
                if (retryRes.status === "success" && retryRes.result) {
                    return retryRes.result;
                } else if (retryRes.errCode) {
                    throw new Error(ErrorString(retryRes.errCode));
                } else {
                    throw new Error("Server Error");
                }
            } else if (tokenRes.errCode) {
                throw new Error(ErrorString(tokenRes.errCode));
            } else {
                throw new Error("Server Error");
            }
        }
        // กรณีอื่นที่ไม่ใช่ TokenExpiredError
        throw new Error("Unknown response from server");

    } catch (err) {
        console.error("getContact error:", err);
        throw new Error("Unknown Error");
    }
}

export async function postContact(context: AuthContext_t, data: ContactForm_t): Promise<ContactInfo_t[]> {
    if (!context.auth) {
        throw new Error("apiWithRetry_f must be used within an AuthProvider");
    }
    try {
        const postContactRes = await Contact_f.post(context.auth.token, data);
        if (postContactRes.status === "success") {
            return await getContact(context);            
        }

        if (postContactRes.errCode === errorCode_e.TokenExpiredError) {
            const tokenRes = await Login_f.getToken();
            if (tokenRes.status === "success" && tokenRes.result) {
                const retryRes = await Contact_f.post(tokenRes.result.token, data);
                context.setAuth(tokenRes.result);
                if (retryRes.status === "success") {
                    return await getContact(context);   
                } else if (retryRes.errCode) {
                    throw new Error(ErrorString(retryRes.errCode));
                } else {
                    throw new Error("Server Error");
                }
            } else if (tokenRes.errCode) {
                throw new Error(ErrorString(tokenRes.errCode));
            } else {
                throw new Error("Server Error");
            }
        }
        // กรณีอื่นที่ไม่ใช่ TokenExpiredError
        throw new Error("Unknown response from server");

    } catch (err) {
        console.error("getContact error:", err);
        throw new Error("Unknown Error");
    }
}

export async function putContact(context: AuthContext_t, data: ContactForm_t): Promise<ContactInfo_t[]> {
    if (!context.auth) {
        throw new Error("apiWithRetry_f must be used within an AuthProvider");
    }
    try {
        const putContactRes = await Contact_f.put(context.auth.token, data);
        if (putContactRes.status === "success") {
            return await getContact(context);            
        }

        if (putContactRes.errCode === errorCode_e.TokenExpiredError) {
            const tokenRes = await Login_f.getToken();
            if (tokenRes.status === "success" && tokenRes.result) {
                const retryRes = await Contact_f.post(tokenRes.result.token, data);
                context.setAuth(tokenRes.result);
                if (retryRes.status === "success") {
                    return await getContact(context);   
                } else if (retryRes.errCode) {
                    throw new Error(ErrorString(retryRes.errCode));
                } else {
                    throw new Error("Server Error");
                }
            } else if (tokenRes.errCode) {
                throw new Error(ErrorString(tokenRes.errCode));
            } else {
                throw new Error("Server Error");
            }
        }
        // กรณีอื่นที่ไม่ใช่ TokenExpiredError
        throw new Error("Unknown response from server");

    } catch (err) {
        console.error("getContact error:", err);
        throw new Error("Unknown Error");
    }
}

const apiWithRetry_f = {
    getContact,
    postContact,
    putContact
}

export default apiWithRetry_f; 