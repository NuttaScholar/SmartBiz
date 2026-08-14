import { Router } from "express";
import { Model } from "mongoose";
import { LogAuditDocument } from "../models/log-audit.interface";
import { TransactionDocument } from "../models/transaction.interface";
import { WalletDocument } from "../models/wallet.interface";
import TransactionController from "../controllers/transaction.controller";
import { upload } from "../storage";

export default function transactionRoutes(
  TransactionModel: Model<TransactionDocument>,
  WalletModel: Model<WalletDocument>,
  LogAuditModel: Model<LogAuditDocument>,
) {
  const router = Router();
  const controller = new TransactionController(
    TransactionModel,
    WalletModel,
    LogAuditModel,
  );

  router.post("/transaction", upload.single("file"), (req, res) => controller.createTransaction(req, res));
  router.get("/trandetail", (req, res) => controller.getTransactionDetail(req, res));
  router.get("/transaction", (req, res) => controller.searchTransactions(req, res));
  router.put("/transaction", upload.single("file"), (req, res) => controller.updateTransaction(req, res));
  router.delete("/transaction", (req, res) => controller.deleteTransaction(req, res));

  return router;
}
