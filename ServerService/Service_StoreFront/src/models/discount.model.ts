import { Schema } from "mongoose";
import type { DiscountDocument } from "./discount.interface";

const DiscountItemSchema = new Schema(
  {
    productID: { type: String, required: true },
    discountPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  { _id: false },
);

export const DiscountSchema = new Schema<DiscountDocument>(
  {
    customerID: {
      type: String,
      required: true,
    },
    discounts: {
      type: [DiscountItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    autoCreate: false,
    autoIndex: false,
  },
);
