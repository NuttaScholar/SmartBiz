import express from "express";
import billRoutes from "./routes/bill.routes";
import AuthMiddleware from "./middlewares/auth";
import { connectDB, getDB } from "./database/mongo";
import discountRoutes from "./routes/discount.routes";
import dotenv from 'dotenv';
import { OrderDocument } from "./models/order.interface";
import { OrderSchema } from "./models/order.model";
import { DiscountDocument } from "./models/discount.interface";
import { DiscountSchema } from "./models/discount.model";
import { ContactDocument } from "./models/contact.interface";
import { ContactSchema } from "./models/contact.model";

const app = express();
app.use(express.json());
dotenv.config();


/*********************************************** */
// Config
/*********************************************** */
const PORT = Number(process.env.PORT) || 3000;

/*********************************************** */
// Start Server
/*********************************************** */
async function startServer() {
  // ⭐ รอให้เชื่อมต่อทั้ง Account และ Bill
  const dbs = await connectDB();
  console.log("Databases connected:", Object.keys(dbs));

   // ⭐ สร้าง Model หลัง DB เชื่อมต่อแล้ว
  const OrderModel = getDB("Bill").model<OrderDocument>("Order", OrderSchema);
  const DiscountModel = getDB("Bill").model<DiscountDocument>("Discount", DiscountSchema); // ⭐ สมมติชื่อเดียวกับไฟล์ model
  const ContactModel = getDB("Account").model<ContactDocument>("contact", ContactSchema);

  // ⭐ ส่ง model เข้า routes (ถ้าต้องการ)
  app.use("/bill", AuthMiddleware, billRoutes(OrderModel, ContactModel));
  app.use("/discount", AuthMiddleware, discountRoutes(DiscountModel, ContactModel));
  
  app.listen(PORT, () => {
    console.log(`Bill Service running on port ${PORT}`);
  });
}

startServer();
