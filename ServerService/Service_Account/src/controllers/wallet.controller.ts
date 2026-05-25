import { Response } from "express";
import { Model } from "mongoose";
import { AuthRequest } from "../middlewares/auth";
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

      return res.send(success<"getWallet">(await this.service.getMainWalletAmount()));
    } catch (err) {
      console.error(err);
      return res.send(error<"getWallet">(errorCode_e.UnknownError));
    }
  }
}

function requireAdmin(req: AuthRequest, res: Response) {
  if (req.authData?.role === role_e.admin) return true;

  res.send(error<"none">(errorCode_e.PermissionDeniedError));
  return false;
}
