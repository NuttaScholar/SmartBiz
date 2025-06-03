/*********************************************** */
// Enum
/*********************************************** */
export enum transactionType_e {
  income,
  expenses,
  loan,
  lend,
}
export enum errorCode_e {
  UnknownError, // ไม่สามารถระบุสาเหตุได้
  InUseError, // ยังถูกใช้งานอยู่
  UnauthorizedError, // ผู้ใช้ยังไม่ได้ล็อกอิน
  ForbiddenError, // ผู้ใช้ไม่มีสิทธิ์
  TokenExpiredError, // Token หมดอายุ
  PermissionDeniedError, // ปฏิเสธสิทธิ์การเข้าถึง
  InvalidInputError, // อินพุตไม่ถูกต้อง
  NotFoundError, // ไม่พบข้อมูลที่ต้องการ
  AlreadyExistsError, // มีข้อมูลนี้อยู่แล้ว
  InvalidStateError, // สถานะไม่พร้อมสำหรับการดำเนินการ
  TimeoutError, // คำขอหมดเวลา
}
/*********************************************** */
// Account Service Type
/*********************************************** */
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
export type responstDB_t<
  T extends
  | "getTransaction"
  | "getContact"
  | "getWallet"
  | "post"
  | "put"
  | "del"
> = T extends "getTransaction"
  ? statement_t[]
  : T extends "getContact"
  ? ContactInfo_t[]
  : T extends "getWallet"
  ? {
    status: "success" | "error";
    amount?: number;
    errCode?: errorCode_e;
  }
  : T extends "post"
  ? {
    status: "success" | "error";
    errCode?: errorCode_e;
  }
  : T extends "put"
  ? {
    status: "success" | "error";
    updatedCount?: number;
    errCode?: errorCode_e;
  }
  : T extends "del"
  ? {
    status: "success" | "error";
    deletedCount?: number;
    errCode?: errorCode_e;
  }
  : never;
/*********************************************** */
// Login Service Type
/*********************************************** */
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
  role: "admin" | "cashier" | "laber";
}
export type EditUserFrom_t = {
  id: string;
  email?: string;
  name?: string;
  role?: "admin" | "cashier" | "laber";
}
export type UserProfile_t = {
  _id: string;
  email: string;
  name: string;
  role: string;
}
export type tokenPackage_t = {
  username: string;
  role: "admin" | "cashier" | "laber";
  type: "accessToken" | "refreshToken";
}

export type responstLogin_t<
  T extends
  | "post"
  | "postLogin"
  | "postToken"
  | "getUser"
  | "put"
  | "del"
> = T extends "post"
  ? {
    status: "success" | "error";
    errCode?: errorCode_e;
  }
  : T extends "postLogin"
  ? {
    status: "success" | "error";
    errCode?: errorCode_e;
    accessToken?: String;
    refreshToken?: String;
  }
  : T extends "postToken"
  ? {
    status: "success" | "error";
    errCode?: errorCode_e;
    accessToken?: String;
  }
  : T extends "getUser"
  ? {
    status: "success" | "error";
    result?: UserProfile_t[];
    errCode?: errorCode_e;
  }
  : T extends "put"
  ? {
    status: "success" | "error";
    errCode?: errorCode_e;
  }
  : T extends "del"
  ? {
    status: "success" | "error";
    errCode?: errorCode_e;
  }
  : never;
