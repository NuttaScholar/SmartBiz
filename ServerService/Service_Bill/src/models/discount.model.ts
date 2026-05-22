import { Schema } from "mongoose";
import { DiscountDocument } from "./discount.interface";

export const DiscountSchema = new Schema<DiscountDocument>(
  {
    customerID: { type: String, required: true, unique: true, ref: "contact" },

    discounts: [
      {
        productID: { type: String, required: true },
        discountPercent: { type: Number, required: true, min: 0, max: 100 }
      }
    ]
  },
  { timestamps: true }
);


