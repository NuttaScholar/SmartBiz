import { Router } from "express";
import HealthController from "../controllers/health.controller";

export default function healthRoutes(controller: HealthController): Router {
  const router = Router();

  router.get("/", controller.getHealth);

  return router;
}
