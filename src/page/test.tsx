import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Divider,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import ReceiptPreview, {
  ReceiptData,
} from "../component/Organisms/ReceiptPreview";
import { useEffect } from "react";

const mockData: ReceiptData = {
  customerName: "SmartBiz Shop",
  customerAddress: "Bangkok, Thailand",
  taxId: "123456789",
  orderNumber: "123456",
  date: "2026-04-24",
  items: [
    { name: "สินค้า A", qty: 2, price: 150 },
    { name: "สินค้า B", qty: 1, price: 299 },
    { name: "สินค้า C", qty: 3, price: 99 },
  ],
};

export default function PageDemo() {
  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    document.body.style.backgroundColor = "#f0f0f0";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* Header Bar */}
      <AppBar
        position="sticky"
        sx={{
          bgcolor: "#ffffff",
          color: "#1a1a1",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderBottom: "1px solid #e0e0e0",
          "@media print": {
            display: "none",
          },
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              minHeight: { xs: 56, sm: 64 },
            }}
          >
            {/* Left: Logo & Title */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "#4f46e5",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: "#fff", fontWeight: 700, fontSize: 18 }}
                >
                  R
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#1a1a1a",
                    lineHeight: 1.2,
                  }}
                >
                  Receipt Preview
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#6b7280", display: "block" }}
                >
                  ใบเสร็จรรับเงิน
                </Typography>
              </Box>
            </Box>

            {/* Right: Actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#6b7280",
                  display: { xs: "none", sm: "block" },
                }}
              >
                เลขที่: <strong>{mockData.orderNumber}</strong>
              </Typography>
              <Divider
                orientation="vertical"
                sx={{
                  height: 24,
                  bgcolor: "#e0e0e0",
                  display: { xs: "none", sm: "block" },
                }}
              />
              <Tooltip title="พิมพ์ใบเสร็จ">
                <Button
                  variant="contained"
                  onClick={handlePrint}
                  className="no-print"
                  startIcon={<PrintIcon />}
                  sx={{
                    bgcolor: "#4f46e5",
                    color: "#fff",
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: "8px",
                    textTransform: "none",
                    fontSize: "0.9rem",
                    "&:hover": {
                      bgcolor: "#4338ca",
                      boxShadow: "0 4px 12px rgba(79,70,229,0.4)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  พิมพ์ใบเสร็จ
                </Button>
              </Tooltip>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content */}
      <Box
        sx={{
          py: { xs: 3, sm: 4 },
          px: { xs: 1, sm: 2 },
          maxWidth: 900,
          mx: "auto",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            bgcolor: "#ffffff",
            borderRadius: 2,
            border: "1px solid #e5e7eb",
            overflow: "hidden",
            // 👇 ซ่อน border และ shadow เมื่อพิมพ์
            "@media print": {
              border: "none",
              boxShadow: "none",
            },
          }}
        >
          <ReceiptPreview data={mockData} />
        </Paper>
      </Box>
    </Box>
  );
}