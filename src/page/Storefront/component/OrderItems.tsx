import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { formatMoney } from "../lib/format";
import type { StorefrontOrder } from "../type";

//*************************************************
// Types
//*************************************************
type OrderItemsProps = Pick<StorefrontOrder, "items" | "totalAmount">;
type OrderItem = StorefrontOrder["items"][number];

//*************************************************
// Helper functions
//*************************************************
function formatOrderItemDescription(item: OrderItem) {
  return `${item.quantity} x ${formatMoney(item.priceAfterDiscount)} | ส่วนลด ${item.discountPercent}%`;
}

function getOrderItemTotal(item: OrderItem) {
  return item.quantity * item.priceAfterDiscount;
}

//*************************************************
// Main component
//*************************************************
export function OrderItems({ items, totalAmount }: OrderItemsProps) {
  return (
    <Paper variant="outlined" className="detail-panel">
      <Typography variant="h6">รายการสินค้า</Typography>
      <List disablePadding>
        {items.map((item) => (
          <ListItem key={item.productID} disableGutters className="detail-item">
            <img src={item.img} alt={item.name} className="detail-image" />
            <ListItemText
              primary={item.name}
              secondary={formatOrderItemDescription(item)}
            />
            <Typography fontWeight={600}>
              {formatMoney(getOrderItemTotal(item))}
            </Typography>
          </ListItem>
        ))}
      </List>

      <Divider />
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography color="text.secondary">ยอดรวมที่ต้องชำระ</Typography>
        <Typography variant="h5" color="primary.dark">
          {formatMoney(totalAmount)}
        </Typography>
      </Stack>
    </Paper>
  );
}
