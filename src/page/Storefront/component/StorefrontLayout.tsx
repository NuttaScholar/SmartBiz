import React from 'react';
import { Alert, BottomNavigation, BottomNavigationAction, Box, CircularProgress, Container, Paper, Typography } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStorefrontSession } from '../hooks/useStorefrontSession';

export function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const { customerToken, session, isLoading, error } = useStorefrontSession();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPage = location.pathname.endsWith('/orders') ? 'orders' : 'products';

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
      {children}
      <Paper className="storefront-bottom-navigation" elevation={8}>
        <BottomNavigation
          showLabels
          value={currentPage}
          onChange={(_, value: 'products' | 'orders') => {
            navigate(value === 'orders'
              ? `/storefront/${customerToken}/orders`
              : `/storefront/${customerToken}`);
          }}
        >
          <BottomNavigationAction
            label="สินค้า"
            value="products"
            icon={<Inventory2Icon />}
          />
          <BottomNavigationAction
            label="ประวัติ"
            value="orders"
            icon={<HistoryIcon />}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
