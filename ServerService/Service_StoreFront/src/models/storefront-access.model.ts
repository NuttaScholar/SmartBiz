import { Schema } from "mongoose";
import type { StorefrontAccessDocument } from "./storefront-access.interface";

const ProductDiscountSchema = new Schema(
  {
    productID: { type: String, required: true, trim: true },
    discountPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  { _id: false },
);

export const StorefrontAccessSchema =
  new Schema<StorefrontAccessDocument>(
    {
      customerID: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        index: true,
      },
      customerName: { type: String, required: true, trim: true },
      token: {
        type: String,
        required: true,
        unique: true,
        index: true,
        select: false,
      },
      isActive: { type: Boolean, required: true, default: true },
      productDiscounts: {
        type: [ProductDiscountSchema],
        default: [],
      },
    },
    { timestamps: true },
  );
