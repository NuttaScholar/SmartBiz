import { Box, Chip, Container, Paper, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { StorefrontLayout } from '../component/StorefrontLayout';
import { useStorefrontSession } from '../hooks/useStorefrontSession';
import { formatMoney, statusColor, statusLabel } from '../lib/format';
import { getStoredOrders } from '../lib/orderStorage';

export function OrderHistoryPage() {
  const { customerToken } = useStorefrontSession();
  const navigate = useNavigate();
  const orders = getStoredOrders(customerToken);

  return (
    <StorefrontLayout>
      <Container maxWidth="lg" className="storefront-content">
        <Box className="page-heading">
          <Box>
            <Typography variant="h4">ประวัติคำสั่งซื้อ</Typography>
            <Typography color="text.secondary">ดูรายการย้อนหลังและสถานะล่าสุดของคำสั่งซื้อ</Typography>
          </Box>
        </Box>
        <Stack spacing={1.5}>
          {orders.map((order) => (
            <Paper
              key={order.id}
              variant="outlined"
              className="order-row"
              onClick={() => navigate(`/storefront/${customerToken}/orders/${order.id}`)}
            >
              <Stack spacing={0.5}>
                <Typography variant="h6">{order.id}</Typography>
                <Typography color="text.secondary">
                  {new Date(order.date).toLocaleString("th-TH")} | {order.items.length} รายการ
                </Typography>
              </Stack>
              <Stack alignItems="flex-end" spacing={1}>
                <Chip label={statusLabel(order.status)} color={statusColor(order.status)} size="small" />
                <Typography variant="h6" color="primary.dark">
                  {formatMoney(order.totalAmount)}
                </Typography>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Container>
    </StorefrontLayout>
  );
}
