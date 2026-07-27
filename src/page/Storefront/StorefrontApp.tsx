import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {
  Box,
  CssBaseline,
  Paper,
  Stack,
  ThemeProvider,
  Typography,
} from '@mui/material';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useParams,
} from 'react-router-dom';
import theme from '../../theme';
import { StorefrontSessionProvider } from './hooks/StorefrontSessionProvider';
import { OrderHistoryPage } from './page/OrderHistoryPage';
import { ProductPage } from './page/ProductPage';

const INVALID_LINK_PATH = "/storefront/invalid-link";
const CUSTOMER_TOKEN_PATTERN = /^[a-f0-9]{64}$/;

function StorefrontRoute() {
  const { customerToken = "" } = useParams<{ customerToken: string }>();

  if (!CUSTOMER_TOKEN_PATTERN.test(customerToken)) {
    return <Navigate to={INVALID_LINK_PATH} replace />;
  }

  return (
    <StorefrontSessionProvider>
      <Outlet />
    </StorefrontSessionProvider>
  );
}

function InvalidLinkPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: 3,
        bgcolor: "background.default",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 520,
          p: { xs: 3, sm: 5 },
          textAlign: "center",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <WarningAmberRoundedIcon color="warning" sx={{ fontSize: 72 }} />
          <Typography component="h1" variant="h5" fontWeight={700}>
            ลิงก์ไม่ถูกต้อง
          </Typography>
          <Typography color="text.secondary">
            ไม่สามารถเปิดหน้าร้านค้าจากลิงก์นี้ได้ กรุณาติดต่อผู้ดูแลระบบ
            เพื่อขอลิงก์ที่ถูกต้อง
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}

export function StorefrontApp() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to={INVALID_LINK_PATH} replace />} />
          <Route path={INVALID_LINK_PATH} element={<InvalidLinkPage />} />
          <Route path="/storefront/:customerToken" element={<StorefrontRoute />}>
            <Route index element={<ProductPage />} />
            <Route path="orders" element={<OrderHistoryPage />} />
          </Route>
          <Route path="*" element={<Navigate to={INVALID_LINK_PATH} replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

