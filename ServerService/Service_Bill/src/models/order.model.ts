import { Schema } from "mongoose";
import { OrderStatus } from "./order.enum";
import { OrderDocument } from "./order.interface";

// ฟังก์ชันสร้าง orderID อัตโนมัติ
function generateOrderID() {
    const rand = Math.floor(1000 + Math.random() * 9000); // 4 digits
    return `ORD-${Date.now()}-${rand}`;
}

const OrderItemSchema = new Schema(
    {
        productID: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        priceOriginal: { type: Number, required: true, min: 0 },
        priceAfterDiscount: { type: Number, required: true, min: 0 },
        discountPercent: { type: Number, required: false, min: 0, max: 100 }
    },
    { _id: false }
);

export const OrderSchema = new Schema<OrderDocument>(
    {
        orderID: {
            type: String,
            unique: true,
            default: generateOrderID   // ⭐ ให้ DB สร้างเอง
        },

        customerID: { type: String, required: true, ref: "contact" },

        status: {
            type: Number,
            enum: Object.values(OrderStatus).filter(v => typeof v === "number"),
            required: true
        },

        items: {
            type: [OrderItemSchema],
            required: true,
            validate: {
                validator: (items: unknown[]) => Array.isArray(items) && items.length > 0,
                message: "items must not be empty"
            }
        },

        totalAmount: { type: Number, required: true, min: 0 }
    },
    { timestamps: true }
);
