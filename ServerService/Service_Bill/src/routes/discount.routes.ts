import { Router } from "express";
import DiscountController from "../controllers/discount.controller";

const router = Router();

router.get("/:customerID", DiscountController.getDiscounts);
router.put("/:customerID", DiscountController.updateDiscounts);

export default router;
