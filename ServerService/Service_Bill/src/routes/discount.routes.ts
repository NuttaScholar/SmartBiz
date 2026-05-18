import { Router } from "express";
import DiscountController from "../controllers/discount.controller";
import { Model } from "mongoose";
import { DiscountDocument } from "../models/discount.interface";

export default function discountRoutes(DiscountModel: Model<DiscountDocument>) {
    const router = Router();
    const controller = new DiscountController(DiscountModel);

    router.get("/:customerID", (req, res) => controller.getDiscounts(req, res));
    router.put("/:customerID", (req, res) => controller.updateDiscounts(req, res));

    return router;
}

