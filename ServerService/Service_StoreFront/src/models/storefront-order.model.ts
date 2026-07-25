import { Schema } from "mongoose";
import { orderStatus_e } from "../utils/enum";
import type { StorefrontOrderDocument } from "./storefront-order.interface";

const OrderItemSchema = new Schema(
  {
    productID: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    priceOriginal: { type: Number, required: true, min: 0 },
    discountPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    priceAfterDiscount: { type: Number, required: true, min: 0 },
    img: { type: String, required: true, default: "" },
  },
  { _id: false },
);

const ConfirmationEvidenceSchema = new Schema(
  {
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    dataUrl: { type: String, required: true },
    updatedAt: { type: Date, required: true },
  },
  { _id: false },
);

export const StorefrontOrderSchema =
  new Schema<StorefrontOrderDocument>(
    {
      orderID: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },
      customerID: {
        type: String,
        required: true,
        index: true,
      },
      status: {
        type: Number,
        required: true,
        enum: Object.values(orderStatus_e).filter(
          (value) => typeof value === "number",
        ),
        default: orderStatus_e.Submitted,
      },
      items: {
        type: [OrderItemSchema],
        required: true,
        validate: {
          validator: (items: unknown[]) => items.length > 0,
          message: "items must not be empty",
        },
      },
      totalAmount: { type: Number, required: true, min: 0 },
      confirmationEvidence: {
        type: ConfirmationEvidenceSchema,
        required: false,
      },
    },
    { timestamps: true },
  );

StorefrontOrderSchema.index({ customerID: 1, createdAt: -1 });
