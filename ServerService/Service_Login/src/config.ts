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

export const PORT = Number(process.env.PORT || 3000);
export const JWT_SECRET = requireEnv("SECRET") as Secret;
export const WEB_HOSTS = parseAllowedOrigins(
  process.env.WEB_HOSTS || requireEnv("WEB_HOST"),
);
export const DB_URL = requireEnv("DB_URL");
export const DEFAULT_PASSWORD = "Default";
export const SALT_ROUNDS = 10;
