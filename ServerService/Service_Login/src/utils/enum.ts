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
