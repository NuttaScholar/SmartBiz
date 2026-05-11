import mongoose, { Schema } from "mongoose";
import { OrderStatus } from "./order.enum";
import { OrderDocument } from "./order.interface";

const OrderSchema = new Schema<OrderDocument>(
    {
        orderID: { type: String, required: true, unique: true },
        customerName: { type: String, required: true },

        status: {
            type: Number,
            enum: Object.values(OrderStatus).filter(v => typeof v === "number"),
            default: OrderStatus.Pending
        },

        items: [
            {
                productID: String,
                name: String,
                qty: Number,
                price: Number,
                total: Number
            }
        ],

        totalAmount: { type: Number, default: 0 },

        billingType: {
            type: Number,
            enum: [OrderStatus.IncomeRecorded, OrderStatus.DebtRecorded],
            default: null
        }
    },
    { timestamps: true }
);

// ❗ ต้องใส่ generic ตรงนี้
export default mongoose.model<OrderDocument>("Order", OrderSchema);
