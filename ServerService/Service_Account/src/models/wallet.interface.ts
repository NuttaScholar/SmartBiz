import { Document } from "mongoose";

export interface WalletDocument extends Document {
  name: string;
  amount: number;
}
