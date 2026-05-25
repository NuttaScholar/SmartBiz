import { Router } from "express";
import { Model } from "mongoose";
import { WalletDocument } from "../models/wallet.interface";
import WalletController from "../controllers/wallet.controller";

export default function walletRoutes(WalletModel: Model<WalletDocument>) {
  const router = Router();
  const controller = new WalletController(WalletModel);

  router.get("/", (req, res) => controller.getWallet(req, res));

  return router;
}
