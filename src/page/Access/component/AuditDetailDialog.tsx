import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  AuditAction_t,
  LogAudit_t,
  TransactionSnapshot_t,
} from "../../../API/AccountService/type";
import { transactionType_e } from "../../../enum";

const ACTION_COLORS: Record<AuditAction_t, "success" | "warning" | "error"> = {
  CREATE: "success",
  UPDATE: "warning",
  DELETE: "error",
};

interface AuditDetailDialogProps {
  log?: LogAudit_t;
  onClose: () => void;
}

export default function AuditDetailDialog({
  log,
  onClose,
}: AuditDetailDialogProps) {
  return (
    <Dialog open={Boolean(log)} onClose={onClose} fullWidth maxWidth="md">
      {log && (
        <>
          <DialogTitle sx={{ pr: 6 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                label={actionLabel(log.action)}
                color={ACTION_COLORS[log.action]}
              />
              <Typography variant="h6">รายละเอียดประวัติ</Typography>
            </Stack>
            <IconButton
              aria-label="ปิด"
              onClick={onClose}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: "grey.500",
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                  gap: 1,
                }}
              >
                <Info
                  label="วันและเวลา"
                  value={formatDateTime(log.occurredAt)}
                />
                <Info
                  label="ผู้ดำเนินการ"
                  value={`${log.actor.name} (${log.actor.type})`}
                />
                <Info label="Transaction ID" value={log.transactionId} mono />
                <Info label="หมดอายุ" value={formatDateTime(log.expiresAt)} />
              </Box>
              <Divider />
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                  gap: 1.5,
                }}
              >
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Typography color="text.secondary" variant="caption">
                    ยอด Wallet ก่อนทำรายการ
                  </Typography>
                  <Typography variant="h5">
                    {formatMoney(log.wallet.beforeAmount)}
                  </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Typography color="text.secondary" variant="caption">
                    ยอด Wallet หลังทำรายการ
                  </Typography>
                  <Typography variant="h5">
                    {formatMoney(log.wallet.afterAmount)}
                  </Typography>
                </Paper>
              </Box>
              <Stack direction="row" flexWrap="wrap" gap={0.5}>
                {log.changedFields.map((field) => (
                  <Chip key={field} size="small" label={field} />
                ))}
              </Stack>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                  gap: 1.5,
                }}
              >
                <Snapshot
                  title="ข้อมูลก่อนทำรายการ"
                  value={log.transactionBefore}
                />
                <Snapshot
                  title="ข้อมูลหลังทำรายการ"
                  value={log.transactionAfter}
                />
              </Box>
            </Stack>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}

function Snapshot({
  title,
  value,
}: {
  title: string;
  value: TransactionSnapshot_t | null;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 1 }}>
        {title}
      </Typography>
      {!value ? (
        <Typography color="text.secondary">ไม่มีข้อมูล</Typography>
      ) : (
        <Stack spacing={0.75}>
          <Info label="วันที่รายการ" value={formatDateTime(value.date)} />
          <Info label="หัวข้อ" value={value.topic} />
          <Info label="ประเภท" value={transactionTypeLabel(value.type)} />
          <Info label="จำนวนเงิน" value={formatMoney(value.money)} />
          <Info label="ผู้ติดต่อ" value={value.who || "-"} />
          <Info label="รายละเอียด" value={value.description || "-"} />
          <Info
            label="สถานะ"
            value={value.readonly ? "อ่านอย่างเดียว" : "แก้ไขได้"}
          />
        </Stack>
      )}
    </Paper>
  );
}

function Info({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          overflowWrap: "anywhere",
          fontFamily: mono ? "monospace" : undefined,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function actionLabel(action: AuditAction_t) {
  if (action === "CREATE") return "สร้าง";
  if (action === "UPDATE") return "แก้ไข";
  return "ลบ";
}

function transactionTypeLabel(type: number) {
  const labels = ["รายรับ", "รายจ่าย", "เงินกู้", "ให้ยืม"];
  return labels[type as transactionType_e] || String(type);
}

function formatDateTime(value: string | Date) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(value);
}
