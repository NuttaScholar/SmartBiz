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

export enum orderStatus_e {
  PrepareProduct = 0,
  PrepareShipment = 1,
  Billing = 2,
  WaitingPayment = 3,
  Completed = 4,
  Submitted = 5,
  PaymentNotified = 6,
  PaymentConfirmed = 7,
  Cancelled = 8,
}

export enum stockLogType_e {
  in,
  out,
}

export enum transactionType_e {
  income,
  expenses,
  loan,
  lend,
}

export enum role_e {
  admin,
  cashier,
  laber,
}

export enum errorCode_e {
  UnknownError,
  InUseError,
  UnauthorizedError,
  ForbiddenError,
  TokenExpiredError,
  PermissionDeniedError,
  InvalidInputError,
  NotFoundError,
  AlreadyExistsError,
  InvalidStateError,
  TimeoutError,
}
