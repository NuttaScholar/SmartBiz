import { errorCode_e, productType_e, role_e, stockLogType_e, stockStatus_e, transactionType_e } from "./utils/enum";
import { LogAuditQueryResult, LogAuditView } from "./models/log-audit.interface";

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
export type stockInForm_t = {
  bill_Img?: File | null;
  products: stockForm_t[];
}
export type stockOutForm_t = {
  note?: string;
  products: stockForm_t[];
}
export type logInfo_t = {
  productID: string;
  amount: number;
  type: stockLogType_e,
  date: Date;
  price?: number;
  bill?: string;
  note?: string;
}
export type logReq_t = {
  id: string;
  type: stockLogType_e;
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
  anotherTotal: number;
  anotherLow: number;
  anotherOut: number;
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
export type TransitionForm_t = {
  id?: string;
  date: Date;
  topic: string;
  type: transactionType_e;
  money: number;
  who?: string;
  description?: string;
  bill?: string;
  readonly?: boolean;
};
export type errList_t = stockForm_t[];
export type tokenPackage_t = {
  username?: string;
  role?: role_e;
  type: "accessToken" | "refreshToken" | "serviceToken";
  service?: string;
  sub?: string;
  scopes?: string[];
}
export type responst_t<
  T extends
  | "getProduct"
  | "getStatus"
  | "getLog"
  | "getStock"
  | "postStock"
  | "getLogAudit"
  | "queryLogAudit"
  | "none"
> = T extends "getProduct"
  ? {
    success: boolean;
    data?: productRes_t;
    errCode?: errorCode_e;
    message?: string;
  }
  : T extends "getStatus"
  ? {
    success: boolean;
    data?: stockStatus_t;
    errCode?: errorCode_e;
    message?: string;
  }
  : T extends "getLog"
  ? {
    success: boolean;
    data?: logRes_t;
    errCode?: errorCode_e;
    message?: string;
  }
  : T extends "getStock"
  ? {
    success: boolean;
    data?: productInfo_t[];
    errCode?: errorCode_e;
    message?: string;
  }
  : T extends "postStock"
  ? {
    success: boolean;
    data?: errList_t;
    errCode?: errorCode_e;
    message?: string;
  }
  : T extends "getLogAudit"
  ? {
    success: boolean;
    data?: LogAuditView;
    errCode?: errorCode_e;
    message?: string;
  }
  : T extends "queryLogAudit"
  ? {
    success: boolean;
    data?: LogAuditQueryResult;
    errCode?: errorCode_e;
    message?: string;
  }
  : {
    success: boolean;
    errCode?: errorCode_e;
    message?: string;
  }
