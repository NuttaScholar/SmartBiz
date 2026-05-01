export const success = (data: any, message = "OK") => {
  return {
    success: true,
    message,
    data,
  };
};

export const error = (message = "Something went wrong", status = 500) => {
  return {
    success: false,
    message,
    status,
  };
};

export const validationError = (errors: any) => {
  return {
    success: false,
    message: "Validation failed",
    errors,
  };
};
