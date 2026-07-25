import cors from "cors";
import express from "express";
import { PORT, WEB_HOST } from "./config";
import CustomerLinkController from "./controllers/customer-link.controller";
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
import type { ContactDocument } from "./models/contact.interface";
import { ContactSchema } from "./models/contact.model";
import type { ProductDocument } from "./models/product.interface";
import { ProductSchema } from "./models/product.model";
import type { StorefrontAccessDocument } from "./models/storefront-access.interface";
import { StorefrontAccessSchema } from "./models/storefront-access.model";
import type { StorefrontOrderDocument } from "./models/storefront-order.interface";
import { StorefrontOrderSchema } from "./models/storefront-order.model";
import ProductRepo from "./repositories/product.repo";
import ContactRepo from "./repositories/contact.repo";
import StorefrontAccessRepo from "./repositories/storefront-access.repo";
import StorefrontOrderRepo from "./repositories/storefront-order.repo";
import healthRoutes from "./routes/health.routes";
import customerLinkRoutes from "./routes/customer-link.routes";
import storefrontRoutes from "./routes/storefront.routes";
import CustomerLinkService from "./services/customer-link.service";
import HealthService from "./services/health.service";
import StorefrontService from "./services/storefront.service";

async function startServer(): Promise<void> {
  const databases = await connectDB();
  const app = express();

  app.disable("x-powered-by");
  app.use(
    cors({
      origin: WEB_HOST,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "3mb" }));

  const contactModel = getDB("Account").model<ContactDocument>(
    "contact",
    ContactSchema,
  );
  const productModel = getDB("Stock").model<ProductDocument>(
    "product",
    ProductSchema,
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
  const storefrontController = new StorefrontController(
    new StorefrontService(
      new StorefrontAccessRepo(accessModel),
      new ProductRepo(productModel),
      new StorefrontOrderRepo(orderModel),
    ),
  );
  const customerLinkController = new CustomerLinkController(
    new CustomerLinkService(
      new ContactRepo(contactModel),
      new StorefrontAccessRepo(accessModel),
    ),
  );
  app.use("/health", healthRoutes(healthController));
  app.use(
    "/storefront/admin/customer-links",
    customerLinkRoutes(customerLinkController),
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
