import { Box, CircularProgress } from "@mui/material";

const PageLoader = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh", // เต็มความสูงของหน้าจอ
        width: "100%",
        backgroundColor: "#f5f5f5", // สีพื้นหลัง (สามารถเปลี่นได้ตามธีม)
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export default PageLoader;