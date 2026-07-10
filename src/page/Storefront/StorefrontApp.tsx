import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import theme from '../../theme';
import { OrderDetailPage } from './page/OrderDetailPage';
import { OrderHistoryPage } from './page/OrderHistoryPage';
import { ProductPage } from './page/ProductPage';

export function StorefrontApp() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/storefront/demo-customer" replace />} />
          <Route path="/storefront/:customerToken" element={<ProductPage />} />
          <Route path="/storefront/:customerToken/orders" element={<OrderHistoryPage />} />
          <Route path="/storefront/:customerToken/orders/:orderID" element={<OrderDetailPage />} />
          <Route path="*" element={<Navigate to="/storefront/demo-customer" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

