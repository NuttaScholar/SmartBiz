import mongoose, { Schema } from "mongoose";
import { DiscountDocument } from "./discount.interface";

const DiscountSchema = new Schema<DiscountDocument>(
  {
    customerID: { type: String, required: true, unique: true },

    discounts: [
      {
        productID: { type: String, required: true },
        discountPercent: { type: Number, required: true }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model<DiscountDocument>("Discount", DiscountSchema);
