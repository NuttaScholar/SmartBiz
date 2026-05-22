import { Router } from "express";
import { Model } from "mongoose";
import ProductController from "../controllers/product.controller";
import { LogDocument } from "../models/log.interface";
import { ProductDocument } from "../models/product.interface";
import StorageService from "../services/storage.service";
import { upload } from "../middlewares/upload";

export default function productRoutes(
  ProductModel: Model<ProductDocument>,
  LogModel: Model<LogDocument>,
  storageService: StorageService,
) {
  const router = Router();
  const controller = new ProductController(ProductModel, LogModel, storageService);

  router.post("/", upload.single("file"), (req, res) => controller.createProduct(req, res));
  router.put("/", upload.single("file"), (req, res) => controller.updateProduct(req, res));
  router.get("/", (req, res) => controller.getProducts(req, res));
  router.delete("/", (req, res) => controller.deleteProduct(req, res));

  return router;
}
