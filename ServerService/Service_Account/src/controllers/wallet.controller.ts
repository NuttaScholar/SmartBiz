import { Response } from "express";
import { Model } from "mongoose";
import {
  AuthRequest,
  hasServiceScope,
  isUserWithRole,
} from "../middlewares/auth";
import { WalletDocument } from "../models/wallet.interface";
import { errorCode_e, role_e } from "../utils/enum";
import { error, success } from "../utils/response";
import WalletService from "../services/wallet.service";

export default class WalletController {
  private service: WalletService;

  constructor(WalletModel: Model<WalletDocument>) {
    this.service = new WalletService(WalletModel);
  }

  async getWallet(req: AuthRequest, res: Response) {
    try {
      if (!requireAdmin(req, res)) return;

      return res.json(success<"getWallet">(await this.service.getMainWalletAmount()));
    } catch (err) {
      console.error(err);
      return res.status(500).json(error<"getWallet">(errorCode_e.UnknownError, "Unknown error"));
    }
  }
}

function requireAdmin(req: AuthRequest, res: Response) {
  if (
    isUserWithRole(req, [role_e.admin])
    || hasServiceScope(req, "account.wallet.read")
  ) return true;

  res.status(403).json(error<"none">(errorCode_e.PermissionDeniedError, "You do not have permission to access this resource"));
  return false;
}
