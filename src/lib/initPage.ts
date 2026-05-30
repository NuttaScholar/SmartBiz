import Login_f from "../API/LoginService/Login";
import { Auth_t } from "../API/LoginService/type";
import { AuthContext_t } from "../context/AuthContext";
import { errorCode_e } from "../enum";
import { ErrorString } from "../function/Enum";

export async function initPage(authContext: AuthContext_t): Promise<Auth_t> {
    if (authContext.auth === undefined) {
        try {
            const resLogin = await Login_f.getToken();
            if (!resLogin.success && resLogin.errCode) {
                throw ErrorString(resLogin.errCode);  
            } else if(resLogin.data!== undefined){
                authContext.setAuth(resLogin.data);
                return resLogin.data as Auth_t;
            }else{
                console.error("Error during initPage:", resLogin);
                throw ErrorString(errorCode_e.UnknownError);
            }
        } catch (err) {
            console.error("Error during initPage:", err);
            if (
                err === ErrorString(errorCode_e.TokenExpiredError) ||
                err === ErrorString(errorCode_e.UnauthorizedError)
            ) {
                throw err;
            }
            throw ErrorString(errorCode_e.UnknownError);
        }
    } else {
        return authContext.auth as Auth_t;
    }
}
