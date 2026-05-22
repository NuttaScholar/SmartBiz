import { Response } from "express";
import { Model } from "mongoose";
import { LogDocument } from "../models/log.interface";
import { ProductDocument } from "../models/product.interface";
import { AuthRequest } from "../middlewares/auth";
import StockService from "../services/stock.service";
import StorageService from "../services/storage.service";
import { stockOutForm_t } from "../type";
import { errorCode_e, role_e } from "../utils/enum";
import { handleError } from "./product.controller";

export default class StockController {
  private service: StockService;

  constructor(ProductModel: Model<ProductDocument>, LogModel: Model<LogDocument>, storageService: StorageService) {
    this.service = new StockService(ProductModel, LogModel, storageService);
  }

  async stockIn(req: AuthRequest, res: Response) {
    try {
      this.ensureAdmin(req);
      const { products, who } = req.body as { products?: string; who?: string };
      const token = req.headers.authorization!.split(" ")[1];
      const errors = await this.service.stockIn(token, products, who, req.file);
      return res.send(errors.length ? { status: "warning", result: errors } : { status: "success" });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async stockOut(req: AuthRequest, res: Response) {
    try {
      this.ensureAdmin(req);
      const errors = await this.service.stockOut(req.body as stockOutForm_t);
      return res.send(errors.length ? { status: "warning", result: errors } : { status: "success" });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async getLog(req: AuthRequest, res: Response) {
    try {
      this.ensureAdmin(req);
      const { id, type, index, size } = req.query;
      const result = await this.service.getLog(id as string, type as string, index as string, size as string);
      return res.send({ status: "success", result });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async getStatus(req: AuthRequest, res: Response) {
    try {
      this.ensureAdmin(req);
      const result = await this.service.getStatus();
      return res.send({ status: "success", result });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async getStock(req: AuthRequest, res: Response) {
    try {
      this.ensureAdmin(req);
      const result = await this.service.getStock();
      return res.send({ status: "success", result });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  private ensureAdmin(req: AuthRequest) {
    if (req.authData?.role !== role_e.admin) {
      throw { code: errorCode_e.PermissionDeniedError, message: "Permission denied" };
    }
  }
}
