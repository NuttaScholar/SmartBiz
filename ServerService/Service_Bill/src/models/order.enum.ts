export enum OrderStatus {
  PrepareProduct = 0,     // เตรียมสินค้า
  PrepareShipment = 1,    // เตรียมจัดส่ง
  Billing = 2,            // จัดการบิล
  WaitingPayment = 3,     // รอชำระเงิน
  Completed = 4           // เสร็จสิ้น
}
