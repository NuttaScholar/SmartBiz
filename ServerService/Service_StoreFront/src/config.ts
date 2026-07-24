import dotenv from "dotenv";

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
export const WEB_HOST = requireEnv("WEB_HOST");
export const MONGO_URI_STOCK = requireEnv("MONGO_URI_STOCK");
export const MONGO_URI_STOREFRONT = requireEnv("MONGO_URI_STOREFRONT");
export const SERVICE_ACCOUNT_URL =
  process.env.SERVICE_ACCOUNT_URL || "http://localhost:3000";
export const SERVICE_BILL_URL =
  process.env.SERVICE_BILL_URL || "http://localhost:3004";
export const SERVICE_STOCK_URL =
  process.env.SERVICE_STOCK_URL || "http://localhost:3003";
