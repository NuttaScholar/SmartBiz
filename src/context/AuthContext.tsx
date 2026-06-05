import { useState, ReactNode } from "react";
import { Auth_t } from "../API/LoginService/type";
import { AuthContext } from "./AuthContextCore";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<Auth_t>();

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
