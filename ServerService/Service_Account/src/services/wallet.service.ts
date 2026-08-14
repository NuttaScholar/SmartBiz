import { ClientSession, Model } from "mongoose";
import { transactionType_e } from "../utils/enum";
import { WalletDocument } from "../models/wallet.interface";
import WalletRepo from "../repositories/wallet.repo";

export default class WalletService {
  private repo: WalletRepo;

  constructor(WalletModel: Model<WalletDocument>) {
    this.repo = new WalletRepo(WalletModel);
  }

  async ensureMainWallet() {
    const wallet = await this.repo.findMainWallet();
    if (wallet) return;

    await this.repo.createMainWallet();
    console.log("Create Wallet Success!");
  }

  async getMainWalletAmount(session?: ClientSession) {
    const wallet = await this.repo.findMainWallet(session);
    return wallet?.amount || 0;
  }

  updateMainWalletAmount(amount: number, session?: ClientSession) {
    return this.repo.updateMainAmount(amount, session);
  }

  calWallet(type: transactionType_e, wallet: number, val: number, invert = false) {
    const amount = invert ? -val : val;

    switch (type) {
      case transactionType_e.expenses:
      case transactionType_e.lend:
        return wallet - amount;
      case transactionType_e.income:
      case transactionType_e.loan:
        return wallet + amount;
      default:
        return wallet;
    }
  }
}
