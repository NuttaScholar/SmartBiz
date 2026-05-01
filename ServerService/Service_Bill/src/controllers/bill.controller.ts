import { Request, Response } from "express";
import BillService from "../services/bill.service";

export const getBillByOrderID = async (req: Request, res: Response) => {
  try {
    const { orderID } = req.params;
    const data = await BillService.getBillByOrderID(orderID);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
