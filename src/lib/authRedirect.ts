import { errorCode_e } from "../enum";
import { ErrorString } from "../function/Enum";

type NavigateTo = (to: string, options?: { replace?: boolean }) => void;

const authErrorCodes = new Set<errorCode_e>([
  errorCode_e.TokenExpiredError,
  errorCode_e.UnauthorizedError,
]);

export function isAuthErrorCode(errCode?: errorCode_e) {
  return errCode !== undefined && authErrorCodes.has(errCode);
}

export function isAuthError(err: unknown) {
  const message = err instanceof Error ? err.message : `${err}`;

  return (
    message.includes(ErrorString(errorCode_e.TokenExpiredError)) ||
    message.includes(ErrorString(errorCode_e.UnauthorizedError))
  );
}

export function redirectToLogin(navigate: NavigateTo) {
  navigate("/login", { replace: true });
}

export function redirectToLoginOnAuthError(
  navigate: NavigateTo,
  errCode?: errorCode_e,
) {
  if (!isAuthErrorCode(errCode)) return false;

  redirectToLogin(navigate);
  return true;
}

export function redirectToLoginOnThrownAuthError(
  navigate: NavigateTo,
  err: unknown,
) {
  if (!isAuthError(err)) return false;

  redirectToLogin(navigate);
  return true;
}
