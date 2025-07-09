// src/context/AuthContext.tsx
import { createContext, useState, ReactNode } from "react";
import { Auth_t } from "../API/LoginService/type";

export type AuthContext_t = {
  auth?: Auth_t;
  setAuth: (auth: Auth_t) => void;
};

export const AuthContext = createContext<AuthContext_t|undefined>(undefined);
AuthContext.displayName = "AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<Auth_t>();

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
