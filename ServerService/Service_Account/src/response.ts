import { errorCode_e } from "./enum";
import { responst_t } from "./type";

type ResponseKind = "getTransaction" | "getTransDetail" | "getContact" | "getWallet" | "none";

export const success = <T extends ResponseKind>(
  data?: unknown,
): responst_t<T> => ({
  success: true,
  ...(data !== undefined ? { data } : {}),
} as responst_t<T>);

export const error = <T extends ResponseKind>(
  errCode: errorCode_e,
  message = "Something went wrong",
): responst_t<T> => ({
  success: false,
  errCode,
  message,
} as responst_t<T>);
