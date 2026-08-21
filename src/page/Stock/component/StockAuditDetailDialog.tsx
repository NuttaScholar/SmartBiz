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
  LogAudit_t,
  ProductSnapshot_t,
} from "../../../API/StockService/type";
import { productType_e, stockStatus_e } from "../../../enum";
import { stockAuditOperationLabel } from "../lib/stockAuditLabels";

interface Props {
  log?: LogAudit_t;
  onClose: () => void;
}

export default function StockAuditDetailDialog({ log, onClose }: Props) {
  return (
    <Dialog open={Boolean(log)} onClose={onClose} fullWidth maxWidth="md">
      {log && (
        <>
          <DialogTitle sx={{ pr: 6 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip size="small" label={stockAuditOperationLabel(log.operation)} color="primary" />
              <Typography variant="h6">รายละเอียดประวัติสต็อก</Typography>
            </Stack>
            <IconButton
              aria-label="ปิด"
              onClick={onClose}
              sx={{ position: "absolute", right: 8, top: 8, color: "grey.500" }}
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
                <Info label="วันและเวลา" value={formatDateTime(log.occurredAt)} />
                <Info label="ผู้ดำเนินการ" value={`${log.actor.name} (${log.actor.type})`} />
                <Info label="รหัสสินค้า" value={log.productID} mono />
                <Info label="การเปลี่ยนแปลง" value={actionLabel(log.action)} />
                <Info label="Collection ที่เกี่ยวข้อง" value={log.affectedCollections.join(", ")} />
                <Info label="หมดอายุ" value={formatDateTime(log.expiresAt)} />
              </Box>
              <Divider />
              <Stack direction="row" flexWrap="wrap" gap={0.5}>
                {log.changedFields.length ? log.changedFields.map((field) => (
                  <Chip key={field} size="small" label={field} />
                )) : <Typography color="text.secondary">ไม่มี field ที่เปลี่ยนแปลง</Typography>}
              </Stack>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                  gap: 1.5,
                }}
              >
                <Snapshot title="ข้อมูลก่อนทำรายการ" value={log.productBefore} />
                <Snapshot title="ข้อมูลหลังทำรายการ" value={log.productAfter} />
              </Box>
              {log.stockLog && (
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 1 }}>
                    ข้อมูลการเคลื่อนไหวสต็อก
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                      gap: 1,
                    }}
                  >
                    <Info label="จำนวน" value={formatNumber(log.stockLog.amount)} />
                    <Info label="วันที่" value={formatDateTime(log.stockLog.date)} />
                    <Info label="เลขอ้างอิง" value={log.stockLog.reference || "-"} mono />
                    <Info label="ราคา" value={formatOptionalMoney(log.stockLog.price)} />
                    <Info label="หมายเหตุ" value={log.stockLog.note || "-"} />
                    <Info label="หลักฐาน" value={log.stockLog.bill || "-"} />
                  </Box>
                </Paper>
              )}
            </Stack>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}

function Snapshot({ title, value }: { title: string; value: ProductSnapshot_t | null }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 1 }}>{title}</Typography>
      {!value ? (
        <Typography color="text.secondary">ไม่มีข้อมูล</Typography>
      ) : (
        <Stack spacing={0.75}>
          <Info label="รหัสสินค้า" value={value.id} mono />
          <Info label="ชื่อสินค้า" value={value.name} />
          <Info label="ประเภท" value={productTypeLabel(value.type)} />
          <Info label="จำนวน" value={formatOptionalNumber(value.amount)} />
          <Info label="จุดแจ้งเตือน" value={formatNumber(value.condition)} />
          <Info label="สถานะ" value={stockStatusLabel(value.status)} />
          <Info label="ราคา" value={formatOptionalMoney(value.price)} />
          <Info label="รายละเอียด" value={value.description || "-"} />
          <Info label="รูปภาพ" value={value.img || "-"} />
        </Stack>
      )}
    </Paper>
  );
}

function Info({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography
        variant="body2"
        sx={{ overflowWrap: "anywhere", fontFamily: mono ? "monospace" : undefined }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function actionLabel(action: LogAudit_t["action"]) {
  return action === "CREATE" ? "สร้าง" : action === "UPDATE" ? "แก้ไข" : "ลบ";
}

function productTypeLabel(type: number) {
  const labels: Record<number, string> = {
    [productType_e.merchandise]: "สินค้า",
    [productType_e.material]: "วัตถุดิบ",
    [productType_e.another]: "อื่น ๆ",
  };
  return labels[type] || String(type);
}

function stockStatusLabel(status?: number) {
  if (status === undefined) return "-";
  const labels: Record<number, string> = {
    [stockStatus_e.normal]: "ปกติ",
    [stockStatus_e.stockLow]: "ใกล้หมด",
    [stockStatus_e.stockOut]: "หมด",
  };
  return labels[status] || String(status);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("th-TH").format(value);
}

function formatOptionalNumber(value?: number) {
  return value === undefined ? "-" : formatNumber(value);
}

function formatOptionalMoney(value?: number) {
  return value === undefined
    ? "-"
    : new Intl.NumberFormat("th-TH", {
        style: "currency",
        currency: "THB",
        minimumFractionDigits: 2,
      }).format(value);
}
