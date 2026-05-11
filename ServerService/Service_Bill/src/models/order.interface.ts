import { Document } from "mongoose";
import { OrderStatus } from "./order.enum";

export interface OrderDocument extends Document {
    orderID: string;
    customerName: string;
    status: OrderStatus;        // ← บังคับเป็น enum เท่านั้น
    items: {
        productID: string;
        name: string;
        qty: number;
        price: number;
        total: number;
    }[];
    totalAmount: number;
    billingType?: OrderStatus;  // ถ้าต้องการให้เป็น enum เช่นกัน
    createdAt: Date;
    updatedAt: Date;
}
