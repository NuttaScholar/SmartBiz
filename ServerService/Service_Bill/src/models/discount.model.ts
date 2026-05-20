import mongoose, { Schema } from "mongoose";
import { DiscountDocument } from "./discount.interface";
import { getDB } from "../database/mongo";

export const DiscountSchema = new Schema<DiscountDocument>(
  {
    customerID: { type: String, required: true, unique: true, ref: "contact" },

    discounts: [
      {
        productID: { type: String, required: true },
        discountPercent: { type: Number, required: true }
      }
    ]
  },
  { timestamps: true }
);


