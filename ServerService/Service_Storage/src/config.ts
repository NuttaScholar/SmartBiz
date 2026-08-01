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

export const PORT = Number(process.env.PORT || 3000);
export const JWT_SECRET = requireEnv("SECRET") as Secret;
export const SERVICE_AUTH_SECRET = readServiceAuthSecret();
export const WEB_HOSTS = parseAllowedOrigins(
  process.env.WEB_HOSTS || requireEnv("WEB_HOST"),
);

export const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || "localhost";
export const MINIO_PORT = Number(process.env.MINIO_PORT || 9000);
export const MINIO_USE_SSL = (process.env.MINIO_USE_SSL || "false") === "true";
export const MINIO_USER = process.env.MINIO_USER || "";
export const MINIO_PASSWORD = process.env.MINIO_PASSWORD || "";

export const DEFAULT_BUCKET = "images";
export const PRODUCT_BUCKET = "product";
export const MAX_IMAGE_WIDTH = 720;
export const MAX_IMAGE_HEIGHT = 720;
