import type { Document } from "mongoose";

export interface StorefrontAccessDocument extends Document {
  customerID: string;
  customerName: string;
  token: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
