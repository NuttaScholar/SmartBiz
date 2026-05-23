import { Document } from "mongoose";
import { OrderStatus } from "../utils/enum";

export interface OrderItem {
    productID: string;

    // จำนวนสินค้า
    quantity: number;

    // ราคาต่อหน่วยก่อนลด
    priceOriginal: number;

    // ราคาต่อหน่วยหลังลด
    priceAfterDiscount: number;

    // ส่วนลดเป็นเปอร์เซ็นต์ (0–100)
    discountPercent?: number;
}

export interface OrderDocument extends Document {
    orderID: string;
    customerID: string;         // CodeName ของ Contact
    status: OrderStatus;        // ← บังคับเป็น enum เท่านั้น
    items: OrderItem[];
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
}

