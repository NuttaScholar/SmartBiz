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
  date: Date;
  topic: string;
  type: transactionType_e;
  money: number;
  who?: string;
  description?: string;
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
  | "none"
> = T extends "getTransaction"
  ? {
    status: "success" | "error";
    result?: statement_t[];
    errCode?: errorCode_e;
  }
  :T extends "getTransDetail"
  ? {
    status: "success" | "error";
    result?: TransitionForm_t;
    errCode?: errorCode_e;
  }
  : T extends "getContact"
  ? {
    status: "success" | "error";
    result?: ContactInfo_t[];
    errCode?: errorCode_e;
  }
  : T extends "getWallet"
  ? {
    status: "success" | "error";
    result?: number;
    errCode?: errorCode_e;
  }  
  : {
    status: "success" | "error";
    errCode?: errorCode_e;
  }
