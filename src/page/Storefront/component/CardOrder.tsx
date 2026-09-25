import { Chip, Paper, Stack, Typography } from "@mui/material";
import { formatMoney, statusColor, statusLabel } from "../lib/format";
import type { StorefrontOrder } from "../type";

type CardOrderProps = {
  order: StorefrontOrder;
  onClick: () => void;
};

export function CardOrder({ order, onClick }: CardOrderProps) {
  return (
    <Paper variant="outlined" className="order-row" onClick={onClick}>
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
  );
}
