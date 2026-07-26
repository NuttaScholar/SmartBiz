import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import theme from '../../theme';
import { StorefrontSessionProvider } from './hooks/StorefrontSessionProvider';
import { OrderHistoryPage } from './page/OrderHistoryPage';
import { ProductPage } from './page/ProductPage';

function StorefrontRoute() {
  return (
    <StorefrontSessionProvider>
      <Outlet />
    </StorefrontSessionProvider>
  );
}

export function StorefrontApp() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/storefront/demo-customer" replace />} />
          <Route path="/storefront/:customerToken" element={<StorefrontRoute />}>
            <Route index element={<ProductPage />} />
            <Route path="orders" element={<OrderHistoryPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/storefront/demo-customer" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

