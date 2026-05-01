import { Request, Response } from "express";
import BillService from "../services/bill.service";

export default {
  async searchOrders(req: Request, res: Response) {
    const { customerName, orderID } = req.query;
    const data = await BillService.searchOrders(customerName as string, orderID as string);
    res.json({ success: true, data });
  },

  async getOrdersByStatus(req: Request, res: Response) {
    const { status } = req.params;
    const data = await BillService.getOrdersByStatus(status);
    res.json({ success: true, data });
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
    const { orderID } = req.params;
    const data = await BillService.moveToNextStep(orderID);
    res.json({ success: true, data });
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
