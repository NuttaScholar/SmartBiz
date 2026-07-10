import { billStatus_e, stockStatus_e } from '../../../enum';
import type { StorefrontProduct } from '../type';

export function formatMoney(value: number) {
  return value.toLocaleString("th-TH", {
    style: "currency",
    currency: "THB",
  });
}

export function statusLabel(status: billStatus_e) {
  switch (status) {
    case billStatus_e.PrepareProduct:
      return "เตรียมสินค้า";
    case billStatus_e.PrepareShipment:
      return "เตรียมจัดส่ง";
    case billStatus_e.Billing:
      return "ออกบิล";
    case billStatus_e.WaitingPayment:
      return "รอชำระเงิน";
    case billStatus_e.Completed:
      return "สำเร็จ";
    default:
      return "ไม่ทราบสถานะ";
  }
}

export function statusColor(status: billStatus_e) {
  switch (status) {
    case billStatus_e.Completed:
      return "success";
    case billStatus_e.WaitingPayment:
      return "error";
    case billStatus_e.Billing:
      return "info";
    default:
      return "warning";
  }
}

export function stockLabel(product: StorefrontProduct) {
  if (product.status === stockStatus_e.stockOut || product.amount <= 0) return "สินค้าหมด";
  if (product.status === stockStatus_e.stockLow) return "ใกล้หมด";
  return `คงคลัง ${product.amount}`;
}
