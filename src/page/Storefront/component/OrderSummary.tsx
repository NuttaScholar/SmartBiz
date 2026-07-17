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
import { billStatus_e } from "../../../enum";
import { statusColor, statusLabel } from "../lib/format";
import type { StorefrontOrder } from "../type";

//*************************************************
// Types
//*************************************************
type OrderSummaryProps = Pick<StorefrontOrder, "id" | "date" | "status">;

//*************************************************
// Constants
//*************************************************
const ORDER_SUBMITTED_STATUS = -1;

const ORDER_STATUS_STEPS = [
  {
    value: ORDER_SUBMITTED_STATUS,
    label: "ส่งคำสั่งซื้อ",
    Icon: SendIcon,
  },
  {
    value: billStatus_e.WaitingPayment,
    label: "แจ้งชำระเงิน",
    Icon: PaymentsIcon,
  },
  {
    value: billStatus_e.Billing,
    label: "ยืนยันการชำระเงิน",
    Icon: VerifiedIcon,
  },
  {
    value: billStatus_e.PrepareProduct,
    label: "เตรียมสินค้า",
    Icon: Inventory2Icon,
  },
  {
    value: billStatus_e.PrepareShipment,
    label: "เตรียมจัดส่ง",
    Icon: LocalShippingIcon,
  },
  {
    value: billStatus_e.Completed,
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
export function OrderSummary({ id, date, status }: OrderSummaryProps) {
  return (
    <Paper variant="outlined" className="detail-panel">
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Typography variant="h4">{id}</Typography>
          <Typography color="text.secondary">
            {formatOrderDate(date)}
          </Typography>
        </Box>
        <Chip label={statusLabel(status)} color={statusColor(status)} />
      </Stack>

      <StatusStepper statusStepList={ORDER_STATUS_STEPS} status={status} />
    </Paper>
  );
}
