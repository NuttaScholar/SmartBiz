import { Schema } from "mongoose";
import { LogDocument } from "./log.interface";

export const LogSchema = new Schema<LogDocument>({
  productID: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  price: { type: Number },
  bill: { type: String },
  note: { type: String },
});
