import { Router } from "express";
import { getBillByOrderID } from "../controllers/bill.controller";

const router = Router();

router.get("/order/:orderID", getBillByOrderID); 


export default router;
