import { ClientSession, Model, Types } from "mongoose";
import { errorCode_e } from "../utils/enum";
import { TransitionForm_t } from "../type";
import {
  AuditAction,
  AuditActor,
  LogAuditDocument,
  TransactionSnapshot,
} from "../models/log-audit.interface";
import { TransactionDocument } from "../models/transaction.interface";
import { WalletDocument } from "../models/wallet.interface";
import LogAuditRepo from "../repositories/log-audit.repo";
import TransactionRepo from "../repositories/transaction.repo";
import { MAIN_WALLET_NAME } from "../repositories/wallet.repo";
import WalletService from "./wallet.service";
import { removeBillImage, uploadBillImage } from "../storage";
import {
  getAuditDates,
  getChangedFields,
  toTransactionSnapshot,
} from "../utils/transaction-audit";

export default class TransactionService {
  private transactionRepo: TransactionRepo;
  private walletService: WalletService;
  private logAuditRepo: LogAuditRepo;

  constructor(
    TransactionModel: Model<TransactionDocument>,
    WalletModel: Model<WalletDocument>,
    LogAuditModel: Model<LogAuditDocument>,
  ) {
    this.transactionRepo = new TransactionRepo(TransactionModel);
    this.walletService = new WalletService(WalletModel);
    this.logAuditRepo = new LogAuditRepo(LogAuditModel);
  }

