import { Document } from "mongoose";

export interface DiscountItem {
  productID: string;
  discountPercent: number; // 0–100
}

export interface DiscountDocument extends Document {
  customerID: string;
  discounts: DiscountItem[];
  updatedAt: Date;
  createdAt: Date;
}
