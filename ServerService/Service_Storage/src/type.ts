import { errorCode_e, role_e, transactionType_e } from "./enum";

export type tokenPackage_t = {
  username: string;
  role: role_e;
  type: "accessToken" | "refreshToken";
}
export type responst_t<
  T extends
  | "getPresigned"
  | "none"
> = T extends "getPresigned"
  ? {
    status: "success" | "error";
    result?: {url:string};
    errCode?: errorCode_e;
  }  
  : {
    status: "success" | "error";
    errCode?: errorCode_e;
  }
