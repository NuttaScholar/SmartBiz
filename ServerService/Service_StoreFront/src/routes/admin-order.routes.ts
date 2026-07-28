import { Router } from "express";
import AdminOrderController from "../controllers/admin-order.controller";
import {
  adminMiddleware,
  authMiddleware,
} from "../middlewares/auth";

export default function adminOrderRoutes(
  controller: AdminOrderController,
): Router {
  const router = Router();

  router.use(authMiddleware, adminMiddleware);
  router.patch("/:orderID/payment-confirmation", controller.confirmPayment);

  return router;
}
