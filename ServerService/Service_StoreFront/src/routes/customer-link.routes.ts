import { Router } from "express";
import CustomerLinkController from "../controllers/customer-link.controller";
import {
  adminMiddleware,
  authMiddleware,
} from "../middlewares/auth";

export default function customerLinkRoutes(
  controller: CustomerLinkController,
): Router {
  const router = Router();

  router.use(authMiddleware, adminMiddleware);
  router.get("/", controller.listCustomerLinks);
  router.post("/", controller.createCustomerLink);
  router.get(
    "/:customerID/discounts",
    controller.getCustomerDiscounts,
  );
  router.put(
    "/:customerID/discounts",
    controller.updateCustomerDiscounts,
  );
  router.get("/:customerID", controller.getCustomerLink);
  router.patch(
    "/:customerID/token",
    controller.rotateCustomerToken,
  );

  return router;
}
