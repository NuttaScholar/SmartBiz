export enum transactionType_e {
  income,
  expenses,
  loan,
  lend,
}
export enum role_e{
  admin,
  cashier,
  laber,
}
export enum service_e{
  login,
  account,
  stock
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