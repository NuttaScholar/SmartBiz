import { Router } from "express";
import CustomerLinkController from "../controllers/customer-link.controller";
import {
  adminOrServiceScope,
  authMiddleware,
} from "../middlewares/auth";

export default function customerLinkRoutes(
  controller: CustomerLinkController,
): Router {
  const router = Router();

  router.use(authMiddleware);
  router.get(
    "/",
    adminOrServiceScope("storefront.customer-link.read"),
    controller.listCustomerLinks,
  );
  router.post(
    "/",
    adminOrServiceScope("storefront.customer-link.manage"),
    controller.createCustomerLink,
  );
  router.get(
    "/:customerID/discounts",
    adminOrServiceScope("storefront.customer-link.read"),
    controller.getCustomerDiscounts,
  );
  router.put(
    "/:customerID/discounts",
    adminOrServiceScope("storefront.customer-link.manage"),
    controller.updateCustomerDiscounts,
  );
  router.get(
    "/:customerID",
    adminOrServiceScope("storefront.customer-link.read"),
    controller.getCustomerLink,
  );
  router.patch(
    "/:customerID/token",
    adminOrServiceScope("storefront.customer-link.manage"),
    controller.rotateCustomerToken,
  );

  return router;
}
