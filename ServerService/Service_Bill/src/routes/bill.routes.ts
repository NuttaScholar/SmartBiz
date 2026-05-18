import { Router } from "express";
import BillController from "../controllers/bill.controller";
import { Model } from "mongoose";
import { OrderDocument } from "../models/order.interface";

export default function billRoutes(OrderModel: Model<OrderDocument>) {
    const router = Router();
    const controller = new BillController(OrderModel);

    /**
     * 1. ขอข้อมูลใบสั่งซื้อตามชื่อลูกค้า และ หมายเลขคำสั่งซื้อ
     * GET /bill/search?customerName=xxx&orderID=xxx
     */
    router.get("/search", (req, res) => controller.searchOrders(req, res));

    /**
     * 2. ขอรายการคำสั่งซื้อตามสถานะ
     * GET /bill/status/:status
     */
    router.get("/status/:status", (req, res) => controller.getOrdersByStatus(req, res));

    /**
     * 3. สร้างคำสั่งซื้อใหม่
     * POST /bill
     */
    router.post("/", (req, res) => controller.createOrder(req, res));

    /**
     * 3. แก้ไขคำสั่งซื้อ
     * PUT /bill/:orderID
     */
    router.put("/:orderID", (req, res) => controller.updateOrder(req, res));

    /**
     * 4. ลบคำสั่งซื้อ
     * DELETE /bill/:orderID
     */
    router.delete("/:orderID", (req, res) => controller.deleteOrder(req, res));

    /**
     * เลื่อนไปยังสถานะถัดไป (Next Step)
     * PATCH /bill/:orderID/next
     */
    router.patch("/:orderID/next", (req, res) => controller.moveToNextStep(req, res));

    /**
     * เลือกเส้นทางเมื่ออยู่ในสถานะ "จัดการบิล"
     * PATCH /bill/:orderID/billing/income
     * PATCH /bill/:orderID/billing/debt
     */
    router.patch("/:orderID/billing/income", (req, res) => controller.markAsIncome(req, res));
    router.patch("/:orderID/billing/debt", (req, res) => controller.markAsDebt(req, res));

    /**
     * ดึงสถานะปัจจุบันของคำสั่งซื้อ
     * GET /bill/:orderID/status
     */
    router.get("/:orderID/status", (req, res) => controller.getStatus(req, res));

    return router;
}
