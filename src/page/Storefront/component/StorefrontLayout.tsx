import React from 'react';
import { Alert, AppBar, Box, Button, CircularProgress, Container, Stack, Toolbar, Typography } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import { useNavigate } from 'react-router-dom';
import { useStorefrontSession } from '../hooks/useStorefrontSession';

export function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const { customerToken, session, isLoading, error } = useStorefrontSession();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Box className="storefront-center">
        <CircularProgress />
        <Typography color="text.secondary">กำลังตรวจสอบลิงก์ลูกค้า</Typography>
      </Box>
    );
  }

  if (error || !session) {
    return (
      <Container maxWidth="sm" className="storefront-error">
        <Alert severity="error">{error || "ไม่พบข้อมูลลูกค้า"}</Alert>
      </Container>
    );
  }

  return (
    <Box className="storefront-shell">
      <AppBar position="sticky" elevation={0} color="inherit" className="storefront-appbar">
        <Toolbar className="storefront-toolbar">
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box className="storefront-logo">
              <LocalMallIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" className="storefront-brand">
                SmartBiz Storefront
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {session.customerName}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<Inventory2Icon />}
              onClick={() => navigate(`/storefront/${customerToken}`)}
              size="small"
            >
              สินค้า
            </Button>
            <Button
              startIcon={<HistoryIcon />}
              onClick={() => navigate(`/storefront/${customerToken}/orders`)}
              size="small"
            >
              ประวัติ
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      {children}
    </Box>
  );
}
