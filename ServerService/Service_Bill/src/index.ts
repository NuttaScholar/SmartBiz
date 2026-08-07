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
import { ProductDocument } from "./models/product.interface";
import { ProductSchema } from "./models/product.model";
import cors from "cors";
import { PORT, WEB_HOSTS } from "./config";

const app = express();
app.use(
  cors({
    origin: WEB_HOSTS,
    credentials: true,
  }),
);
app.use(express.json());
dotenv.config();



/*********************************************** */
// Start Server
/*********************************************** */
async function startServer() {
  // ⭐ รอให้เชื่อมต่อทั้ง Account และ Bill
  const dbs = await connectDB();
  console.log("Databases connected:", Object.keys(dbs));

   // ⭐ สร้าง Model หลัง DB เชื่อมต่อแล้ว
  const OrderModel = getDB("Bill").model<OrderDocument>("Order", OrderSchema);
  await OrderModel.createIndexes();
  const DiscountModel = getDB("Bill").model<DiscountDocument>("Discount", DiscountSchema); // ⭐ สมมติชื่อเดียวกับไฟล์ model
  const ContactModel = getDB("Account").model<ContactDocument>("contact", ContactSchema);
  const ProductModel = getDB("Stock").model<ProductDocument>("product", ProductSchema);

  // ⭐ ส่ง model เข้า routes (ถ้าต้องการ)
  app.use("/bill", AuthMiddleware, billRoutes(OrderModel, ContactModel, ProductModel));
  app.use("/discount", AuthMiddleware, discountRoutes(DiscountModel, ContactModel));

  app.listen(PORT, () => {
    console.log(`Bill Service running on port ${PORT}`);
  });
}

startServer();
