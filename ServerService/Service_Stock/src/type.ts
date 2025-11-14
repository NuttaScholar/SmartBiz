import { errorCode_e, productType_e, role_e, stockLogType_e, stockStatus_e } from "./enum";

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
export type stockForm_t = {
  productID: string;
  amount: number;
  price?: number;
}
export type stockOutForm_t = {
  note?: string;
  products: stockForm_t[];
}
export type logInfo_t = {
  productID:  string;
  amount: number;
  type: stockLogType_e,
  date: Date;
  price?: number;
  bill?: string;
  note?: string;
}
export type logReq_t = {
  id: string;
  index?: number;
  size?: number;
}
export type logRes_t = {
  total: number;
  index: number;
  size: number;
  logs: logInfo_t[];
}
export type stockStatus_t = {
  stockTotal: number;
  stockLow: number;
  stockOut: number;
  materialTotal: number;
  materialLow: number;
  materialOut: number;
}
export type productRes_t = {
  status: stockStatus_t;
  products: productInfo_t[];
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
  | "getLog"
  | "postStock"
  | "none"
> = T extends "getProduct"
  ? {
    status: "success" | "error";
    result?: productRes_t;
    errCode?: errorCode_e;
  }
  : T extends "getStatus"
  ? {
    status: "success" | "error";
    result?: stockStatus_t;
    errCode?: errorCode_e;
  }
  : T extends "getLog"
  ? {
    status: "success" | "error";
    result?: logRes_t;
    errCode?: errorCode_e;
  }
  : T extends "postStock"
  ? {
    status: "success" | "error" | "warning";
    errList?: stockForm_t[];
    errCode?: errorCode_e;
  }
  : {
    status: "success" | "error";
    errCode?: errorCode_e;
  }
