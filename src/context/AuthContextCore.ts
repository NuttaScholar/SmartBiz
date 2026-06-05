import { createContext } from "react";
import { Auth_t } from "../API/LoginService/type";

export type AuthContext_t = {
  auth?: Auth_t;
  setAuth: (auth: Auth_t) => void;
};

export const AuthContext = createContext<AuthContext_t | undefined>(undefined);
AuthContext.displayName = "AuthContext";
