export enum transactionType_e {
  income,
  expenses,
  loan,
  lend,
}
export enum productType_e {
  merchandise,
  material,
  another,
}
export enum stockStatus_e {
  normal,
  stockLow,
  stockOut,
}
export enum role_e{
  admin,
  cashier,
  laber,
}
export enum stockLogType_e {
  in,
  out,
}
export enum service_e{
  login,
  account,
  stock,
  bill
}
export enum billStatus_e{
  preparing = 0,
  shipping = 1,
  recording = 2,
  waitingPayment = 3,
  completed = 4,
  PrepareProduct = 0,
  PrepareShipment = 1,
  Billing = 2,
  WaitingPayment = 3,
  Completed = 4,
}
export enum orderStatus_e {
  Submitted = 0,
  PaymentNotified = 1,
  PaymentConfirmed = 2,
  PrepareProduct = 3,
  PrepareShipment = 4,
  Completed = 5,
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
