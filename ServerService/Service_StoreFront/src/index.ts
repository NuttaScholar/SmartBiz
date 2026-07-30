import cors from "cors";
import express from "express";
import { MINIO_HOST, PORT, WEB_HOST } from "./config";
import CustomerLinkController from "./controllers/customer-link.controller";
import AdminOrderController from "./controllers/admin-order.controller";
import HealthController from "./controllers/health.controller";
import StorefrontController from "./controllers/storefront.controller";
import {
  connectDB,
  disconnectDB,
  getDB,
} from "./database/mongo";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error-handler";
import requestContext from "./middlewares/request-context";
import type { ContactDocument } from "./models/contact.interface";
import { ContactSchema } from "./models/contact.model";
import type { DiscountDocument } from "./models/discount.interface";
import { DiscountSchema } from "./models/discount.model";
import type { ProductDocument } from "./models/product.interface";
import { ProductSchema } from "./models/product.model";
import type { StorefrontAccessDocument } from "./models/storefront-access.interface";
import { StorefrontAccessSchema } from "./models/storefront-access.model";
import type { StorefrontOrderDocument } from "./models/storefront-order.interface";
import { StorefrontOrderSchema } from "./models/storefront-order.model";
import ProductRepo from "./repositories/product.repo";
import ContactRepo from "./repositories/contact.repo";
import DiscountRepo from "./repositories/discount.repo";
import StorefrontAccessRepo from "./repositories/storefront-access.repo";
import StorefrontOrderRepo from "./repositories/storefront-order.repo";
import healthRoutes from "./routes/health.routes";
import customerLinkRoutes from "./routes/customer-link.routes";
import adminOrderRoutes from "./routes/admin-order.routes";
import storefrontRoutes from "./routes/storefront.routes";
import CustomerLinkService from "./services/customer-link.service";
import AdminOrderService from "./services/admin-order.service";
import BillClientService from "./services/bill-client.service";
import EvidenceStorageService from "./services/evidence-storage.service";
import HealthService from "./services/health.service";
import StorefrontService from "./services/storefront.service";

async function startServer(): Promise<void> {
  const databases = await connectDB();
  const evidenceStorage = new EvidenceStorageService();
  await evidenceStorage.initPrivateBucket();
  const app = express();

  app.disable("x-powered-by");
  app.use(
    cors({
      origin: WEB_HOST,
      credentials: true,
      exposedHeaders: ["X-Request-ID"],
    }),
  );
  app.use(requestContext);
  app.use(express.json({ limit: "3mb" }));

  const contactModel = getDB("Account").model<ContactDocument>(
    "contact",
    ContactSchema,
  );
  const productModel = getDB("Stock").model<ProductDocument>(
    "product",
    ProductSchema,
  );
  const discountModel = getDB("Bill").model<DiscountDocument>(
    "Discount",
    DiscountSchema,
    "discounts",
  );
  const accessModel = getDB("StoreFront").model<StorefrontAccessDocument>(
    "StorefrontAccess",
    StorefrontAccessSchema,
  );
  const orderModel = getDB("StoreFront").model<StorefrontOrderDocument>(
    "StorefrontOrder",
    StorefrontOrderSchema,
  );

  const healthController = new HealthController(
    new HealthService(databases),
  );
  const discountRepo = new DiscountRepo(discountModel);
  const billClient = new BillClientService();
  const storefrontController = new StorefrontController(
    new StorefrontService(
      new StorefrontAccessRepo(accessModel),
      new ProductRepo(productModel),
      discountRepo,
      new StorefrontOrderRepo(orderModel),
      evidenceStorage,
      MINIO_HOST,
    ),
  );
  const customerLinkController = new CustomerLinkController(
    new CustomerLinkService(
      new ContactRepo(contactModel),
      new StorefrontAccessRepo(accessModel),
      discountRepo,
    ),
  );
  const adminOrderController = new AdminOrderController(
    new AdminOrderService(
      new StorefrontOrderRepo(orderModel),
      billClient,
    ),
  );
  app.use("/health", healthRoutes(healthController));
  app.use(
    "/storefront/admin/customer-links",
    customerLinkRoutes(customerLinkController),
  );
  app.use(
    "/storefront/admin/orders",
    adminOrderRoutes(adminOrderController),
  );
  app.use("/storefront", storefrontRoutes(storefrontController));

  app.use(notFoundHandler);
  app.use(errorHandler);

  const server = app.listen(PORT, () => {
    console.log(`StoreFront Service running on port ${PORT}`);
  });

  const shutdown = (signal: NodeJS.Signals): void => {
    console.log(`${signal} received, shutting down`);
    server.close(() => {
      disconnectDB()
        .then(() => process.exit(0))
        .catch((error) => {
          console.error("Failed to disconnect databases", error);
          process.exit(1);
        });
    });
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

startServer().catch((error) => {
  console.error("Failed to start StoreFront Service:", error);
  process.exit(1);
});
