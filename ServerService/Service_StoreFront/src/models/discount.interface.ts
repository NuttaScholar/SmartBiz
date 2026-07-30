import type { Document } from "mongoose";
import type { DiscountItem } from "../type";

export interface DiscountDocument extends Document {
  customerID: string;
  discounts: DiscountItem[];
  createdAt: Date;
  updatedAt: Date;
}
