import cors from "cors";
import express from "express";
import { PORT, WEB_HOST } from "./config";
import HealthController from "./controllers/health.controller";
import { connectDB, disconnectDB } from "./database/mongo";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error-handler";
import healthRoutes from "./routes/health.routes";
import HealthService from "./services/health.service";

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
  app.use(express.json());

  const healthController = new HealthController(
    new HealthService(databases),
  );
  app.use("/health", healthRoutes(healthController));

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
