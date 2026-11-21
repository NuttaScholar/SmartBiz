import React from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, FormControlLabel, Paper, Stack, Switch, TextField, Typography } from "@mui/material";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import HeaderDialog from "../component/Molecules/HeaderDialog";
import { EditPassFrom_t } from "../API/LoginService/type";
import { useAuth } from "../hooks/useAuth";
import * as User_f from "../API/LoginService/User";
import { redirectToLogin, redirectToLoginOnAuthError, redirectToLoginOnThrownAuthError } from "../lib/authRedirect";

const Page_SetPass: React.FC = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ severity: "success" | "error"; text: string }>();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const oldPass = String(data.get("oldPass") || "");
    const newPass = String(data.get("newPass") || "");
    const confirmPass = String(data.get("confirmPass") || "");
    setMessage(undefined);
    if (!auth?.token) {
      redirectToLogin(navigate);
      return;
    }
    if (newPass !== confirmPass) {
      setMessage({ severity: "error", text: "รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน" });
      return;
    }
    setSaving(true);
    try {
      const payload: EditPassFrom_t = { oldPass, newPass };
      const result = await User_f.putPass(auth.token, payload);
      if (result.success) {
        form.reset();
        setMessage({ severity: "success", text: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว" });
      } else if (!redirectToLoginOnAuthError(navigate, result.errCode)) {
        setMessage({ severity: "error", text: "เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาตรวจสอบรหัสผ่านเดิม" });
      }
    } catch (err) {
      if (!redirectToLoginOnThrownAuthError(navigate, err)) {
        setMessage({ severity: "error", text: "เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองอีกครั้ง" });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <HeaderDialog label="เปลี่ยนรหัสผ่าน" onClick={() => navigate(-1)} />
      <Box sx={{ minHeight: "100vh", bgcolor: "#f5f8fc", pt: { xs: 11, sm: 14 }, pb: 4, px: 2, boxSizing: "border-box" }}>
        <Paper elevation={0} sx={{ maxWidth: 480, mx: "auto", p: { xs: 3, sm: 4 }, border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
          <Stack spacing={1} sx={{ mb: 3 }}>
            <LockResetOutlinedIcon color="primary" sx={{ fontSize: 36 }} />
            <Typography variant="h5" fontWeight={600}>เปลี่ยนรหัสผ่าน</Typography>
            <Typography color="text.secondary">กรอกรหัสผ่านเดิมและตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ</Typography>
          </Stack>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField required fullWidth label="รหัสผ่านเดิม" name="oldPass" type={showPass ? "text" : "password"} autoComplete="current-password" />
              <TextField required fullWidth label="รหัสผ่านใหม่" name="newPass" type={showPass ? "text" : "password"} autoComplete="new-password" />
              <TextField required fullWidth label="ยืนยันรหัสผ่านใหม่" name="confirmPass" type={showPass ? "text" : "password"} autoComplete="new-password" />
              <FormControlLabel control={<Switch checked={showPass} onChange={(_, checked) => setShowPass(checked)} />} label="แสดงรหัสผ่าน" />
              {message && <Alert severity={message.severity}>{message.text}</Alert>}
              <Stack direction={{ xs: "column-reverse", sm: "row" }} spacing={1.5} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => navigate(-1)} disabled={saving}>ยกเลิก</Button>
                <Button variant="contained" type="submit" disabled={saving}>{saving ? "กำลังบันทึก..." : "บันทึกรหัสผ่าน"}</Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default Page_SetPass;
