import express from "express";
import billRoutes from "./routes/bill.routes";
import AuthMiddleware from "./middlewares/auth";
import { connectMongo } from "./database/mongo";
import dotenv from 'dotenv';

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
connectMongo().then(() => {
  app.use("/bill", AuthMiddleware, billRoutes);
  app.listen(PORT, () => {
    console.log(`Service_Bill running on port ${PORT}`);
  });
});
