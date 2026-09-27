import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentsIcon from "@mui/icons-material/Payments";
import SendIcon from "@mui/icons-material/Send";
import VerifiedIcon from "@mui/icons-material/Verified";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import {
  StatusStepper,
  type StatusStep,
} from "../../../component/Molecules/StatusStepper";
import { orderSource_e, orderStatus_e } from "../../../enum";
import { statusColor, statusLabel } from "../lib/format";
import type { StorefrontOrder } from "../type";

//*************************************************
// Types
//*************************************************
type OrderSummaryProps = Pick<StorefrontOrder, "id" | "date" | "status" | "source">;

//*************************************************
// Constants
//*************************************************
const ORDER_STATUS_STEPS = [
  {
    value: orderStatus_e.Submitted,
    label: "ส่งคำสั่งซื้อ",
    Icon: SendIcon,
  },
  {
    value: orderStatus_e.PaymentNotified,
    label: "แจ้งชำระเงิน",
    Icon: PaymentsIcon,
  },
  {
    value: orderStatus_e.PaymentConfirmed,
    label: "ยืนยันการชำระเงิน",
    Icon: VerifiedIcon,
  },
  {
    value: orderStatus_e.PrepareProduct,
    label: "เตรียมสินค้า",
    Icon: Inventory2Icon,
  },
  {
    value: orderStatus_e.PrepareShipment,
    label: "เตรียมจัดส่ง",
    Icon: LocalShippingIcon,
  },
  {
    value: orderStatus_e.Completed,
    label: "จัดส่งสำเร็จ",
    Icon: CheckCircleIcon,
  },
] as const satisfies readonly StatusStep[];

//*************************************************
// Helper functions
//*************************************************
function formatOrderDate(date: string) {
  return new Date(date).toLocaleString("th-TH");
}

//*************************************************
// Main component
//*************************************************
export function OrderSummary({ id, date, status, source }: OrderSummaryProps) {
  const isDirect = source === orderSource_e.Direct;

  return (
    <Paper variant="outlined" className="detail-panel">
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap">
            <Typography variant="h4">{id}</Typography>
            <Chip
              label={isDirect ? "สั่งโดยตรง" : "หน้าร้าน Online"}
              color={isDirect ? "default" : "primary"}
              size="small"
            />
          </Stack>
          <Typography color="text.secondary">
            {formatOrderDate(date)}
          </Typography>
        </Box>
        <Chip label={statusLabel(status)} color={statusColor(status)} />
      </Stack>

      {!isDirect && status !== orderStatus_e.Cancelled && (
        <StatusStepper statusStepList={ORDER_STATUS_STEPS} status={status} />
      )}
    </Paper>
  );
}
