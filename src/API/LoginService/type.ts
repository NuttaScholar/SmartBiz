import { errorCode_e } from "../../enum";

export type LoginForm_t = {
  email: string;
  pass: string;
}
export type TokenForm_t = {
  token: string;
}
export type RegistFrom_t = {
  email: string;
  name: string;
  role: "admin" | "cashier" | "laber";
}
export type EditUserFrom_t = {
  id: string;
  email?: string;
  name?: string;
  role?: "admin" | "cashier" | "laber";
}
export type UserProfile_t = {
  _id: string;
  email: string;
  name: string;
  role: string;
}
export type tokenPackage_t = {
  username: string;
  role: "admin" | "cashier" | "laber";
  type: "accessToken" | "refreshToken";
}

export type responstLogin_t<
  T extends
  | "getUser"
  | "getToken"
  | "none"
> = T extends "getUser"
  ? {
    status: "success" | "error";
    result?: UserProfile_t[];
    errCode?: errorCode_e;
  }
  : T extends "getToken"
  ? {
    status: "success" | "error";
    token?: string;
    errCode?: errorCode_e;
  }
  : {
    status: "success" | "error";
    errCode?: errorCode_e;
  } ;


