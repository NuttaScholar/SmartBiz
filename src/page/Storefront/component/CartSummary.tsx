import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import type { CartItem, StorefrontProduct } from "../type";
import { formatMoney } from "../lib/format";

export function CartSummary({
  products,
  cart,
  onConfirm,
  onRemove,
  isSubmitting,
  onClose,
}: {
  products: StorefrontProduct[];
  cart: CartItem[];
  onConfirm: () => void;
  onRemove: (productID: string) => void;
  isSubmitting: boolean;
  onClose?: () => void;
}) {
  const cartRows = cart
    .map((item) => {
      const product = products.find((value) => value.id === item.productID);
      if (!product) return undefined;
      return {
        ...item,
        product,
        total: product.priceAfterDiscount * item.quantity,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const totalAmount = cartRows.reduce((sum, row) => sum + row.total, 0);

  return (
    <Box className="cart-summary">
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        {onClose && (
          <IconButton
            aria-label="Close cart summary"
            onClick={onClose}
            size="small"
          >
            <ArrowBackIosNewIcon />
          </IconButton>
        )}
        <Typography variant="h6">สรุปคำสั่งซื้อ</Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Badge badgeContent={cartRows.length} color="primary">
            <ShoppingCartIcon />
          </Badge>
        </Stack>
      </Stack>
      <Divider />
      {cartRows.length === 0 ? (
        <Typography color="text.secondary" className="empty-cart">
          ยังไม่มีสินค้าในคำสั่งซื้อ
        </Typography>
      ) : (
        <List disablePadding className="cart-list">
          {cartRows.map((row) => (
            <ListItem key={row.productID} disableGutters className="cart-row">
              <ListItemText
                primary={row.product.name}
                secondary={`${row.quantity} x ${formatMoney(row.product.priceAfterDiscount)}`}
              />
              <Stack alignItems="flex-end" spacing={0.5}>
                <Typography fontWeight={600}>
                  {formatMoney(row.total)}
                </Typography>
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => onRemove(row.productID)}
                >
                  ลบ
                </Button>
              </Stack>
            </ListItem>
          ))}
        </List>
      )}
      <Divider />
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography color="text.secondary">ยอดรวมที่ต้องชำระ</Typography>
        <Typography variant="h5" color="primary.dark">
          {formatMoney(totalAmount)}
        </Typography>
      </Stack>
      <Button
        variant="contained"
        size="large"
        startIcon={<CheckCircleIcon />}
        disabled={cartRows.length === 0 || isSubmitting}
        onClick={onConfirm}
      >
        {isSubmitting ? "กำลังยืนยัน" : "ยืนยันคำสั่งซื้อ"}
      </Button>
    </Box>
  );
}
