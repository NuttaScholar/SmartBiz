import { Response } from "express";
import BillService from "../services/bill.service";
import { errorCode_e, OrderSource, role_e } from "../utils/enum";
import { Model } from "mongoose";
import { OrderDocument } from "../models/order.interface";
import { ContactDocument } from "../models/contact.interface";
import { ProductDocument } from "../models/product.interface";
import {
  AuthRequest,
  hasServiceScope,
  isUserWithRole,
} from "../middlewares/auth";
import { MINIO_HOST, SERVICE_ACCOUNT_URL, SERVICE_STOCK_URL } from "../config";
import { createServiceToken } from "../utils/service-token";

export default class BillController {
  private service: BillService;

  constructor(
    OrderModel: Model<OrderDocument>,
    ContactModel: Model<ContactDocument>,
    ProductModel: Model<ProductDocument>
  ) {
    this.service = new BillService(
      OrderModel,
      ContactModel,
      ProductModel,
      createServiceToken,
      SERVICE_ACCOUNT_URL,
      MINIO_HOST,
      SERVICE_STOCK_URL,
    );
  }

  async searchOrders(req: AuthRequest, res: Response) {
    try {
      if (!ensureBillUser(req, res, "bill.order.read")) return;
      const { customerID, orderID, status, source } = req.query;
      const data = await this.service.searchOrders(
        customerID as string,
        orderID as string,
        status as string,
        source as string,
      );
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async countOrdersByStatus(req: AuthRequest, res: Response) {
    try {
      if (!ensureBillUser(req, res, "bill.order.read")) return;
      const { customerID, orderID, source } = req.query;
      const data = await this.service.countOrdersByStatus(
        customerID as string,
        orderID as string,
        source as string,
      );
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async getProductUsage(req: AuthRequest, res: Response) {
    try {
      if (!ensureBillUser(req, res, "bill.product-usage.read")) return;
      const { productID } = req.params;
      const data = await this.service.getProductUsage(productID);
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async getOrdersByStatus(req: AuthRequest, res: Response) {
    try {
      if (!ensureBillUser(req, res, "bill.order.read")) return;
      const status = Number(req.params.status);
      const data = await this.service.getOrdersByStatus(
        status,
        req.query.source as string,
      );
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async createOrder(req: AuthRequest, res: Response) {
    try {
      if (!ensureBillUser(req, res, "bill.order.create")) return;
      const data = await this.service.createOrder(
        req.body,
        OrderSource.Direct,
      );
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async updateOrder(req: AuthRequest, res: Response) {
    try {
      if (!ensureBillUser(req, res, "bill.order.update")) return;
      const { orderID } = req.params;
      const data = await this.service.updateOrder(orderID, req.body);
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async deleteOrder(req: AuthRequest, res: Response) {
    try {
      if (!ensureBillUser(req, res, "bill.order.delete")) return;
      const { orderID } = req.params;
      const data = await this.service.deleteOrder(orderID);
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async moveToNextStep(req: AuthRequest, res: Response) {
    try {
      if (!ensureBillUser(req, res, "bill.order.advance")) return;
      const { orderID } = req.params;
      const data = await this.service.moveToNextStep(orderID);
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async markAsIncome(req: AuthRequest, res: Response) {
    try {
      if (!ensureBillUser(req, res, "bill.order.advance")) return;
      const { orderID } = req.params;
      const data = await this.service.markAsIncome(orderID);
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async markAsDebt(req: AuthRequest, res: Response) {
    try {
      if (!ensureBillUser(req, res, "bill.order.advance")) return;
      const { orderID } = req.params;
      const data = await this.service.markAsDebt(orderID);
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async getStatus(req: AuthRequest, res: Response) {
    try {
      if (!ensureBillUser(req, res, "bill.order.status.read")) return;
      const { orderID } = req.params;
      const data = await this.service.getStatus(orderID);
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async createStorefrontOrder(req: AuthRequest, res: Response) {
    try {
      if (!ensureBillUser(req, res, "bill.storefront.manage")) return;
      const data = await this.service.createOrder(
        req.body,
        OrderSource.Online,
      );
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async getStorefrontOrders(req: AuthRequest, res: Response) {
    try {
      if (!ensureBillUser(req, res, "bill.storefront.read")) return;
      const data = await this.service.getOnlineOrders(
        req.query.customerID as string,
        req.query.orderID as string,
      );
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async updateStorefrontEvidence(req: AuthRequest, res: Response) {
    try {
      if (!ensureBillUser(req, res, "bill.storefront.manage")) return;
      const data = await this.service.updateOnlineEvidence(
        req.body?.customerID,
        req.params.orderID,
        req.body?.evidence,
      );
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async cancelStorefrontOrder(req: AuthRequest, res: Response) {
    try {
      if (!ensureBillUser(req, res, "bill.storefront.manage")) return;
      const data = await this.service.cancelOnlineOrder(
        req.query.customerID as string,
        req.params.orderID,
      );
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async listPaymentConfirmations(req: AuthRequest, res: Response) {
    try {
      if (!ensureBillUser(req, res, "bill.storefront.read")) return;
      const data = await this.service.listPaymentConfirmations();
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async confirmStorefrontPayment(req: AuthRequest, res: Response) {
    try {
      if (!ensureBillUser(req, res, "bill.storefront.manage")) return;
      const data = await this.service.confirmOnlinePayment(
        req.params.orderID,
        req.body?.confirmedBy,
      );
      return res.json({ success: true, data });
    } catch (err: any) {
      return handleError(res, err);
    }
  }
}

function ensureBillUser(
  req: AuthRequest,
  res: Response,
  serviceScope: string,
) {
  if (
    isUserWithRole(req, [role_e.admin, role_e.cashier])
    || hasServiceScope(req, serviceScope)
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
