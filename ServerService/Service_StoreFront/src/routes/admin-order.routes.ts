import { Router } from "express";
import AdminOrderController from "../controllers/admin-order.controller";
import {
  adminOrServiceScope,
  authMiddleware,
} from "../middlewares/auth";

export default function adminOrderRoutes(
  controller: AdminOrderController,
): Router {
  const router = Router();

  router.use(authMiddleware);
  router.patch(
    "/:orderID/payment-confirmation",
    adminOrServiceScope("storefront.payment.confirm"),
    controller.confirmPayment,
  );

  return router;
}
