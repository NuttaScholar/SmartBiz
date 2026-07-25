import { Router } from "express";
import StorefrontController from "../controllers/storefront.controller";

export default function storefrontRoutes(
  controller: StorefrontController,
): Router {
  const router = Router();

  router.get("/:customerToken/session", controller.getSession);
  router.get("/:customerToken/products", controller.getProducts);
  router.get("/:customerToken/orders", controller.getOrders);
  router.post("/:customerToken/orders", controller.createOrder);
  router.get("/:customerToken/orders/:orderID", controller.getOrder);
  router.patch(
    "/:customerToken/orders/:orderID/evidence",
    controller.updateEvidence,
  );
  router.delete(
    "/:customerToken/orders/:orderID",
    controller.cancelOrder,
  );

  return router;
}
