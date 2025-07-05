import { useNavigate } from "react-router-dom";
import {
  SignInPage,
  type AuthProvider,
  type AuthResponse,
} from "@toolpad/core/SignInPage";
import { LoginForm_t } from "../API/LoginService/type";
import * as login_F from "../API/LoginService/Login";
import { useContext } from "react";
import { AuthContext } from "../context";
import { useAuth } from "../hooks/useAuth";

const providers = [{ id: "credentials", name: "Email and password" }];

const Page_Login: React.FC = () => {
  const navigate = useNavigate();
  const {setAuth} = useAuth();

  const signIn: (
    provider: AuthProvider,
    formData?: FormData
  ) => Promise<AuthResponse> | void = async (provider, formData) => {
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
            if (data.status === "success"&&data.result) {              
              setAuth(data.result)
              navigate("/access");              
            }else{
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
