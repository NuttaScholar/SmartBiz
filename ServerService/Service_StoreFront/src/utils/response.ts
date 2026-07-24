export interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  status: number;
}

export function success<T>(
  data: T,
  message = "OK",
): SuccessResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}

export function error(
  message = "Something went wrong",
  status = 500,
): ErrorResponse {
  return {
    success: false,
    message,
    status,
  };
}
