import dotenv from "dotenv";
import type { Secret } from "jsonwebtoken";

dotenv.config();

export const PORT = Number(process.env.PORT || 3000);
export const JWT_SECRET = process.env.SECRET as Secret;
export const WEB_HOST = process.env.WEB_HOST as string;

export const BILL_BUCKET = "bill";
export const MAX_IMAGE_WIDTH = 720;
export const MAX_IMAGE_HEIGHT = 720;

export const MINIO_CONFIG = {
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: Number(process.env.MINIO_PORT || 9000),
  useSSL: (process.env.MINIO_USE_SSL || "false") === "true",
  accessKey: process.env.MINIO_USER || "",
  secretKey: process.env.MINIO_PASSWORD || "",
};

export const DB_URL = process.env.DB_URL as string;
