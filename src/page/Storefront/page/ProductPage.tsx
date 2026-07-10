import React from 'react';
import { Alert, Badge, Box, Button, Container, Drawer, IconButton, InputAdornment, Paper, Stack, TextField, Typography, useMediaQuery } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';
import { billStatus_e } from '../../../enum';
import theme from '../../../theme';
import { CartSummary } from '../component/CartSummary';
import { ProductCard } from '../component/ProductCard';
import { StorefrontLayout } from '../component/StorefrontLayout';
import { mockProducts } from '../data/mockData';
import { useStorefrontSession } from '../hooks/useStorefrontSession';
import { getStoredOrders, saveStoredOrders } from '../lib/orderStorage';
import type { CartItem, StorefrontOrder, StorefrontProduct } from '../type';

export function ProductPage() {
  const { customerToken, session } = useStorefrontSession();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [query, setQuery] = React.useState("");
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [createdOrder, setCreatedOrder] = React.useState<StorefrontOrder>();

  const products = mockProducts;
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

  function confirmOrder() {
    if (!session || cart.length === 0) return;
    setIsSubmitting(true);

    window.setTimeout(() => {
      const orderItems = cart.flatMap((item) => {
        const product = products.find((value) => value.id === item.productID);
        if (!product) return [];
        return [
          {
            productID: product.id,
            name: product.name,
            quantity: item.quantity,
            priceOriginal: product.price,
            discountPercent: product.percentDiscount,
            priceAfterDiscount: product.priceAfterDiscount,
            img: product.img,
          },
        ];
      });
      const nextOrder: StorefrontOrder = {
        id: `SO-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${String(Date.now()).slice(-4)}`,
        customerID: session.customerID,
        date: new Date().toISOString(),
        status: billStatus_e.PrepareProduct,
        totalAmount: orderItems.reduce((sum, item) => sum + item.priceAfterDiscount * item.quantity, 0),
        items: orderItems,
      };
      const nextOrders = [nextOrder, ...getStoredOrders(customerToken)];
      saveStoredOrders(customerToken, nextOrders);
      setCreatedOrder(nextOrder);
      setCart([]);
      setIsSubmitting(false);
      setIsDrawerOpen(false);
    }, 450);
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
                  severity="success"
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => navigate(`/storefront/${customerToken}/orders/${createdOrder.id}`)}
                    >
                      ดูสถานะ
                    </Button>
                  }
                >
                  ยืนยันคำสั่งซื้อ {createdOrder.id} สำเร็จ
                </Alert>
              )}

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

              {filteredProducts.length === 0 && (
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
        <Box className="mobile-cart">{cartPanel}</Box>
      </Drawer>
    </StorefrontLayout>
  );
}
