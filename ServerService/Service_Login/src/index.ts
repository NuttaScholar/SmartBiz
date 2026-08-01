import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { PORT, WEB_HOSTS } from "./config";
import { connectDB } from "./database/mongo";
import { ProfileDocument } from "./models/profile.interface";
import { ProfileSchema } from "./models/profile.model";
import userRoutes from "./routes/user.routes";
import UserService from "./services/user.service";

async function startServer() {
  await connectDB();

  const UserModel = mongoose.model<ProfileDocument>("Profile", ProfileSchema);
  await new UserService(UserModel).ensureDefaultUser();

  const app = express();
  console.log("origins:", WEB_HOSTS);
  app.use(
    cors({
      origin: WEB_HOSTS,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.use("/", userRoutes(UserModel));

  app.listen(PORT, () => {
    console.log(`Login Service running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start Login Service:", err);
  process.exit(1);
});
