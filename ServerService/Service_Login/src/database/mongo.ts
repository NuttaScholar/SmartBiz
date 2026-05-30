import mongoose from "mongoose";
import { DB_URL } from "../config";

export async function connectDB() {
  await mongoose.connect(DB_URL);
  console.log("[DB] Login connected");
  return mongoose.connection;
}
