import { Schema } from "mongoose";
import { WalletDocument } from "./wallet.interface";

export const WalletSchema = new Schema<WalletDocument>({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
});
