import { Schema } from "mongoose";
import { TransactionDocument } from "./transaction.interface";

export const TransactionSchema = new Schema<TransactionDocument>({
  topic: { type: String, required: true },
  type: { type: Number, required: true },
  money: { type: Number, required: true },
  description: String,
  who: { type: String, ref: "contact" },
  date: { type: Date, required: true },
  bill: String,
  readonly: { type: Boolean, default: false },
});
