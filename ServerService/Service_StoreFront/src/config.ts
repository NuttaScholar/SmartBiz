import dotenv from "dotenv";
import type { Secret } from "jsonwebtoken";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readPort(): number {
  const value = Number(process.env.PORT || 3005);
  if (!Number.isInteger(value) || value <= 0 || value > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  return value;
}

export const PORT = readPort();
export const JWT_SECRET = requireEnv("SECRET") as Secret;
export const WEB_HOST = requireEnv("WEB_HOST");
export const MONGO_URI_ACCOUNT = requireEnv("MONGO_URI_ACCOUNT");
export const MONGO_URI_STOCK = requireEnv("MONGO_URI_STOCK");
export const MONGO_URI_STOREFRONT = requireEnv("MONGO_URI_STOREFRONT");
export const SERVICE_ACCOUNT_URL =
  process.env.SERVICE_ACCOUNT_URL || "http://localhost:3000";
export const SERVICE_BILL_URL =
  process.env.SERVICE_BILL_URL || "http://localhost:3004";
export const SERVICE_STOCK_URL =
  process.env.SERVICE_STOCK_URL || "http://localhost:3003";

export const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || "localhost";
export const MINIO_PORT = Number(process.env.MINIO_PORT || 9000);
export const MINIO_USE_SSL =
  (process.env.MINIO_USE_SSL || "false") === "true";
export const MINIO_USER = requireEnv("MINIO_USER");
export const MINIO_PASSWORD = requireEnv("MINIO_PASSWORD");
export const PAYMENT_EVIDENCE_BUCKET =
  process.env.PAYMENT_EVIDENCE_BUCKET || "storefront-payment";
export const EVIDENCE_URL_EXPIRY_SECONDS = 15 * 60;
