import {
  Box,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import {
  AuditAction_t,
  LogAudit_t,
  TransactionSnapshot_t,
} from "../../../API/AccountService/type";
import {
  AuditChangedFields,
  AuditComparisonGrid,
  AuditDetailDialogFrame,
  AuditInfo,
  AuditInfoGrid,
  AuditPaper,
  AuditSnapshotCard,
} from "../../../component/Molecules/AuditDetail";
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
    <AuditDetailDialogFrame
      open={Boolean(log)}
      onClose={onClose}
      title="รายละเอียดประวัติ"
      badge={
        log && (
          <Chip
            size="small"
            label={actionLabel(log.action)}
            color={ACTION_COLORS[log.action]}
          />
        )
      }
    >
      {log && (
        <>
          <AuditInfoGrid>
            <AuditInfo
              label="วันและเวลา"
              value={formatDateTime(log.occurredAt)}
            />
            <AuditInfo
              label="ผู้ดำเนินการ"
              value={`${log.actor.name} (${log.actor.type})`}
            />
            <AuditInfo
              label="Transaction ID"
              value={log.transactionId}
            />
            <AuditInfo
              label="หมดอายุ"
              value={formatDateTime(log.expiresAt)}
            />
          </AuditInfoGrid>
          <Divider />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 1.5,
            }}
          >
            <AuditPaper sx={{ p: 1.5 }}>
              <Typography color="text.secondary" variant="caption">
                ยอด Wallet ก่อนทำรายการ
              </Typography>
              <Typography variant="h5">
                {formatMoney(log.wallet.beforeAmount)}
              </Typography>
            </AuditPaper>
            <AuditPaper sx={{ p: 1.5 }}>
              <Typography color="text.secondary" variant="caption">
                ยอด Wallet หลังทำรายการ
              </Typography>
              <Typography variant="h5">
                {formatMoney(log.wallet.afterAmount)}
              </Typography>
            </AuditPaper>
          </Box>
          <AuditChangedFields fields={log.changedFields} />
          <AuditComparisonGrid>
            <Snapshot
              title="ข้อมูลก่อนทำรายการ"
              value={log.transactionBefore}
            />
            <Snapshot
              title="ข้อมูลหลังทำรายการ"
              value={log.transactionAfter}
            />
          </AuditComparisonGrid>
        </>
      )}
    </AuditDetailDialogFrame>
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
    <AuditSnapshotCard title={title} hasData={Boolean(value)}>
      {value && (
        <Stack spacing={0.75}>
          <AuditInfo label="วันที่รายการ" value={formatDateTime(value.date)} />
          <AuditInfo label="หัวข้อ" value={value.topic} />
          <AuditInfo label="ประเภท" value={transactionTypeLabel(value.type)} />
          <AuditInfo label="จำนวนเงิน" value={formatMoney(value.money)} />
          <AuditInfo label="ผู้ติดต่อ" value={value.who || "-"} />
          <AuditInfo label="รายละเอียด" value={value.description || "-"} />
          <AuditInfo
            label="สถานะ"
            value={value.readonly ? "อ่านอย่างเดียว" : "แก้ไขได้"}
          />
        </Stack>
      )}
    </AuditSnapshotCard>
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
