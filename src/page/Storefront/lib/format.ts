import { orderStatus_e, productType_e, stockStatus_e } from '../../../enum';
import type { StorefrontProduct } from '../type';

export function formatMoney(value: number) {
  return value.toLocaleString("th-TH", {
    style: "currency",
    currency: "THB",
  });
}

export function statusLabel(status: orderStatus_e) {
  switch (status) {
    case orderStatus_e.Submitted:
      return "ส่งคำสั่งซื้อ";
    case orderStatus_e.PaymentNotified:
      return "แจ้งชำระเงิน";
    case orderStatus_e.PaymentConfirmed:
      return "ยืนยันการชำระเงิน";
    case orderStatus_e.PrepareProduct:
      return "เตรียมสินค้า";
    case orderStatus_e.PrepareShipment:
    case orderStatus_e.Billing:
      return "เตรียมจัดส่ง";    
    case orderStatus_e.Completed:
      return "จัดส่งสำเร็จ";
    case orderStatus_e.WaitingPayment:
      return "รอชำระเงิน";
    case orderStatus_e.Cancelled:
      return "ยกเลิกคำสั่งซื้อ";
    default:
      return "ไม่ทราบสถานะ";
  }
}

export function statusColor(status: orderStatus_e) {
  switch (status) {
    case orderStatus_e.Cancelled:
      return "default";    
    case orderStatus_e.Completed:
      return "success";
    case orderStatus_e.WaitingPayment:
      return "error";
    case orderStatus_e.PaymentNotified:
      return "error";
    case orderStatus_e.PaymentConfirmed:
      return "info";
    default:
      return "warning";
  }
}

export function stockLabel(product: StorefrontProduct) {
  if (product.type === productType_e.material && product.amount <= 0) return "วัตถุดิบหมด";
  if (product.status === stockStatus_e.preOrder || product.amount < 0) return `PreOrder ${Math.abs(product.amount)} ชิ้น`;
  if (product.status === stockStatus_e.stockOut || product.amount === 0) return "สินค้าหมด (สั่งล่วงหน้าได้)";
  if (product.status === stockStatus_e.stockLow) return `ใกล้หมด ${product.amount}`;
  return `คงคลัง ${product.amount}`;
}
