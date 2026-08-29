import { Response } from "express";
import { Model } from "mongoose";
import { LogDocument } from "../models/log.interface";
import { LogAuditDocument } from "../models/log-audit.interface";
import { ProductDocument } from "../models/product.interface";
import {
  AuthRequest,
  hasServiceScope,
  isUserWithRole,
} from "../middlewares/auth";
import StockService from "../services/stock.service";
import StorageService from "../services/storage.service";
import { stockAdjustmentForm_t, stockLogUpdateForm_t, stockOutForm_t } from "../type";
import { errorCode_e, role_e } from "../utils/enum";
import { getAuditActor, handleError } from "./product.controller";

export default class StockController {
  private service: StockService;

  constructor(
    ProductModel: Model<ProductDocument>,
    LogModel: Model<LogDocument>,
    LogAuditModel: Model<LogAuditDocument>,
    storageService: StorageService,
  ) {
    this.service = new StockService(ProductModel, LogModel, LogAuditModel, storageService);
  }

  async stockIn(req: AuthRequest, res: Response) {
    try {
      this.ensureAdmin(req, "stock.inventory.in");
      const { products, who, date, billFileName } = req.body as {
        products?: string;
        who?: string;
        date?: string;
        billFileName?: string;
      };
      const errors = await this.service.stockIn(
        products,
        who,
        date,
        getAuditActor(req),
        req.file,
        billFileName,
      );
      return res.json({
        success: true,
        ...(errors.length ? { data: errors, message: "Completed with warnings" } : {}),
      });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async stockOut(req: AuthRequest, res: Response) {
    try {
      this.ensureAdmin(req, "stock.inventory.out");
      const errors = await this.service.stockOut(req.body as stockOutForm_t, getAuditActor(req));
      return res.json({
        success: true,
        ...(errors.length ? { data: errors, message: "Completed with warnings" } : {}),
      });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async adjustStock(req: AuthRequest, res: Response) {
    try {
      this.ensureBillService(req, "stock.inventory.adjust");
      const result = await this.service.adjustStock(
        req.body as stockAdjustmentForm_t,
        getAuditActor(req),
      );
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async getLog(req: AuthRequest, res: Response) {
    try {
      this.ensureAdmin(req, "stock.log.read");
      const { id, type, index, size } = req.query;
      const result = await this.service.getLog(id as string, type as string, index as string, size as string);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async updateLog(req: AuthRequest, res: Response) {
    try {
      this.ensureAdmin(req, "stock.log.update");
      const result = await this.service.updateLog(
        req.params.id,
        req.body as stockLogUpdateForm_t,
        getAuditActor(req),
      );
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async deleteLog(req: AuthRequest, res: Response) {
    try {
      this.ensureAdmin(req, "stock.log.delete");
      await this.service.deleteLog(req.params.id, getAuditActor(req));
      return res.json({ success: true });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async getStatus(req: AuthRequest, res: Response) {
    try {
      this.ensureAdmin(req, "stock.status.read");
      const result = await this.service.getStatus();
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async getStock(req: AuthRequest, res: Response) {
    try {
      this.ensureStockReader(req, "stock.inventory.read");
      const result = await this.service.getStock(req.query.productType as string | string[] | undefined);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  private ensureAdmin(req: AuthRequest, scope: string) {
    if (
      !isUserWithRole(req, [role_e.admin])
      && !hasServiceScope(req, scope)
    ) {
      throw { code: errorCode_e.PermissionDeniedError, message: "Permission denied" };
    }
  }

  private ensureStockReader(req: AuthRequest, scope: string) {
    if (
      !isUserWithRole(req, [role_e.admin, role_e.cashier])
      && !hasServiceScope(req, scope)
    ) {
      throw { code: errorCode_e.PermissionDeniedError, message: "Permission denied" };
    }
  }

  private ensureBillService(req: AuthRequest, scope: string) {
    if (
      req.authData?.type !== "serviceToken"
      || req.authData.service !== "service_bill"
      || !hasServiceScope(req, scope)
    ) {
      throw {
        code: errorCode_e.PermissionDeniedError,
        message: "This endpoint is restricted to Service_Bill",
      };
    }
  }
}
