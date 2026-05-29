import { Response } from "express";
import { Model } from "mongoose";
import { LogDocument } from "../models/log.interface";
import { ProductDocument } from "../models/product.interface";
import { AuthRequest } from "../middlewares/auth";
import StockService from "../services/stock.service";
import StorageService from "../services/storage.service";
import { productInfo_t } from "../type";
import { errorCode_e, role_e } from "../utils/enum";

export default class ProductController {
  private service: StockService;

  constructor(ProductModel: Model<ProductDocument>, LogModel: Model<LogDocument>, storageService: StorageService) {
    this.service = new StockService(ProductModel, LogModel, storageService);
  }

  async createProduct(req: AuthRequest, res: Response) {
    try {
      this.ensureAdmin(req);
      await this.service.createProduct(req.body as productInfo_t, req.file);
      return res.send({ status: "success" });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async updateProduct(req: AuthRequest, res: Response) {
    try {
      this.ensureAdmin(req);
      await this.service.updateProduct(req.body as productInfo_t, req.file);
      return res.send({ status: "success" });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async getProducts(req: AuthRequest, res: Response) {
    try {
      this.ensureStockReader(req);
      const { type, name, status } = req.query;
      const result = await this.service.getProducts(type as string, name as string, status as string);
      return res.send({ status: "success", result });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  async deleteProduct(req: AuthRequest, res: Response) {
    try {
      this.ensureAdmin(req);
      await this.service.deleteProduct(req.query.id as string, req.headers.authorization);
      return res.send({ status: "success" });
    } catch (err: any) {
      return handleError(res, err);
    }
  }

  private ensureAdmin(req: AuthRequest) {
    if (req.authData?.role !== role_e.admin) {
      throw { code: errorCode_e.PermissionDeniedError, message: "Permission denied" };
    }
  }

  private ensureStockReader(req: AuthRequest) {
    if (
      req.authData?.role !== role_e.admin &&
      req.authData?.role !== role_e.cashier
    ) {
      throw { code: errorCode_e.PermissionDeniedError, message: "Permission denied" };
    }
  }
}

export function handleError(res: Response, err: any) {
  console.error(err);
  return res.send({
    status: "error",
    errCode: err?.code || errorCode_e.UnknownError,
  });
}
