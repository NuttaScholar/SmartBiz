import { useNavigate } from "react-router-dom";
import AppBar_c, { pageApp_e } from "../component/Organisms/AppBar_c";
import {
  SignInPage,
  type AuthProvider,
  type AuthResponse,
} from "@toolpad/core/SignInPage";

const providers = [
  { id: "credentials", name: "Email and password" },
];

const Page_Login: React.FC = () => {
  const navigate = useNavigate();

  const signIn: (
    provider: AuthProvider,
    formData?: FormData
  ) => Promise<AuthResponse> | void = async (provider, formData) => {
    const promise = new Promise<AuthResponse>((resolve) => {
      console.log("provider", provider);
      console.log(
        `formData: ${formData?.get("email")}, ${formData?.get("password")}`
      );

      navigate("/access")
      resolve({ type: "CredentialsSignin", error: "Invalid credentials." });
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
