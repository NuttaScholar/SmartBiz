import { Alert, Box, Chip, CircularProgress, Container, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  cancelStorefrontOrder,
  getStorefrontErrorMessage,
  getStorefrontOrders,
  uploadStorefrontEvidence,
} from '../../../API/StorefrontService/Storefront';
import { OrderDetailDialog } from '../component/OrderDetailDialog';
import { StorefrontLayout } from '../component/StorefrontLayout';
import { useStorefrontSession } from '../hooks/useStorefrontSession';
import { formatMoney, statusColor, statusLabel } from '../lib/format';
import type { StorefrontOrder, StorefrontOrderEvidence } from '../type';

export function OrderHistoryPage() {
  const { customerToken, session } = useStorefrontSession();
  const [orders, setOrders] = useState<StorefrontOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<StorefrontOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) return;

    const controller = new AbortController();
    setIsLoading(true);
    setError("");
    getStorefrontOrders(customerToken, controller.signal)
      .then(setOrders)
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(getStorefrontErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [customerToken, session]);

  function updateOrder(nextOrder: StorefrontOrder) {
    setOrders((current) =>
      current.map((order) => order.id === nextOrder.id ? nextOrder : order),
    );
    setSelectedOrder(nextOrder);
  }

  async function uploadEvidence(
    orderID: string,
    evidence: StorefrontOrderEvidence,
  ) {
    updateOrder(
      await uploadStorefrontEvidence(customerToken, orderID, evidence),
    );
  }

  async function cancelOrder(orderID: string) {
    updateOrder(await cancelStorefrontOrder(customerToken, orderID));
  }

  return (
    <StorefrontLayout>
      <Container maxWidth="lg" className="storefront-content">
        <Box className="page-heading">
          <Box>
            <Typography variant="h4">ประวัติคำสั่งซื้อ</Typography>
            <Typography color="text.secondary">ดูรายการย้อนหลังและสถานะล่าสุดของคำสั่งซื้อ</Typography>
          </Box>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {isLoading && (
          <Box className="storefront-center">
            <CircularProgress />
            <Typography color="text.secondary">กำลังโหลดคำสั่งซื้อ</Typography>
          </Box>
        )}
        <Stack spacing={1.5}>
          {!isLoading && orders.map((order) => (
            <Paper
              key={order.id}
              variant="outlined"
              className="order-row"
              onClick={() => setSelectedOrder(order)}
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
          {!isLoading && !error && orders.length === 0 && (
            <Paper variant="outlined" className="empty-state">
              <Typography color="text.secondary">ยังไม่มีประวัติคำสั่งซื้อ</Typography>
            </Paper>
          )}
        </Stack>
      </Container>

      <OrderDetailDialog
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onEvidenceUpload={uploadEvidence}
        onCancelOrder={cancelOrder}
      />
    </StorefrontLayout>
  );
}
