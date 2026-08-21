import { Router } from "express";
import { Model } from "mongoose";
import StockController from "../controllers/stock.controller";
import { upload } from "../middlewares/upload";
import { LogDocument } from "../models/log.interface";
import { LogAuditDocument } from "../models/log-audit.interface";
import { ProductDocument } from "../models/product.interface";
import StorageService from "../services/storage.service";

export default function stockRoutes(
  ProductModel: Model<ProductDocument>,
  LogModel: Model<LogDocument>,
  LogAuditModel: Model<LogAuditDocument>,
  storageService: StorageService,
) {
  const router = Router();
  const controller = new StockController(
    ProductModel,
    LogModel,
    LogAuditModel,
    storageService,
  );

  router.post("/stock_in", upload.single("file"), (req, res) => controller.stockIn(req, res));
  router.post("/stock_out", (req, res) => controller.stockOut(req, res));
  router.post("/stock/adjust", (req, res) => controller.adjustStock(req, res));
  router.get("/log", (req, res) => controller.getLog(req, res));
  router.get("/status", (req, res) => controller.getStatus(req, res));
  router.get("/stock", (req, res) => controller.getStock(req, res));

  return router;
}
