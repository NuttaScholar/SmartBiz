import { Router } from "express";
import BillController from "../controllers/bill.controller";

const router = Router();

/**
 * 1. ขอข้อมูลใบสั่งซื้อตามชื่อลูกค้า และ หมายเลขคำสั่งซื้อ
 * GET /bill/search?customerName=xxx&orderID=xxx
 */
router.get("/search", BillController.searchOrders);

/**
 * 2. ขอรายการคำสั่งซื้อตามสถานะ
 * GET /bill/status/:status
 */
router.get("/status/:status", BillController.getOrdersByStatus);

/**
 * 3. สร้างคำสั่งซื้อใหม่
 * POST /bill
 */
router.post("/", BillController.createOrder);

/**
 * 3. แก้ไขคำสั่งซื้อ
 * PUT /bill/:orderID
 */
router.put("/:orderID", BillController.updateOrder);

/**
 * 4. ลบคำสั่งซื้อ
 * DELETE /bill/:orderID
 */
router.delete("/:orderID", BillController.deleteOrder);

/**
 * เลื่อนไปยังสถานะถัดไป (Next Step)
 * PATCH /bill/:orderID/next
 */
router.patch("/:orderID/next", BillController.moveToNextStep);

/**
 * เลือกเส้นทางเมื่ออยู่ในสถานะ "จัดการบิล"
 * PATCH /bill/:orderID/billing/income
 * PATCH /bill/:orderID/billing/debt
 */
router.patch("/:orderID/billing/income", BillController.markAsIncome);
router.patch("/:orderID/billing/debt", BillController.markAsDebt);

/**
 * ดึงสถานะปัจจุบันของคำสั่งซื้อ
 * GET /bill/:orderID/status
 */
router.get("/:orderID/status", BillController.getStatus);

export default router;
