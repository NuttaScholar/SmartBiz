import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { PORT, WEB_HOSTS } from "./config";
import { connectDB } from "./database/mongo";
import { AuthMiddleware } from "./middlewares/auth";
import { ContactDocument } from "./models/contact.interface";
import { ContactSchema } from "./models/contact.model";
import { TransactionDocument } from "./models/transaction.interface";
import { TransactionSchema } from "./models/transaction.model";
import { WalletDocument } from "./models/wallet.interface";
import { WalletSchema } from "./models/wallet.model";
import contactRoutes from "./routes/contact.routes";
import transactionRoutes from "./routes/transaction.routes";
import walletRoutes from "./routes/wallet.routes";
import WalletService from "./services/wallet.service";

async function main() {
  await connectDB();

  const ContactModel = mongoose.model<ContactDocument>("contact", ContactSchema);
  const TransactionModel = mongoose.model<TransactionDocument>("transaction", TransactionSchema);
  const WalletModel = mongoose.model<WalletDocument>("wallet", WalletSchema);

  await new WalletService(WalletModel).ensureMainWallet().catch((err) => {
    console.log(err);
    console.log("Create Wallet Failed!");
  });

  const app = express();

  console.log("origins:", WEB_HOSTS);
  app.use(
    cors({
      origin: WEB_HOSTS,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  app.use("/contact", AuthMiddleware, contactRoutes(ContactModel, TransactionModel));
  app.use("/", AuthMiddleware, transactionRoutes(TransactionModel, WalletModel));
  app.use("/wallet", AuthMiddleware, walletRoutes(WalletModel));

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start Service_Account", err);
  process.exit(1);
});
