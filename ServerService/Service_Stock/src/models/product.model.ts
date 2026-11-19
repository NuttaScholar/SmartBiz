import { Schema } from "mongoose";
import { ProductDocument } from "./product.interface";

export const ProductSchema = new Schema<ProductDocument>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  type: { type: Number, required: true },
  status: { type: Number, required: true },
  amount: { type: Number, default: 0 },
  actualAmount: { type: Number, default: 0, min: 0 },
  pendingDeliveryAmount: { type: Number, default: 0, min: 0 },
  inventorySchemaVersion: { type: Number, default: 2 },
  description: { type: String },
  showInStorefront: { type: Boolean, default: true },
  img: { type: String },
  price: { type: Number },
  condition: { type: Number, default: 0 },
});
