import { errorCode_e, productType_e, role_e, stockStatus_e } from "./enum";

export type productInfo_t = {
    id: string;
    type: productType_e;
    name: string;    
    condition: number;
    img?: string;
    status?: stockStatus_e;
    price?: number;    
    description?: string;
    amount?: number;
}
export type stockStatus_t = {
  stockTotal: number;
  stockLow: number;
  stockOut: number;
  materialTotal: number;
  materialLow: number;
  materialOut: number;
}
export type billInfo_t = {
  id: string;
  date: Date;
  type: "in" | "out";
  img: string;
  description?: string;
}
export type stockLog_t = {
  productID: string;
  billID: string;
  amount: number;  
}

export type tokenPackage_t = {
  username: string;
  role: role_e;
  type: "accessToken" | "refreshToken";
}
export type responst_t<
  T extends
  | "getProduct"
  | "getStatus"
  | "none"
> = T extends "getProduct"
  ? {
    status: "success" | "error";
    result?: productInfo_t[];
    errCode?: errorCode_e;
  }
  :T extends "getStatus"
  ? {
    status: "success" | "error";
    result?: stockStatus_t;
    errCode?: errorCode_e;
  }
  : {
    status: "success" | "error";
    errCode?: errorCode_e;
  }
