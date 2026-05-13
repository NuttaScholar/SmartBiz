import { Request, Response } from "express";
import DiscountService from "../services/discount.service";
import { errorCode_e } from "../utils/enum";

export default {
  async getDiscounts(req: Request, res: Response) {
    try {
      const { customerID } = req.params;
      const data = await DiscountService.getDiscounts(customerID);
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  },

  async updateDiscounts(req: Request, res: Response) {
    try {
      const { customerID } = req.params;
      const { discounts } = req.body;

      const data = await DiscountService.updateDiscounts(customerID, discounts);
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }
};

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
