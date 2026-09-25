import { Chip, Paper, Stack, Typography } from "@mui/material";
import { formatMoney, statusColor, statusLabel } from "../lib/format";
import type { StorefrontOrder } from "../type";
import { orderSource_e } from "../../../enum";

type CardOrderProps = {
  order: StorefrontOrder;
  onClick: () => void;
};

export function CardOrder({ order, onClick }: CardOrderProps) {
  return (
    <Paper variant="outlined" className="order-row" onClick={onClick}>
      <Stack spacing={0.5}>
        <Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap">
          <Typography variant="h6">{order.id}</Typography>
          <Chip
            label={order.source === orderSource_e.Direct ? "สั่งโดยตรง" : "หน้าร้าน Online"}
            color={order.source === orderSource_e.Direct ? "default" : "primary"}
            size="small"
          />
        </Stack>
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
