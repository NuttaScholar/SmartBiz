import { Chip, Divider, Stack, Typography } from "@mui/material";
import { LogAudit_t, ProductSnapshot_t } from "../../../API/StockService/type";
import {
  AuditChangedFields,
  AuditComparisonGrid,
  AuditDetailDialogFrame,
  AuditInfo,
  AuditInfoGrid,
  AuditPaper,
  AuditSnapshotCard,
} from "../../../component/Molecules/AuditDetail";
import { productType_e, stockStatus_e } from "../../../enum";
import { stockAuditOperationLabel } from "../lib/stockAuditLabels";

interface Props {
  log?: LogAudit_t;
  onClose: () => void;
}

export default function StockAuditDetailDialog({ log, onClose }: Props) {
  return (
    <AuditDetailDialogFrame
      open={Boolean(log)}
      onClose={onClose}
      title="รายละเอียดประวัติสต็อก"
      badge={
        log && (
          <Chip
            size="small"
            label={stockAuditOperationLabel(log.operation)}
            color="primary"
          />
        )
      }
    >
      {log && (
        <>
          <AuditInfoGrid>
            <Info
              label="วันและเวลา"
              value={formatDateTime(log.occurredAt)}
            />
            <Info
              label="ผู้ดำเนินการ"
              value={`${log.actor.name} (${log.actor.type})`}
            />
            <Info label="รหัสสินค้า" value={log.productID} />
            <Info label="การเปลี่ยนแปลง" value={actionLabel(log.action)} />
            <Info
              label="Collection ที่เกี่ยวข้อง"
              value={log.affectedCollections.join(", ")}
            />
            <Info label="หมดอายุ" value={formatDateTime(log.expiresAt)} />
          </AuditInfoGrid>
          <Divider />
          <AuditChangedFields
            fields={log.changedFields}
            emptyMessage="ไม่มี field ที่เปลี่ยนแปลง"
          />
          <AuditComparisonGrid>
            <Snapshot
              title="ข้อมูลก่อนทำรายการ"
              value={log.productBefore}
            />
            <Snapshot title="ข้อมูลหลังทำรายการ" value={log.productAfter} />
          </AuditComparisonGrid>
          {log.stockLog && (
            <AuditPaper sx={{ p: 1.5 }}>
              <Typography
                variant="subtitle1"
                fontWeight={500}
                sx={{ mb: 1 }}
              >
                ข้อมูลการเคลื่อนไหวสต็อก
              </Typography>
              <AuditInfoGrid>
                <Info
                  label="จำนวน"
                  value={formatNumber(log.stockLog.amount)}
                />
                <Info
                  label="วันที่"
                  value={formatDateTime(log.stockLog.date)}
                />
                <Info
                  label="เลขอ้างอิง"
                  value={log.stockLog.reference || "-"}
                  mono
                />
                <Info
                  label="ราคา"
                  value={formatOptionalMoney(log.stockLog.price)}
                />
                <Info label="หมายเหตุ" value={log.stockLog.note || "-"} />
                <Info label="หลักฐาน" value={log.stockLog.bill || "-"} />
              </AuditInfoGrid>
            </AuditPaper>
          )}
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
  value: ProductSnapshot_t | null;
}) {
  return (
    <AuditSnapshotCard
      title={title}
      hasData={Boolean(value)}
    >
      {value && (
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
    </AuditSnapshotCard>
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
  return <AuditInfo label={label} value={value} mono={mono} variant="body1" />;
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
