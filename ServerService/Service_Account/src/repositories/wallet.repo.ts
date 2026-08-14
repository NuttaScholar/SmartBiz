import { ClientSession, Model } from "mongoose";
import { WalletDocument } from "../models/wallet.interface";

export const MAIN_WALLET_NAME = "main";

export default class WalletRepo {
  constructor(private WalletModel: Model<WalletDocument>) {}

  findMainWallet(session?: ClientSession) {
    const query = this.WalletModel.findOne({ name: MAIN_WALLET_NAME });
    return session ? query.session(session) : query;
  }

  createMainWallet() {
    return new this.WalletModel({ name: MAIN_WALLET_NAME, amount: 0 }).save();
  }

  updateMainAmount(amount: number, session?: ClientSession) {
    return this.WalletModel.findOneAndUpdate(
      { name: MAIN_WALLET_NAME },
      { $set: { amount } },
      { new: true, session },
    );
  }
}
