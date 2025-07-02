import { errorCode_e, role_e } from "../../enum";

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
  role: role_e;
  tel?: string;
  img?: string; // Image URL
}
export type EditUserFrom_t = {
  id: string;
  email?: string;
  name?: string;
  role?: role_e;
  enable?: boolean;
  tel?: string;
  img?: string; // Image URL
}
export type EditPassFrom_t = {
  oldPass: string;
  newPass: string;
}
export type UserProfile_t = {
  _id?: string;
  email: string;
  name: string;
  role: role_e;
  enable: boolean;
  passHash?: string;
  tel?: string;
  img?: string; // Image URL
}
export type tokenPackage_t = {
  username: string;
  role: role_e;
  type: "accessToken" | "refreshToken";
}
export type Auth_t = { token: string; role: role_e };

export type responstLogin_t<
  T extends
  | "getUser"
  | "getToken"
  | "postLogin"
  | "none"
> = T extends "getUser"
  ? {
    status: "success" | "error";
    result?: UserProfile_t[];
    errCode?: errorCode_e;
  }
  : T extends "getToken" | "postLogin"
  ? {
    status: "success" | "error";
    result?: Auth_t;
    errCode?: errorCode_e;
  }
  : {
    status: "success" | "error";
    errCode?: errorCode_e;
  };


