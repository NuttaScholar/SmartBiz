import { useNavigate } from "react-router-dom";
import HeaderDialog from "../component/Molecules/HeaderDialog";
import { Box, Button, Switch, Typography } from "@mui/material";
import FieldText from "../component/Molecules/FieldText";
import { EditPassFrom_t } from "../API/LoginService/type";
import React from "react";
import { useAuth } from "../hooks/useAuth";
import * as User_f from "../API/LoginService/User";
import { ErrorString } from "../function/Enum";
import { errorCode_e } from "../enum";

type form_t = {
  oldPass: string;
  newPass: string;
  confirmPass: string;
};
const Page_SetPass: React.FC = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = React.useState(false);
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    let formJson = Object.fromEntries((formData as any).entries());
    const { confirmPass, newPass, oldPass } = formJson as form_t;
    if (newPass === confirmPass && auth?.token) {
      const data: EditPassFrom_t = { newPass: newPass, oldPass: oldPass };
      User_f.putPass(auth.token, data)
        .then((data) => {
          if (data.status === "success") {
            alert("แก้ไข Password สำเร็จ");
          } else {
            alert("แก้ไข Password ไม่สำเร็จ");
            console.log(ErrorString(data.errCode || errorCode_e.UnknownError));
          }
        })
        .catch((err) => {
          alert("แก้ไข Password ไม่สำเร็จ");
          console.log(err);
        });
    } else {
      alert("New Password ไม่ตรงกับ Confirm Password");
    }
    //props.onSubmit?.(form);
  };
  return (
    <>
      <HeaderDialog label="Set Password" onClick={() => navigate(-1)} />
      <Box
        component="form"
        id="formEditPass"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          alignItems: "center",
          my: "32px",
          gap: "16px",
        }}
      >
        <FieldText
          required
          type={showPass ? "text" : "password"}
          label="Old Password"
          name="oldPass"
        />
        <FieldText
          required
          type={showPass ? "text" : "password"}
          label="New Password"
          name="newPass"
        />
        <FieldText
          required
          type={showPass ? "text" : "password"}
          name="confirmPass"
          label="Confirm Password"
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
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "16px",
            my: "32px",
          }}
        >
          <Button
            variant="contained"
            type="submit"
            form="formEditPass"
            sx={{ width: "150px" }}
          >
            save
          </Button>
          <Button variant="outlined" sx={{ width: "150px" }}>
            cancle
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default Page_SetPass;
