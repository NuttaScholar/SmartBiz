import dotenv from "dotenv";
import type { Secret } from "jsonwebtoken";

dotenv.config();

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
export const DB_URL = requireEnv("DB_URL");
export const SERVICE_ACCOUNT_URL = requireEnv("SERVICE_ACCOUNT_URL");

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
