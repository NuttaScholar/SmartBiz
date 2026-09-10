import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { DEFAULT_BUCKET, PORT, PRODUCT_BUCKET, WEB_HOSTS } from "./config";
import AuthMiddleware from "./middlewares/auth";
import storageRoutes from "./routes/storage.routes";
import StorageService from "./services/storage.service";

async function startServer() {
  const storageService = new StorageService();
  await storageService.initBucket(DEFAULT_BUCKET, false);
  await storageService.initBucket(PRODUCT_BUCKET, false);

  const app = express();
  app.get("/readyz", async (_req, res) => {
    const ready = await storageService.isReady();
    res.status(ready ? 200 : 503).json({ status: ready ? "ok" : "unavailable" });
  });
  console.log("origins:", WEB_HOSTS);
  app.use(
    cors({
      origin: WEB_HOSTS,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.use("/", AuthMiddleware, storageRoutes(storageService));

  app.listen(PORT, () => {
    console.log(`Storage Service running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start Storage Service:", err);
  process.exit(1);
});
