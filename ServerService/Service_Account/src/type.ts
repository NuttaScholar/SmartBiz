export enum transactionType_e {
  income,
  expenses,
  loan,
  lend,
}
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
}
export type responstDB_t<T extends "getTransaction" | "getContact" | "post" | "put" | "del" > =
  T extends "getTransaction" ? statement_t[] :
  T extends "getContact" ? {
    codeName: string;
    billName: string;
    description?: string;
    address?: string;
    vatID?: string;
    tel?: string;
    img?: string;
  } :
  T extends "post" ? {
    status: "success" | "error";
  } :
  T extends "put" ? {
    status: "success" | "error";
    updatedCount?: number;
  } :
  T extends "del" ? {
    status: "success" | "error";
    deletedCount?: number;
  }
  : never;