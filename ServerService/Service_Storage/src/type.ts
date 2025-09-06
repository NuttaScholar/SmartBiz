import { errorCode_e, role_e, transactionType_e } from "./enum";

export type tokenPackage_t = {
  username: string;
  role: role_e;
  type: "accessToken" | "refreshToken";
}
export type endPoint_t = { Bucket?: string; Key?: string }
export type setBucket_t = { Bucket?: string; Private?: boolean }
export type setImg_t = endPoint_t & {
  width?: number;
  height?: number;
}

export type responst_t<
  T extends
  | "getPresigned"
  | "postImg"
  | "none"
> = T extends "getPresigned" | "postImg"
  ? {
    status: "success" | "error";
    result?: { url: string };
    errCode?: errorCode_e;
  }
  : {
    status: "success" | "error";
    errCode?: errorCode_e;
  }
