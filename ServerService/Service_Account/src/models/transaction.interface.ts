import { Document } from "mongoose";

export interface TransactionDocument extends Document {
  topic: string;
  type: number;
  money: number;
  description?: string;
  who?: string;
  date: Date;
  bill?: string;
  readonly: boolean;
}
