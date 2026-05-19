import { errorCode_e } from "./enum";
import { responst_t } from "./type";

type ResponseKind = "getTransaction" | "getTransDetail" | "getContact" | "getWallet" | "none";

export const success = <T extends ResponseKind>(
  result?: unknown,
): responst_t<T> => ({
  status: "success",
  ...(result !== undefined ? { result } : {}),
} as responst_t<T>);

export const error = <T extends ResponseKind>(
  errCode: errorCode_e,
): responst_t<T> => ({
  status: "error",
  errCode,
} as responst_t<T>);
