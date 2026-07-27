import Login_f from "../../../API/LoginService/Login";
import { StorefrontApiError } from "../../../API/StorefrontService/Storefront";
import type { AuthContext_t } from "../../../context/AuthContextCore";
import { initPage } from "../../../lib/initPage";

export async function storefrontAdminWithRetry<T>(
  authContext: AuthContext_t,
  operation: (accessToken: string) => Promise<T>,
): Promise<T> {
  const auth = await initPage(authContext);

  try {
    return await operation(auth.token);
  } catch (error) {
    if (!(error instanceof StorefrontApiError) || error.status !== 401) {
      throw error;
    }

    const tokenResponse = await Login_f.getToken();
    if (!tokenResponse.success || !tokenResponse.data) {
      throw error;
    }

    authContext.setAuth(tokenResponse.data);
    return operation(tokenResponse.data.token);
  }
}
