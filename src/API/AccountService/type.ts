import { errorCode_e, role_e, transactionType_e } from "../../enum";

export type transactionDetail_t = {
  id?: string;
  topic: string;
  type: transactionType_e;
  money: number;
  who?: string;
  description?: string;
};
export type DailyTotal_t = {
  date: Date;
  transactions?: transactionDetail_t[] | null;
};
export type statement_t = {
  date: Date;
  detail: DailyTotal_t[];
};
export type TransitionForm_t = {
  id?: string;
  date?: Date;
  topic?: string;
  type?: transactionType_e;
  money?: number;
  who?: string;
  description?: string;
  bill?: string;
  readonly?: boolean;
  img?: File | null;
};
export type SearchTransForm_t = {
  to: Date;
  from: Date;
  topic?: string;
  type?: transactionType_e;
  who?: string;
};
export type AuditAction_t = "CREATE" | "UPDATE" | "DELETE";
export type AuditActor_t = {
  type: "user" | "service";
  name: string;
};
export type TransactionSnapshot_t = {
  date: string;
  topic: string;
  type: number;
  money: number;
  description?: string;
  who?: string;
  bill?: string;
  readonly: boolean;
};
export type LogAudit_t = {
  id: string;
  transactionId: string;
  action: AuditAction_t;
  actor: AuditActor_t;
  affectedCollections: string[];
  changedFields: string[];
  transactionBefore: TransactionSnapshot_t | null;
  transactionAfter: TransactionSnapshot_t | null;
  wallet: {
    name: string;
    beforeAmount: number;
    afterAmount: number;
  };
  occurredAt: string;
  expiresAt: string;
};
export type LogAuditQuery_t = {
  transactionId?: string;
  action?: AuditAction_t;
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
export type ContactForm_t = {
  codeName: string;
  billName: string;
  address: string;
  tel: string;
  taxID: string;
  description: string;
};
export type ContactInfo_t = {
  codeName: string;
  billName: string;
  description?: string;
  address?: string;
  taxID?: string;
  tel?: string;
};
export type tokenPackage_t = {
  username: string;
  role: role_e;
  type: "accessToken" | "refreshToken";
}
export type responst_t<
  T extends
  | "getTransaction"
  | "getTransDetail"
  | "getContact"
  | "getWallet"
  | "getLogAudit"
  | "queryLogAudit"
  | "none"
> = T extends "getTransaction"
  ? {
    success: boolean;
    data?: statement_t[];
    errCode?: errorCode_e;
    message?: string;
  }
  :T extends "getTransDetail"
  ? {
    success: boolean;
    data?: TransitionForm_t;
    errCode?: errorCode_e;
    message?: string;
  }
  : T extends "getContact"
  ? {
    success: boolean;
    data?: ContactInfo_t[] | {
      contacts: ContactInfo_t[];
      index: number;
      size: number;
      total: number;
      hasMore: boolean;
    };
    errCode?: errorCode_e;
    message?: string;
  }
  : T extends "getWallet"
  ? {
    success: boolean;
    data?: number;
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
