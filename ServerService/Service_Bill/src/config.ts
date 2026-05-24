import dotenv from "dotenv";
import type { Secret } from "jsonwebtoken";
import path from "path";

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../Service_Stock/.env") });

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readPort() {
  const value = Number(process.env.PORT || 3000);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error("PORT must be a positive integer");
  }

  return value;
}

export const PORT = readPort();
export const JWT_SECRET = requireEnv("SECRET") as Secret;
export const WEB_HOST = requireEnv("WEB_HOST");
export const MONGO_URI_ACCOUNT = requireEnv("MONGO_URI_ACCOUNT");
export const MONGO_URI_BILL = requireEnv("MONGO_URI_BILL");
export const MONGO_URI_STOCK = process.env.MONGO_URI_STOCK || requireEnv("DB_URL");
export const SERVICE_ACCOUNT_URL = process.env.SERVICE_ACCOUNT_URL || "http://localhost:3000";