  async createTransaction(
    data: TransitionForm_t,
    actor: AuditActor,
    file?: Express.Multer.File,
  ) {
    const typeNum = Number(data.type);
    const moneyNum = Number(data.money);
    if (this.isZeroMoney(moneyNum)) return;

    const uploadedBill = file ? await uploadBillImage(file.buffer) : undefined;
    const bill = uploadedBill || data.bill;
    const session = await this.transactionRepo.startSession();

    try {
      await session.withTransaction(async () => {
        const walletBefore = await this.walletService.getMainWalletAmount(session);
        const transaction = await this.transactionRepo.create(
          this.buildTransactionData(data, bill),
          session,
        );
        const walletAfter = this.walletService.calWallet(
          typeNum,
          walletBefore,
          moneyNum,
        );

        await this.updateWallet(walletAfter, session);

        const after = toTransactionSnapshot(transaction);
        await this.writeAudit(
          "CREATE",
          transaction._id as Types.ObjectId,
          actor,
          null,
          after,
          walletBefore,
          walletAfter,
          session,
        );
      }, this.transactionOptions());
    } catch (err) {
      if (uploadedBill) await this.safeRemoveBill(uploadedBill);
      throw err;
    } finally {
      await session.endSession();
    }
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

  async deleteTransaction(
    id: string | string[] | undefined,
    actor: AuditActor,
  ) {
    const session = await this.transactionRepo.startSession();
    let billToRemove: string | undefined;

    try {
      await session.withTransaction(async () => {
        const transaction = await this.transactionRepo.findById(id, session);
        if (!transaction) {
          throw { code: errorCode_e.NotFoundError, message: "Transaction not found" };
        }
        this.assertEditable(transaction);

        const before = toTransactionSnapshot(transaction);
        const walletBefore = await this.walletService.getMainWalletAmount(session);
        const walletAfter = this.walletService.calWallet(
          transaction.type,
          walletBefore,
          transaction.money,
          true,
        );

        await this.updateWallet(walletAfter, session);
        const deleteRes = await this.transactionRepo.deleteById(id, session);
        if (!deleteRes.deletedCount) {
          throw { code: errorCode_e.NotFoundError, message: "Transaction not found" };
        }

        await this.writeAudit(
          "DELETE",
          transaction._id as Types.ObjectId,
          actor,
          before,
          null,
          walletBefore,
          walletAfter,
          session,
        );
        billToRemove = transaction.bill;
      }, this.transactionOptions());
    } finally {
      await session.endSession();
    }

    if (billToRemove) await this.safeRemoveBill(billToRemove);
  }

  async updateTransaction(
    id: string | string[] | undefined,
    data: TransitionForm_t,
    actor: AuditActor,
    file?: Express.Multer.File,
  ) {
    const typeNum = Number(data.type);
    const moneyNum = Number(data.money);
    if (this.isZeroMoney(moneyNum)) return;

    const uploadedBill = file ? await uploadBillImage(file.buffer) : undefined;
    const session = await this.transactionRepo.startSession();
    let oldBillToRemove: string | undefined;

    try {
      await session.withTransaction(async () => {
        const transaction = await this.transactionRepo.findById(id, session);
        if (!transaction) {
          throw { code: errorCode_e.NotFoundError, message: "Transaction not found" };
        }
        this.assertEditable(transaction);

        const before = toTransactionSnapshot(transaction);
        const bill = uploadedBill ?? data.bill ?? transaction.bill;
        const newData = this.buildTransactionData(data, bill);
        const walletBefore = await this.walletService.getMainWalletAmount(session);
        const revertedWallet = this.walletService.calWallet(
          transaction.type,
          walletBefore,
          transaction.money,
          true,
        );
        const walletAfter = this.walletService.calWallet(
          typeNum,
          revertedWallet,
          moneyNum,
        );

        const updatedTransaction = await this.transactionRepo.updateById(
          id,
          newData,
          session,
        );
        if (!updatedTransaction) {
          throw { code: errorCode_e.NotFoundError, message: "Transaction not found" };
        }

        await this.updateWallet(walletAfter, session);
        const after = toTransactionSnapshot(updatedTransaction);
        await this.writeAudit(
          "UPDATE",
          updatedTransaction._id as Types.ObjectId,
          actor,
          before,
          after,
          walletBefore,
          walletAfter,
          session,
        );

        if (transaction.bill && transaction.bill !== after.bill) {
          oldBillToRemove = transaction.bill;
        }
      }, this.transactionOptions());
    } catch (err) {
      if (uploadedBill) await this.safeRemoveBill(uploadedBill);
      throw err;
    } finally {
      await session.endSession();
    }

    if (oldBillToRemove) await this.safeRemoveBill(oldBillToRemove);
  }

  private buildTransactionData(
    data: TransitionForm_t,
    bill?: string,
  ): TransitionForm_t {
    return {
      date: data.date,
      topic: data.topic,
      type: Number(data.type),
      money: Number(data.money),
      who: data.who,
      description: data.description,
      bill,
      readonly: data.readonly,
    };
  }

  private async updateWallet(amount: number, session: ClientSession) {
    const wallet = await this.walletService.updateMainWalletAmount(amount, session);
    if (!wallet) {
      throw { code: errorCode_e.TimeoutError, message: "Update wallet failed" };
    }
  }

  private async writeAudit(
    action: AuditAction,
    transactionId: Types.ObjectId,
    actor: AuditActor,
    before: TransactionSnapshot | null,
    after: TransactionSnapshot | null,
    walletBefore: number,
    walletAfter: number,
    session: ClientSession,
  ) {
    const { occurredAt, expiresAt } = getAuditDates();
    const changedFields: string[] = getChangedFields(before, after);
    if (walletBefore !== walletAfter) changedFields.push("wallet.amount");

    await this.logAuditRepo.create({
      transactionId,
      action,
      actor,
      affectedCollections: ["transactions", "wallets"],
      changedFields,
      transactionBefore: before,
      transactionAfter: after,
      wallet: {
        name: MAIN_WALLET_NAME,
        beforeAmount: walletBefore,
        afterAmount: walletAfter,
      },
      occurredAt,
      expiresAt,
    }, session);
  }

  private assertEditable(transaction: TransactionDocument) {
    if (transaction.readonly) {
      throw {
        code: errorCode_e.InvalidStateError,
        message: "Readonly transaction cannot be changed",
      };
    }
  }

  private transactionOptions() {
    return {
      readConcern: { level: "snapshot" as const },
      writeConcern: { w: "majority" as const },
    };
  }

  private async safeRemoveBill(bill: string) {
    try {
      await removeBillImage(bill);
    } catch (err) {
      console.error("Remove bill image failed", err);
    }
  }

  private isZeroMoney(money: number) {
    return money === 0;
  }
}
