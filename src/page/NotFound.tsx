import AppBar_c from "../component/Organisms/AppBar_c";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { role_e } from "../enum";

const Page_NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const homePath =
    auth?.role === role_e.admin
      ? "/access"
      : auth?.role === role_e.cashier
        ? "/bill"
        : auth?.role === role_e.laber
          ? "/setpass"
          : "/login";

  return (
    <Box
      sx={{
        width: "100%",
        boxSizing: "border-box",
        minHeight: "calc(100vh - 50px)",
        display: "grid",
        placeItems: "center",
        p: { xs: 2, sm: 4 },
        bgcolor: "secondary.light",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 560,
          p: { xs: 3, sm: 5 },
          borderRadius: 4,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 88,
            height: 88,
            mx: "auto",
            mb: 2,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            color: "primary.main",
            bgcolor: "secondary.main",
          }}
        >
          <SearchOffRoundedIcon sx={{ fontSize: 46 }} />
        </Box>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: 72, sm: 96 },
            fontWeight: 700,
            lineHeight: 1,
            color: "primary.main",
          }}
        >
          404
        </Typography>
        <Typography component="h1" variant="h5" sx={{ mt: 2, fontWeight: 600 }}>
          ไม่พบหน้าที่ต้องการ
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
          หน้านี้อาจถูกย้ายหรือลบไปแล้ว กรุณาตรวจสอบที่อยู่หน้าเว็บอีกครั้ง
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          justifyContent="center"
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<HomeRoundedIcon />}
            onClick={() => navigate(homePath)}
          >
            ไปหน้าเริ่มต้น
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate(-1)}
          >
            ย้อนกลับ
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Page_NotFound;
