import { Request, Response } from "express";
import BillService from "../services/bill.service";
import { errorCode_e } from "../utils/enum";

export default {
  async searchOrders(req: Request, res: Response) {
    try {
      const { customerName, orderID } = req.query;
      const data = await BillService.searchOrders(
        customerName as string,
        orderID as string
      );
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  },

  async getOrdersByStatus(req: Request, res: Response) {
    try {
      const status = Number(req.params.status);
      const data = await BillService.getOrdersByStatus(status);
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  },

  async createOrder(req: Request, res: Response) {
    try {
      const data = await BillService.createOrder(req.body);
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  },

  async updateOrder(req: Request, res: Response) {
    try {
      const { orderID } = req.params;
      const data = await BillService.updateOrder(orderID, req.body);
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  },

  async deleteOrder(req: Request, res: Response) {
    try {
      const { orderID } = req.params;
      const data = await BillService.deleteOrder(orderID);
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  },

  async moveToNextStep(req: Request, res: Response) {
    try {
      const { orderID } = req.params;
      const data = await BillService.moveToNextStep(orderID);
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  },

  async markAsIncome(req: Request, res: Response) {
    try {
      const { orderID } = req.params;
      const data = await BillService.markAsIncome(orderID);
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  },

  async markAsDebt(req: Request, res: Response) {
    try {
      const { orderID } = req.params;
      const data = await BillService.markAsDebt(orderID);
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  },

  async getStatus(req: Request, res: Response) {
    try {
      const { orderID } = req.params;
      const data = await BillService.getStatus(orderID);
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }
};

/**
 * ฟังก์ชันกลางสำหรับจัดการ error
 */
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
