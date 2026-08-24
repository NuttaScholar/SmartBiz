import { errorCode_e, productType_e, role_e, stockLogType_e, stockStatus_e, } from "../../enum";

export type productInfo_t = {
  id: string;
  type: productType_e;
  name: string;
  img: string;
  condition?: number;
  status: stockStatus_e;
  price?: number;
  description?: string;
  amount?: number;
  // For Bill
  total?: number;
  percentDiscount?: number;
  priceAfterDiscount?: number;
}
export type formProduct_t = {
  id: string;
  type: productType_e;
  name: string;
  img?: File | null;
  condition?: number;
  price?: number;
  description?: string;
  amount?: number;
}
export type queryProduct_t = {
  type: productType_e;
  name?: string;
  status?: stockStatus_e;
}
export type logInfo_t = {
  id: string;
  productID:  string;
  amount: number;
  type: stockLogType_e,
  date: Date;
  price?: number;
  bill?: string;
  note?: string;
}
export type stockLogUpdateForm_t = {
  id: string;
  date: Date;
  amount: number;
  price?: number | null;
  note?: string | null;
}
export type logReq_t = {
  id: string;
  type: stockLogType_e;
  index?: number;
  size?: number;
}
export type stockReq_t = {
  productType?: productType_e | productType_e[];
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
export type billInfo_t = {
  id: string;
  date: Date;
  type: "in" | "out";
  img: string;
  description?: string;
}
export type stockLog_t = {
  date: Date;
  amount: number;
  price?: number;
  description: string;
}
export type productRes_t = {
  status: stockStatus_t;
  products: productInfo_t[];
}
export type stockForm_t = {
  productID: string;
  amount: number;
  price?: number;
}
export type stockOutForm_t = {
  date: Date;
  note?: string;
  products: stockForm_t[];
}
export type stockInForm_t = {
  date: Date;
  bill_Img?: File | null;
  products: stockForm_t[];
  who?: string;
}
export type errList_t = stockForm_t[];
export type AuditAction_t = "CREATE" | "UPDATE" | "DELETE";
export type AuditOperation_t =
  | "PRODUCT_CREATE"
  | "PRODUCT_UPDATE"
  | "PRODUCT_DELETE"
  | "STOCK_IN"
  | "STOCK_OUT";
export type AuditActor_t = {
  type: "user" | "service";
  name: string;
};
export type ProductSnapshot_t = {
  id: string;
  type: number;
  name: string;
  condition: number;
  img?: string;
  status?: number;
  price?: number;
  description?: string;
  amount?: number;
};
export type StockLogSnapshot_t = {
  amount: number;
  type: number;
  date: string;
  price?: number;
  bill?: string;
  note?: string;
  reference?: string;
};
export type LogAudit_t = {
  id: string;
  productID: string;
  action: AuditAction_t;
  operation: AuditOperation_t;
  actor: AuditActor_t;
  affectedCollections: string[];
  changedFields: string[];
  productBefore: ProductSnapshot_t | null;
  productAfter: ProductSnapshot_t | null;
  stockLog: StockLogSnapshot_t | null;
  occurredAt: string;
  expiresAt: string;
};
export type LogAuditQuery_t = {
  productID?: string;
  action?: AuditAction_t;
  operation?: AuditOperation_t;
  actorName?: string;
  actorType?: "user" | "service";
  from?: Date;
  to?: Date;
  minBeforeAmount?: number;
  maxBeforeAmount?: number;
  minAfterAmount?: number;
  maxAfterAmount?: number;
  page?: number;
  size?: number;
};
export type LogAuditQueryResult_t = {
  logs: LogAudit_t[];
  page: number;
  size: number;
  total: number;
  hasMore: boolean;
};
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
    data?: LogAudit_t;
    errCode?: errorCode_e;
    message?: string;
  }
  : T extends "queryLogAudit"
  ? {
    success: boolean;
    data?: LogAuditQueryResult_t;
    errCode?: errorCode_e;
    message?: string;
  }
  : {
    success: boolean;
    errCode?: errorCode_e;
    message?: string;
  }

