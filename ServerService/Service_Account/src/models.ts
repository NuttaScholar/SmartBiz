import mongoose from "mongoose";

export type transaction_t = {
  topic: string;
  type: number;
  money: number;
  description?: string;
  who?: string;
  date: Date;
  bill?: string;
  readonly: boolean;
};

export type wallet_t = {
  name: string;
  amount: number;
};

const contactSchema = new mongoose.Schema({
  codeName: {
    type: String,
    required: true,
    unique: true,
  },
  billName: { type: String, required: true },
  address: String,
  tel: String,
  taxID: String,
  description: String,
});

const transactionSchema = new mongoose.Schema<transaction_t>({
  topic: { type: String, required: true },
  type: { type: Number, required: true },
  money: { type: Number, required: true },
  description: String,
  who: { type: mongoose.Schema.Types.String, ref: "contact" },
  date: { type: Date, required: true },
  bill: String,
  readonly: { type: Boolean, default: false },
});

const walletSchema = new mongoose.Schema<wallet_t>({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
});

export const Contact = mongoose.model("contact", contactSchema);
export const Transaction = mongoose.model<transaction_t>("transaction", transactionSchema);
export const Wallet = mongoose.model("wallet", walletSchema);
