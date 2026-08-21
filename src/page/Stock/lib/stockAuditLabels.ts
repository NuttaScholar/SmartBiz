import { AuditOperation_t } from "../../../API/StockService/type";

export function stockAuditOperationLabel(operation: AuditOperation_t) {
  const labels: Record<AuditOperation_t, string> = {
    PRODUCT_CREATE: "สร้าง",
    PRODUCT_UPDATE: "แก้ไข",
    PRODUCT_DELETE: "ลบ",
    STOCK_IN: "รับเข้า",
    STOCK_OUT: "เบิกออก",
  };
  return labels[operation];
}
