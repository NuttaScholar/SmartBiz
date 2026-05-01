import express from "express";
import billRoutes from "./routes/bill.routes";
import AuthMiddleware from "./middlewares/auth";

const app = express();
app.use(express.json());

app.use("/bill", AuthMiddleware, billRoutes);

/*********************************************** */
// Config
/*********************************************** */
const PORT = Number(process.env.PORT);

/*********************************************** */
// Start Server
/*********************************************** */
app.listen(PORT, () => {
  console.log(`Service_Bill running on port ${PORT}`);
});
