import dotenv from "dotenv";
import type { Secret } from "jsonwebtoken";
import path from "path";
import { parseAllowedOrigins } from "./utils/cors-origin";

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../Service_Stock/.env") });

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
export const MONGO_URI_ACCOUNT = requireEnv("MONGO_URI_ACCOUNT");
export const MONGO_URI_BILL = requireEnv("MONGO_URI_BILL");
export const MONGO_URI_STOCK = process.env.MONGO_URI_STOCK || requireEnv("DB_URL");
export const SERVICE_ACCOUNT_URL = process.env.SERVICE_ACCOUNT_URL || "http://localhost:3000";
export const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || "localhost";
export const MINIO_PORT = Number(process.env.MINIO_PORT || 9000);
export const MINIO_USE_SSL =
  (process.env.MINIO_USE_SSL || "false") === "true";
export const MINIO_HOST =
  `${MINIO_USE_SSL ? "https" : "http"}://${MINIO_ENDPOINT}:${MINIO_PORT}`;
