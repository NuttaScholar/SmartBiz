import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import AuthMiddleware from "./middlewares/auth";
import { connectDB } from "./database/mongo";
import { ProductDocument } from "./models/product.interface";
import { ProductSchema } from "./models/product.model";
import { LogDocument } from "./models/log.interface";
import { LogSchema } from "./models/log.model";
import productRoutes from "./routes/product.routes";
import stockRoutes from "./routes/stock.routes";
import StorageService from "./services/storage.service";
import { BILL_BUCKET, DEFAULT_BUCKET, PORT, WEB_HOSTS } from "./config";
import ProductRepo from "./repositories/product.repo";

const app = express();

app.use(
  cors({
    origin: WEB_HOSTS,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

async function startServer() {
  const db = await connectDB();
  const ProductModel = db.model<ProductDocument>("product", ProductSchema);
  const LogModel = db.model<LogDocument>("log", LogSchema);
  const storageService = new StorageService();

  await new ProductRepo(ProductModel).initializeAnotherInventory();
  await storageService.initBucket(DEFAULT_BUCKET, false);
  await storageService.initBucket(BILL_BUCKET, true);

  app.use("/product", AuthMiddleware, productRoutes(ProductModel, LogModel, storageService));
  app.use("/", AuthMiddleware, stockRoutes(ProductModel, LogModel, storageService));

  app.listen(PORT, () => {
    console.log(`Stock Service running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start Stock Service:", err);
  process.exit(1);
});
