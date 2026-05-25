import { Response } from "express";
import { Model } from "mongoose";
import { AuthRequest } from "../middlewares/auth";
import { TransactionDocument } from "../models/transaction.interface";
import { WalletDocument } from "../models/wallet.interface";
import { TransitionForm_t } from "../type";
import { errorCode_e, role_e } from "../utils/enum";
import { error, success } from "../utils/response";
import TransactionService from "../services/transaction.service";

export default class TransactionController {
  private service: TransactionService;

  constructor(
    TransactionModel: Model<TransactionDocument>,
    WalletModel: Model<WalletDocument>
  ) {
    this.service = new TransactionService(TransactionModel, WalletModel);
  }

  async createTransaction(req: AuthRequest, res: Response) {
    try {
      if (!requireAdmin(req, res)) return;

      await this.service.createTransaction(req.body as TransitionForm_t, req.file);
      return res.send(success<"none">());
    } catch (err) {
      return handleError(res, err);
    }
  }

  async getTransactionDetail(req: AuthRequest, res: Response) {
    try {
      if (!requireAdmin(req, res)) return;

      const result = await this.service.getTransactionDetail(req.query.id as string);
      return res.send(success<"getTransDetail">(result));
    } catch (err) {
      return handleError(res, err, "getTransDetail");
    }
  }

  async searchTransactions(req: AuthRequest, res: Response) {
    try {
      if (!requireAdmin(req, res)) return;

      const { from, to, who, topic, type } = req.query;
      const result = await this.service.searchTransactions({
        from: from as string,
        to: to as string,
        who: who as string,
        topic: topic as string,
        type: type as string,
      });
      return res.send(success<"getTransaction">(result));
    } catch (err) {
      return handleError(res, err, "getTransaction");
    }
  }

  async updateTransaction(req: AuthRequest, res: Response) {
    try {
      if (!requireAdmin(req, res)) return;

      await this.service.updateTransaction(
        req.query.id as string,
        req.body as TransitionForm_t,
        req.file
      );
      return res.send(success<"none">());
    } catch (err) {
      return handleError(res, err);
    }
  }

  async deleteTransaction(req: AuthRequest, res: Response) {
    try {
      if (!requireAdmin(req, res)) return;

      await this.service.deleteTransaction(req.query.id as string);
      return res.send(success<"none">());
    } catch (err) {
      return handleError(res, err);
    }
  }
}

function requireAdmin(req: AuthRequest, res: Response) {
  if (req.authData?.role === role_e.admin) return true;

  res.send(error<"none">(errorCode_e.PermissionDeniedError));
  return false;
}

function handleError(res: Response, err: any, kind: "getTransDetail" | "getTransaction" | "none" = "none") {
  console.error(err);
  const errCode = err?.code || errorCode_e.UnknownError;
  if (kind === "getTransDetail") return res.send(error<"getTransDetail">(errCode));
  if (kind === "getTransaction") return res.send(error<"getTransaction">(errCode));
  return res.send(error<"none">(errCode));
}
