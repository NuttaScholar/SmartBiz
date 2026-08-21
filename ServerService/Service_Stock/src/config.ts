import dotenv from "dotenv";
import type { Secret } from "jsonwebtoken";
import { parseAllowedOrigins } from "./utils/cors-origin";

dotenv.config();

function requireEnv(name: string) {
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

function readPort() {
  const value = Number(process.env.PORT || 3000);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error("PORT must be a positive integer");
  }

  return value;
}

export const PORT = readPort();
export const JWT_SECRET = requireEnv("SECRET") as Secret;
export const SERVICE_AUTH_SECRET = readServiceAuthSecret();
export const WEB_HOSTS = parseAllowedOrigins(
  process.env.WEB_HOSTS || requireEnv("WEB_HOST"),
);
export const DB_URL = requireEnv("DB_URL");
export const SERVICE_ACCOUNT_URL = requireEnv("SERVICE_ACCOUNT_URL");
export const SERVICE_BILL_URL = process.env.SERVICE_BILL_URL || "http://localhost:3004";

const retentionDays = Number(process.env.LOG_AUDIT_RETENTION_DAYS || 365);
if (!Number.isInteger(retentionDays) || retentionDays <= 0) {
  throw new Error("LOG_AUDIT_RETENTION_DAYS must be a positive integer");
}
export const LOG_AUDIT_RETENTION_DAYS = retentionDays;

export const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || "localhost";
export const MINIO_PORT = Number(process.env.MINIO_PORT || 9000);
export const MINIO_USE_SSL = (process.env.MINIO_USE_SSL || "false") === "true";
export const MINIO_USER = process.env.MINIO_USER || "";
export const MINIO_PASSWORD = process.env.MINIO_PASSWORD || "";
export const MINIO_HOST = `http://${MINIO_ENDPOINT}:${MINIO_PORT}`;

export const DEFAULT_BUCKET = "product";
export const BILL_BUCKET = "bill";
export const MAX_IMAGE_WIDTH = 720;
export const MAX_IMAGE_HEIGHT = 720;
