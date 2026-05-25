import { Response } from "express";
import DiscountService from "../services/discount.service";
import { errorCode_e, role_e } from "../utils/enum";
import { Model } from "mongoose";
import { DiscountDocument } from "../models/discount.interface";
import { ContactDocument } from "../models/contact.interface";
import { AuthRequest } from "../middlewares/auth";

export default class DiscountController {
  private service: DiscountService;

  constructor(DiscountModel: Model<DiscountDocument>, ContactModel: Model<ContactDocument>) {
    this.service = new DiscountService(DiscountModel, ContactModel);
  }

  async getDiscounts(req: AuthRequest, res: Response) {
    if (!ensureDiscountReader(req, res)) return;

    try {
      const { customerID } = req.params;
      const data = await this.service.getDiscounts(customerID);
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async updateDiscounts(req: AuthRequest, res: Response) {
    if (!ensureAdmin(req, res)) return;

    try {
      const { customerID } = req.params;
      const { discounts } = req.body;

      const data = await this.service.updateDiscounts(customerID, discounts);
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }
}

function ensureAdmin(req: AuthRequest, res: Response) {
  if (req.authData?.role === role_e.admin) return true;

  res.status(403).json({
    success: false,
    errCode: errorCode_e.PermissionDeniedError,
    message: "You do not have permission to access this resource"
  });
  return false;
}

function ensureDiscountReader(req: AuthRequest, res: Response) {
  if (
    req.authData?.role === role_e.admin ||
    req.authData?.role === role_e.cashier
  ) {
    return true;
  }

  res.status(403).json({
    success: false,
    errCode: errorCode_e.PermissionDeniedError,
    message: "You do not have permission to access this resource"
  });
  return false;
}

function handleError(res: Response, err: any) {
  if (err.code) {
    return res.status(400).json({
      success: false,
      errCode: err.code,
      message: err.message
    });
  }

  return res.status(500).json({
    success: false,
    errCode: errorCode_e.UnknownError,
    message: err.message || "Unknown error"
  });
}
