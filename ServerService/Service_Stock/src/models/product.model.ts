import { Schema } from "mongoose";
import { ProductDocument } from "./product.interface";

export const ProductSchema = new Schema<ProductDocument>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  type: { type: Number, required: true },
  status: { type: Number, required: true },
  amount: { type: Number, default: 0 },
  description: { type: String },
  img: { type: String },
  price: { type: Number },
  condition: { type: Number, default: 0 },
});
