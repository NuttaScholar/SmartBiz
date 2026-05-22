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
