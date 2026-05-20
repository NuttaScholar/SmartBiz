import { Schema } from "mongoose";
import { OrderStatus } from "./order.enum";
import { OrderDocument } from "./order.interface";
import { getDB } from "../database/mongo";

// ฟังก์ชันสร้าง orderID อัตโนมัติ
function generateOrderID() {
    const rand = Math.floor(1000 + Math.random() * 9000); // 4 digits
    return `ORD-${Date.now()}-${rand}`;
}

const OrderItemSchema = new Schema(
    {
        productID: { type: String, required: true },
        quantity: { type: Number, required: true },
        priceOriginal: { type: Number, required: true },
        priceAfterDiscount: { type: Number, required: true },
        discountPercent: { type: Number, required: false }
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

        items: { type: [OrderItemSchema], required: true },

        totalAmount: { type: Number, required: true }
    },
    { timestamps: true }
);
