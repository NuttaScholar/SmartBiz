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

function readServiceAuthSecret(): Secret {
  const value = requireEnv("SERVICE_AUTH_SECRET");
  if (value.length < 32) {
    throw new Error("SERVICE_AUTH_SECRET must be at least 32 characters");
  }
  if (value === process.env.SECRET) {
    throw new Error("SERVICE_AUTH_SECRET must differ from SECRET");
  }
  return value as Secret;
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
export const SERVICE_AUTH_SECRET = readServiceAuthSecret();
export const WEB_HOST = requireEnv("WEB_HOST");
export const MONGO_URI_ACCOUNT = requireEnv("MONGO_URI_ACCOUNT");
export const MONGO_URI_BILL = requireEnv("MONGO_URI_BILL");
export const MONGO_URI_STOCK = requireEnv("MONGO_URI_STOCK");
export const MONGO_URI_STOREFRONT = requireEnv("MONGO_URI_STOREFRONT");
export const SERVICE_BILL_URL =
  process.env.SERVICE_BILL_URL || "http://localhost:3004";
const configuredBillTimeout = Number(
  process.env.BILL_REQUEST_TIMEOUT_MS || 10_000,
);
if (!Number.isFinite(configuredBillTimeout) || configuredBillTimeout <= 0) {
  throw new Error("BILL_REQUEST_TIMEOUT_MS must be a positive number");
}
export const BILL_REQUEST_TIMEOUT_MS = configuredBillTimeout;

export const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || "localhost";
export const MINIO_PORT = Number(process.env.MINIO_PORT || 9000);
export const MINIO_USE_SSL =
  (process.env.MINIO_USE_SSL || "false") === "true";
export const MINIO_HOST =
  `${MINIO_USE_SSL ? "https" : "http"}://${MINIO_ENDPOINT}:${MINIO_PORT}`;
export const MINIO_USER = requireEnv("MINIO_USER");
export const MINIO_PASSWORD = requireEnv("MINIO_PASSWORD");
export const PAYMENT_EVIDENCE_BUCKET =
  process.env.PAYMENT_EVIDENCE_BUCKET || "storefront-payment";
export const EVIDENCE_URL_EXPIRY_SECONDS = 15 * 60;
