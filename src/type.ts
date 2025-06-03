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
export type LoginForm_t = {
  email: string;
  pass: string;
}

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

export type jwtFullToken_t = {
  status: "success" | "error";
  errCode ?: errorCode_e;
  role?: String;
  accessToken?: String;
  refreshToken?: String;
}
export type jwtRefreshToken_t = {
  status: "success" | "error";
  errCode ?: errorCode_e;
  role?: String;
  accessToken?: String;
}
export type responstLogin_t<
  T extends
  | "postUser"
  | "postLogin"
  | "postToken"
  | "put"
  | "del"
> = T extends "postUser"
  ? {
    status: "success" | "error";
    errCode?: errorCode_e;
  }
  : T extends "postLogin" 
  ? jwtFullToken_t
  : T extends "postToken" 
  ? jwtRefreshToken_t
  : never;
