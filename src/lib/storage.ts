import { Auth_t } from "../API/LoginService/type";

export function saveAuth(data: Auth_t) {
    localStorage.setItem("auth", JSON.stringify(data));
}
export function loadAuth(): Auth_t | null {
    const authStr = localStorage.getItem("auth");
    if (authStr) {
        const authObj = JSON.parse(authStr) as Auth_t;
        return authObj;
    } else {
        return null;
    }
}