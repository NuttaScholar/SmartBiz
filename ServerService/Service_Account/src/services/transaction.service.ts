import { Model } from "mongoose";
import { errorCode_e } from "../utils/enum";
import { TransitionForm_t } from "../type";
import { TransactionDocument } from "../models/transaction.interface";
import { WalletDocument } from "../models/wallet.interface";
import TransactionRepo from "../repositories/transaction.repo";
import WalletService from "./wallet.service";
import { removeBillImage, uploadBillImage } from "../storage";

export default class TransactionService {
  private transactionRepo: TransactionRepo;
  private walletService: WalletService;

  constructor(
    TransactionModel: Model<TransactionDocument>,
    WalletModel: Model<WalletDocument>
  ) {
    this.transactionRepo = new TransactionRepo(TransactionModel);
    this.walletService = new WalletService(WalletModel);
  }

  async createTransaction(data: TransitionForm_t, file?: Express.Multer.File) {
    const typeNum = Number(data.type);
    const moneyNum = Number(data.money);
    if (this.isZeroMoney(moneyNum)) return;

    const billUrl = file ? await uploadBillImage(file.buffer) : data.bill;

    await this.transactionRepo.create({ ...data, bill: billUrl });
    await this.applyWallet(typeNum, moneyNum);
  }

  async getTransactionDetail(id?: string | string[]) {
    const transaction = await this.transactionRepo.findById(id);
    if (!transaction) {
      throw { code: errorCode_e.NotFoundError, message: "Transaction not found" };
    }

    const { date, money, topic, type, description, who, readonly, bill } = transaction;
    return { date, money, topic, type, description, who, readonly, bill };
  }

  searchTransactions(query: {
    from?: string;
    to?: string;
    who?: string;
    topic?: string;
    type?: string;
  }) {
    const { from, to, who, topic, type } = query;
    const filter: Record<string, unknown> = {
      date: {
        $gte: new Date(from || Date.now()),
        $lte: new Date(to || Date.now()),
      },
    };
    if (who) filter.who = who;
    if (topic) filter.topic = topic;
    if (type) filter.type = Number(type);

    return this.transactionRepo.search(filter);
  }

  async deleteTransaction(id?: string | string[]) {
    const dataTran = await this.transactionRepo.findById(id);
    const deleteRes = await this.transactionRepo.deleteById(id);

    if (deleteRes.deletedCount && dataTran) {
      await this.applyWallet(dataTran.type, dataTran.money, true);
    }

    await removeBillImage(dataTran?.bill);
  }

  async updateTransaction(id: string | string[] | undefined, data: TransitionForm_t, file?: Express.Multer.File) {
    const typeNum = Number(data.type);
    const moneyNum = Number(data.money);
    if (this.isZeroMoney(moneyNum)) return;

    const dataTran = await this.transactionRepo.findById(id);
    let newData: TransitionForm_t = { ...data };

    if (file) {
      await removeBillImage(dataTran?.bill);
      newData = { ...newData, bill: await uploadBillImage(file.buffer) };
    } else if (data.bill === "") {
      await removeBillImage(dataTran?.bill);
      newData = { ...newData, bill: "" };
    }

    const updateRes = await this.transactionRepo.updateById(id, newData);
    if (!updateRes.matchedCount) {
      throw { code: errorCode_e.NotFoundError, message: "Transaction not found" };
    }

    const walletAmount = await this.walletService.getMainWalletAmount();
    const revertedWallet = this.walletService.calWallet(
      dataTran?.type === undefined ? 255 : dataTran.type,
      walletAmount,
      dataTran?.money || 0,
      true
    );
    const walletRes = await this.walletService.updateMainWalletAmount(
      this.walletService.calWallet(typeNum, revertedWallet, moneyNum)
    );

    if (!walletRes.acknowledged) {
      throw { code: errorCode_e.TimeoutError, message: "Update wallet failed" };
    }
  }

  private async applyWallet(type: number, money: number, invert = false) {
    const walletAmount = await this.walletService.getMainWalletAmount();
    const updateRes = await this.walletService.updateMainWalletAmount(
      this.walletService.calWallet(type, walletAmount, money, invert)
    );

    if (!updateRes.acknowledged) {
      throw { code: errorCode_e.TimeoutError, message: "Update wallet failed" };
    }
  }

  private isZeroMoney(money: number) {
    return money === 0;
  }
}
