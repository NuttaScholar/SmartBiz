import React from "react";
import {
  Box,
  Button,
  Dialog,
  MenuItem,
  Paper,
  Slide,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import HeaderDialog from "./HeaderDialog";
import { EditUserFrom_t, RegistFrom_t, UserProfile_t } from "../../API/LoginService/type";
import { role_e } from "../../enum";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<unknown> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

interface myProps {
  open: boolean;
  title?: string;
  defaultValue?: UserProfile_t;
  onClose?: () => void;
  onAdd?: (data: RegistFrom_t) => void;
  onEdit?: (data: EditUserFrom_t) => void;
}

const DialogFormUser: React.FC<myProps> = (props) => {
  const isEditing = Boolean(props.defaultValue?._id);
  const heading = props.title || (isEditing ? "แก้ไขผู้ใช้งาน" : "เพิ่มผู้ใช้งาน");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "").trim();
    const name = String(data.get("name") || "").trim();
    const tel = String(data.get("tel") || "").trim();
    const role = Number(data.get("role")) as role_e;

    if (props.defaultValue?._id) {
      const form: EditUserFrom_t = {
        id: props.defaultValue._id,
        email,
        name,
        role,
        tel,
        enable: data.get("enable") === "1",
      };
      props.onEdit?.(form);
    } else {
      const form: RegistFrom_t = { email, name, role, tel };
      props.onAdd?.(form);
    }
  };

  return (
    <Dialog fullScreen open={props.open} onClose={props.onClose} slots={{ transition: Transition }}>
      <HeaderDialog label={heading} onClick={props.onClose} />
      <Box sx={{ minHeight: "100vh", bgcolor: "#f5f8fc", pt: { xs: 11, sm: 14 }, pb: 4, px: 2, boxSizing: "border-box" }}>
        <Paper elevation={0} sx={{ maxWidth: 480, mx: "auto", p: { xs: 3, sm: 4 }, border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
          <Stack spacing={1} sx={{ mb: 3 }}>
            <ManageAccountsOutlinedIcon color="primary" sx={{ fontSize: 36 }} />
            <Typography variant="h5" fontWeight={600}>{heading}</Typography>
            <Typography color="text.secondary">
              {isEditing ? "ปรับข้อมูลและสิทธิ์การใช้งานของบัญชีนี้" : "กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้ใหม่"}
            </Typography>
          </Stack>
          <Box component="form" key={props.defaultValue?._id || "new"} onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField required fullWidth label="อีเมล" name="email" type="email" autoComplete="email" defaultValue={props.defaultValue?.email || ""} />
              <TextField required fullWidth label="ชื่อผู้ใช้" name="name" autoComplete="name" defaultValue={props.defaultValue?.name || ""} />
              <TextField required fullWidth select label="สิทธิ์การใช้งาน" name="role" defaultValue={props.defaultValue?.role ?? ""}>
                <MenuItem value={role_e.admin}>Admin</MenuItem>
                <MenuItem value={role_e.cashier}>Cashier</MenuItem>
              </TextField>
              <TextField fullWidth label="เบอร์โทรศัพท์" name="tel" type="tel" autoComplete="tel" defaultValue={props.defaultValue?.tel || ""} />
              {isEditing && (
                <TextField required fullWidth select label="สถานะบัญชี" name="enable" defaultValue={props.defaultValue?.enable ? "1" : "0"}>
                  <MenuItem value="1">เปิดใช้งาน</MenuItem>
                  <MenuItem value="0">ปิดใช้งาน</MenuItem>
                </TextField>
              )}
              <Stack direction={{ xs: "column-reverse", sm: "row" }} spacing={1.5} justifyContent="flex-end">
                <Button variant="outlined" onClick={props.onClose}>ยกเลิก</Button>
                <Button variant="contained" type="submit">{isEditing ? "บันทึกการแก้ไข" : "เพิ่มผู้ใช้"}</Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Dialog>
  );
};

export default DialogFormUser;
