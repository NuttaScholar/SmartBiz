import React from 'react';
import { Alert, Badge, Box, Button, CircularProgress, Container, Drawer, IconButton, InputAdornment, Paper, Stack, TextField, Typography, useMediaQuery } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';
import {
  cancelStorefrontOrder,
  createStorefrontOrder,
  getStorefrontErrorMessage,
  getStorefrontProducts,
  uploadStorefrontEvidence,
} from '../../../API/StorefrontService/Storefront';
import { orderStatus_e } from '../../../enum';
import theme from '../../../theme';
import { CartSummary } from '../component/CartSummary';
import { OrderDetailDialog } from '../component/OrderDetailDialog';
import { ProductCard } from '../component/ProductCard';
import { StorefrontLayout } from '../component/StorefrontLayout';
import { useStorefrontSession } from '../hooks/useStorefrontSession';
import type {
  CartItem,
  StorefrontOrder,
  StorefrontOrderEvidence,
  StorefrontProduct,
} from '../type';

export function ProductPage() {
  const { customerToken, session } = useStorefrontSession();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [query, setQuery] = React.useState("");
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = React.useState(true);
  const [requestError, setRequestError] = React.useState("");
  const [products, setProducts] = React.useState<StorefrontProduct[]>([]);
  const [createdOrder, setCreatedOrder] = React.useState<StorefrontOrder>();
  const [detailOrder, setDetailOrder] = React.useState<StorefrontOrder | null>(null);

  React.useEffect(() => {
    if (!session) return;

    const controller = new AbortController();
    setIsLoadingProducts(true);
    setRequestError("");
    getStorefrontProducts(customerToken, controller.signal)
      .then(setProducts)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setRequestError(getStorefrontErrorMessage(error));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingProducts(false);
        }
      });

    return () => controller.abort();
  }, [customerToken, session]);

  const filteredProducts = React.useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(text) || product.id.toLowerCase().includes(text),
    );
  }, [products, query]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function addToCart(product: StorefrontProduct) {
    setCart((current) => {
      const existing = current.find((item) => item.productID === product.id);
      if (!existing) return [...current, { productID: product.id, quantity: 1 }];
      return current.map((item) =>
        item.productID === product.id
          ? { ...item, quantity: Math.min(product.amount, item.quantity + 1) }
          : item,
      );
    });
  }

  function removeOne(productID: string) {
    setCart((current) =>
      current.flatMap((item) => {
        if (item.productID !== productID) return [item];
        if (item.quantity <= 1) return [];
        return [{ ...item, quantity: item.quantity - 1 }];
      }),
    );
  }

  function removeLine(productID: string) {
    setCart((current) => current.filter((item) => item.productID !== productID));
  }

  async function confirmOrder() {
    if (!session || cart.length === 0) return;
    setIsSubmitting(true);
    setRequestError("");

    try {
      const nextOrder = await createStorefrontOrder(customerToken, cart);
      setCreatedOrder(nextOrder);
      setDetailOrder(nextOrder);
      setCart([]);
      setIsDrawerOpen(false);
    } catch (error) {
      setRequestError(getStorefrontErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateVisibleOrder(nextOrder: StorefrontOrder) {
    setDetailOrder(nextOrder);
    setCreatedOrder((current) => current?.id === nextOrder.id ? nextOrder : current);
  }

  async function uploadEvidence(
    orderID: string,
    evidence: StorefrontOrderEvidence,
  ) {
    const nextOrder = await uploadStorefrontEvidence(
      customerToken,
      orderID,
      evidence,
    );
    updateVisibleOrder(nextOrder);
  }

  async function cancelOrder(orderID: string) {
    const nextOrder = await cancelStorefrontOrder(customerToken, orderID);
    updateVisibleOrder(nextOrder);
  }

  const cartPanel = (
    <CartSummary
      products={products}
      cart={cart}
      onConfirm={confirmOrder}
      onRemove={removeLine}
      isSubmitting={isSubmitting}
    />
  );
  const drawerCartPanel = (
    <CartSummary
      products={products}
      cart={cart}
      onConfirm={confirmOrder}
      onRemove={removeLine}
      isSubmitting={isSubmitting}
      onClose={() => setIsDrawerOpen(false)}
    />
  );

  return (
    <StorefrontLayout>
      <Container maxWidth="xl" className="storefront-content">
        <Box className="storefront-grid">
          <Box className="product-section">
            <Stack spacing={2.25}>
              <Box className="page-heading">
                <Box>
                  <Typography variant="h4">รายการสินค้า</Typography>
                  <Typography color="text.secondary">
                    เลือกสินค้า ตรวจสอบส่วนลด และยืนยันคำสั่งซื้อจากลิงก์ลูกค้า
                  </Typography>
                </Box>
                {isMobile && (
                  <IconButton
                    color="primary"
                    aria-label="เปิดสรุปคำสั่งซื้อ"
                    onClick={() => setIsDrawerOpen(true)}
                  >
                    <Badge badgeContent={cartCount} color="error">
                      <ShoppingCartIcon />
                    </Badge>
                  </IconButton>
                )}
              </Box>

              {createdOrder && (
                <Alert
                  severity={createdOrder.status === orderStatus_e.Cancelled ? "info" : "success"}
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => navigate(`/storefront/${customerToken}/orders`)}
                    >
                      ดูสถานะ
                    </Button>
                  }
                >
                  {createdOrder.status === orderStatus_e.Cancelled
                    ? `ยกเลิกคำสั่งซื้อ ${createdOrder.id} แล้ว`
                    : `ยืนยันคำสั่งซื้อ ${createdOrder.id} สำเร็จ`}
                </Alert>
              )}

              {requestError && <Alert severity="error">{requestError}</Alert>}

              <TextField
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ค้นหาชื่อสินค้า หรือรหัสสินค้า"
                fullWidth
                className="storefront-search"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {isLoadingProducts ? (
                <Box className="storefront-center">
                  <CircularProgress />
                  <Typography color="text.secondary">กำลังโหลดสินค้า</Typography>
                </Box>
              ) : (
                <Box className="product-grid">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      quantity={cart.find((item) => item.productID === product.id)?.quantity ?? 0}
                      onAdd={() => addToCart(product)}
                      onRemove={() => removeOne(product.id)}
                    />
                  ))}
                </Box>
              )}

              {!isLoadingProducts && filteredProducts.length === 0 && (
                <Paper variant="outlined" className="empty-state">
                  <Typography color="text.secondary">ไม่พบสินค้าที่ตรงกับคำค้นหา</Typography>
                </Paper>
              )}
            </Stack>
          </Box>

          {!isMobile && <Box className="summary-section">{cartPanel}</Box>}
        </Box>
      </Container>
      <Drawer anchor="bottom" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <Box className="mobile-cart">{drawerCartPanel}</Box>
      </Drawer>
      <OrderDetailDialog
        order={detailOrder}
        onClose={() => setDetailOrder(null)}
        onEvidenceUpload={uploadEvidence}
        onCancelOrder={cancelOrder}
      />
    </StorefrontLayout>
  );
}
