import type { Document } from "mongoose";

export interface ProductDiscount {
  productID: string;
  discountPercent: number;
}

export interface StorefrontAccessDocument extends Document {
  customerID: string;
  customerName: string;
  token: string;
  isActive: boolean;
  productDiscounts: ProductDiscount[];
  createdAt: Date;
  updatedAt: Date;
}
