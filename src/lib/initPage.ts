import Login_f from "../API/LoginService/Login";
import { Auth_t, responstLogin_t } from "../API/LoginService/type";
import { AuthContext_t } from "../context/AuthContext";
import { errorCode_e } from "../enum";
import { ErrorString } from "../function/Enum";

export async function initPage(authContext: AuthContext_t): Promise<Auth_t> {
    if (authContext.auth === undefined) {
        try {
            const resLogin = await Login_f.getToken();
            if (resLogin.status === "error" && resLogin.errCode) {
                throw ErrorString(resLogin.errCode);  
            } else if(resLogin.result!== undefined){
                authContext.setAuth(resLogin.result);
                return resLogin.result as Auth_t;
            }else{
                console.error("Error during initPage:", resLogin);
                throw ErrorString(errorCode_e.UnknownError);
            }
        } catch (err) {
            console.error("Error during initPage:", err);
            throw ErrorString(errorCode_e.UnknownError);
        }
    } else {
        return authContext.auth as Auth_t;
    }
}