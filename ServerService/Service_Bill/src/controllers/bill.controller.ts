import { Request, Response } from "express";
import BillService from "../services/bill.service";
import { OrderStatus } from "../models/order.enum";

export default {
  async searchOrders(req: Request, res: Response) {
    const { customerName, orderID } = req.query;
    const data = await BillService.searchOrders(customerName as string, orderID as string);
    res.json({ success: true, data });
  },

  async getOrdersByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;
      const statusNum = Number(status);

      // ตรวจสอบว่าเป็นตัวเลขจริง
      if (isNaN(statusNum)) {
        return res.status(400).json({
          success: false,
          message: "Status must be a number"
        });
      }

      // ตรวจสอบว่าอยู่ใน enum
      if (!Object.values(OrderStatus).includes(statusNum)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status"
        });
      }

      const data = await BillService.getOrdersByStatus(statusNum);

      return res.json({ success: true, data });

    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  },

  async createOrder(req: Request, res: Response) {
    const data = await BillService.createOrder(req.body);
    res.json({ success: true, data });
  },

  async updateOrder(req: Request, res: Response) {
    const { orderID } = req.params;
    const data = await BillService.updateOrder(orderID, req.body);
    res.json({ success: true, data });
  },

  async deleteOrder(req: Request, res: Response) {
    const { orderID } = req.params;
    await BillService.deleteOrder(orderID);
    res.json({ success: true, message: "Order deleted" });
  },

  async moveToNextStep(req: Request, res: Response) {
    try {
      const { orderID } = req.params;
      const data = await BillService.moveToNextStep(orderID);

      return res.json({ success: true, data });      
    } catch (err: any) {
      // กรณี service ส่ง error แบบ object { code, message }
      if (err.code) {
        return res.status(400).json({
          success: false,
          errorCode: err.code,
          message: err.message
        });
      }
      // กรณีเป็น Error ปกติ เช่น throw new Error("Order not found")
      return res.status(400).json({
        success: false,
        message: err.message || "Unknown error"
      });
    }
  },

  async markAsIncome(req: Request, res: Response) {
    const { orderID } = req.params;
    const data = await BillService.markAsIncome(orderID);
    res.json({ success: true, data });
  },

  async markAsDebt(req: Request, res: Response) {
    const { orderID } = req.params;
    const data = await BillService.markAsDebt(orderID);
    res.json({ success: true, data });
  },

  async getStatus(req: Request, res: Response) {
    const { orderID } = req.params;
    const data = await BillService.getStatus(orderID);
    res.json({ success: true, data });
  },
};
