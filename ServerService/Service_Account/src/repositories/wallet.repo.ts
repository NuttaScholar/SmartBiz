import { Model } from "mongoose";
import { WalletDocument } from "../models/wallet.interface";

export const MAIN_WALLET_NAME = "main";

export default class WalletRepo {
  constructor(private WalletModel: Model<WalletDocument>) {}

  findMainWallet() {
    return this.WalletModel.findOne({ name: MAIN_WALLET_NAME });
  }

  createMainWallet() {
    return new this.WalletModel({ name: MAIN_WALLET_NAME, amount: 0 }).save();
  }

  updateMainAmount(amount: number) {
    return this.WalletModel.updateOne({ name: MAIN_WALLET_NAME }, { amount });
  }
}
