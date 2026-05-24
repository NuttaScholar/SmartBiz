import { Request, Response } from "express";
import BillService from "../services/bill.service";
import { errorCode_e } from "../utils/enum";
import { Model } from "mongoose";
import { OrderDocument } from "../models/order.interface";
import { ContactDocument } from "../models/contact.interface";
import { ProductDocument } from "../models/product.interface";
import { AuthRequest } from "../middlewares/auth";

export default class BillController {
  private service: BillService;

  constructor(
    OrderModel: Model<OrderDocument>,
    ContactModel: Model<ContactDocument>,
    ProductModel: Model<ProductDocument>
  ) {
    this.service = new BillService(OrderModel, ContactModel, ProductModel);
  }

  async searchOrders(req: Request, res: Response) {
    try {
      const { customerID, orderID, status } = req.query;
      const data = await this.service.searchOrders(
        customerID as string,
        orderID as string,
        status as string
      );
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async countOrdersByStatus(req: Request, res: Response) {
    try {
      const { customerID, orderID } = req.query;
      const data = await this.service.countOrdersByStatus(
        customerID as string,
        orderID as string
      );
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async getOrdersByStatus(req: Request, res: Response) {
    try {
      const status = Number(req.params.status);
      const data = await this.service.getOrdersByStatus(status);
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async createOrder(req: Request, res: Response) {
    try {
      const data = await this.service.createOrder(req.body);
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async updateOrder(req: Request, res: Response) {
    try {
      const { orderID } = req.params;
      const data = await this.service.updateOrder(orderID, req.body);
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async deleteOrder(req: Request, res: Response) {
    try {
      const { orderID } = req.params;
      const data = await this.service.deleteOrder(orderID);
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async moveToNextStep(req: AuthRequest, res: Response) {
    try {
      const { orderID } = req.params;
      const data = await this.service.moveToNextStep(orderID, req.headers.authorization);
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async markAsIncome(req: AuthRequest, res: Response) {
    try {
      const { orderID } = req.params;
      const data = await this.service.markAsIncome(orderID, req.headers.authorization);
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async markAsDebt(req: Request, res: Response) {
    try {
      const { orderID } = req.params;
      const data = await this.service.markAsDebt(orderID);
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async getStatus(req: Request, res: Response) {
    try {
      const { orderID } = req.params;
      const data = await this.service.getStatus(orderID);
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }
}


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
