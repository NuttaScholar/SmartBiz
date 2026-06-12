import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { LoginForm_t } from "../API/LoginService/type";
import Login_f, * as login_F from "../API/LoginService/Login";
import { useAuth } from "../hooks/useAuth";
import React from "react";
import { role_e } from "../enum";

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
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [showPass, setShowPass] = React.useState(false);
  // Local Function ***********
  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const data: LoginForm_t = {
      email: formData.get("email")?.toString() || "",
      pass: formData.get("password")?.toString() || "",
    };

    try {
      const res = await login_F.postLogin(data);
      if (res.success && res.data) {
        setAuth(res.data);
        navigate(getRedirectPath(location.state, res.data.role), {
          replace: true,
        });
        return;
      }
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } catch (err) {
      console.log("error", err);
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };
  // Use Effect ***************
  React.useEffect(() => {
    Login_f.getToken().then((data) => {
      if (data.success && data.data) {
        setAuth(data.data);
        navigate(getRedirectPath(location.state, data.data.role), {
          replace: true,
        });
      }
    });
  }, [location.state, navigate, setAuth]);
  // XML **********************
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: 2,
      }}
    >
      <Paper
        component="form"
        noValidate
        onSubmit={signIn}
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              SmartBiz
            </Typography>
            <Typography color="text.secondary">เข้าสู่ระบบเพื่อใช้งาน</Typography>
          </Box>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <TextField
            name="email"
            label="อีเมล"
            type="email"
            autoComplete="email"
            fullWidth
            required
          />
          <TextField
            name="password"
            label="รหัสผ่าน"
            type={showPass ? "text" : "password"}
            autoComplete="current-password"
            fullWidth
            required
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Typography>Show Password</Typography>
            <Switch
              value={showPass}
              onChange={(__, check) => {
                setShowPass(check);
              }}
            />
          </Box>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            fullWidth
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Page_Login;
