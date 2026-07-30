import { Schema } from "mongoose";
import type { StorefrontAccessDocument } from "./storefront-access.interface";

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
    },
    { timestamps: true },
  );
