import { useLocation, useNavigate } from "react-router-dom";
import {
  SignInPage,
  type AuthProvider,
  type AuthResponse,
} from "@toolpad/core/SignInPage";
import { LoginForm_t } from "../API/LoginService/type";
import Login_f, * as login_F from "../API/LoginService/Login";
import { useAuth } from "../hooks/useAuth";
import React from "react";
import { role_e } from "../enum";

const providers = [{ id: "credentials", name: "Email and password" }];

function getDefaultPath(role: role_e) {
  if (role === role_e.admin) return "/access";
  if (role === role_e.cashier) return "/bill";
  return "/checkIn";
}

function getRedirectPath(state: unknown, role: role_e) {
  const from =
    state && typeof state === "object" && "from" in state
      ? (state as { from?: unknown }).from
      : undefined;

  if (typeof from === "string" && from && from !== "/" && from !== "/login") {
    return from;
  }

  return getDefaultPath(role);
}

const Page_Login: React.FC = () => {
  // Hook *********************
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuth();
  // Local Function ***********
  const signIn: (
    provider: AuthProvider,
    formData?: FormData
  ) => Promise<AuthResponse> | void = async (__, formData) => {
    const promise = new Promise<AuthResponse>((resolve) => {
      if (formData) {
        const data: LoginForm_t = {
          email: formData.get("email")?.toString() || "",
          pass: formData.get("password")?.toString() || "",
        };
        login_F
          .postLogin(data)
          .then((data) => {
            console.log("success", data);
            if (data.status === "success" && data.result) {
              setAuth(data.result);
              navigate(getRedirectPath(location.state, data.result.role), {
                replace: true,
              });
            }else {
                resolve({
                type: "CredentialsSignin",
                error: "Invalid credentials.",
              });
            }
          })
          .catch((err) => {
            console.log("error", err);
          });
      } else {
      }
    });

    return promise;
  };
  // Use Effect ***************
  React.useEffect(() => {
    Login_f.getToken().then((data) => {
      if (data.status === "success" && data.result) {
        setAuth(data.result);
        navigate(getRedirectPath(location.state, data.result.role), {
          replace: true,
        });
      }
    });
  }, []);
  // XML **********************
  return (
    <>
      <SignInPage
        signIn={signIn}
        providers={providers}
        slotProps={{
          emailField: { autoFocus: false },
          form: { noValidate: true },
        }}
      />
    </>
  );
};

export default Page_Login;
