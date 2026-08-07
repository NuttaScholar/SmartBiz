import { Schema } from "mongoose";
import { CANCELLED_ORDER_TTL_SECONDS } from "../config";
import { OrderSource, OrderStatus } from "../utils/enum";
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
        discountPercent: { type: Number, required: false, min: 0, max: 100 },
        name: { type: String, required: false },
        img: { type: String, required: false }
    },
    { _id: false }
);

const ConfirmationEvidenceSchema = new Schema(
    {
        fileName: { type: String, required: true },
        mimeType: { type: String, required: true },
        objectKey: { type: String, required: true },
        updatedAt: { type: Date, required: true }
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

        source: {
            type: String,
            enum: Object.values(OrderSource),
            required: true,
            default: OrderSource.Direct
        },

        totalAmount: { type: Number, required: true, min: 0 },

        confirmationEvidence: {
            type: ConfirmationEvidenceSchema,
            required: false,
            default: undefined
        },

        paymentConfirmedAt: { type: Date, required: false },
        paymentConfirmedBy: { type: String, required: false }
    },
    { timestamps: true }
);

OrderSchema.index(
    { updatedAt: 1 },
    {
        name: "cancelled_orders_ttl",
        expireAfterSeconds: CANCELLED_ORDER_TTL_SECONDS,
        partialFilterExpression: { status: OrderStatus.Cancelled }
    }
);
