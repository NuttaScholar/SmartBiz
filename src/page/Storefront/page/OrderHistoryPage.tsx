import { Alert, Box, Button, CircularProgress, Container, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import {
  cancelStorefrontOrder,
  getStorefrontErrorMessage,
  getStorefrontOrders,
  uploadStorefrontEvidence,
} from '../../../API/StorefrontService/Storefront';
import { CardOrder } from '../component/CardOrder';
import { OrderDetailDialog } from '../component/OrderDetailDialog';
import { StorefrontLayout } from '../component/StorefrontLayout';
import { useStorefrontSession } from '../hooks/useStorefrontSession';
import type { StorefrontOrder, StorefrontOrderEvidence } from '../type';

export function OrderHistoryPage() {
  const { customerToken, session } = useStorefrontSession();
  const [orders, setOrders] = useState<StorefrontOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<StorefrontOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const moreRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!session) return;

    const controller = new AbortController();
    setOrders([]);
    setNextCursor(null);
    setIsLoadingMore(false);
    setIsLoading(true);
    setError("");
    getStorefrontOrders(customerToken, controller.signal)
      .then((page) => {
        if (controller.signal.aborted) return;
        setOrders(page.items);
        setNextCursor(page.hasMore ? page.nextCursor : null);
      })
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

    return () => {
      controller.abort();
      moreRequest.current?.abort();
      moreRequest.current = null;
    };
  }, [customerToken, session]);

  async function loadMore() {
    if (!nextCursor || moreRequest.current || isLoading) return;
    const controller = new AbortController();
    moreRequest.current = controller;
    setIsLoadingMore(true);
    setError("");
    try {
      const page = await getStorefrontOrders(customerToken, controller.signal, { cursor: nextCursor });
      if (controller.signal.aborted) return;
      setOrders((current) => {
        const ids = new Set(current.map((order) => order.id));
        return [...current, ...page.items.filter((order) => !ids.has(order.id))];
      });
      setNextCursor(page.hasMore ? page.nextCursor : null);
    } catch (requestError) {
      if (!controller.signal.aborted) setError(getStorefrontErrorMessage(requestError));
    } finally {
      if (!controller.signal.aborted) {
        moreRequest.current = null;
        setIsLoadingMore(false);
      }
    }
  }

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
            <CardOrder
              key={order.id}
              order={order}
              onClick={() => setSelectedOrder(order)}
            />
          ))}
          {!isLoading && !error && orders.length === 0 && (
            <Paper variant="outlined" className="empty-state">
              <Typography color="text.secondary">ยังไม่มีประวัติคำสั่งซื้อ</Typography>
            </Paper>
          )}
          {!isLoading && nextCursor && (
            <Button onClick={loadMore} disabled={isLoadingMore} variant="outlined">
              {isLoadingMore ? "กำลังโหลด" : "โหลดเพิ่มเติม"}
            </Button>
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
