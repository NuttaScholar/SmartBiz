import crypto from "crypto";
import multer from "multer";
import * as minio from "minio";
import sharp from "sharp";
import { BILL_BUCKET, MAX_IMAGE_HEIGHT, MAX_IMAGE_WIDTH, MINIO_CONFIG } from "./config";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype)) {
      return cb(new Error("Unsupported file type"));
    }
    return cb(null, true);
  },
});

const minioClient = new minio.Client(MINIO_CONFIG);

const createBillImageKey = () => {
  const date = new Date();
  return `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, "0")}${date
    .getDate()
    .toString()
    .padStart(2, "0")}`;
};

export const uploadBillImage = async (img: Buffer<ArrayBufferLike>): Promise<string> => {
  try {
    const webpBuf = await sharp(img)
      .rotate()
      .resize({ width: MAX_IMAGE_WIDTH, height: MAX_IMAGE_HEIGHT, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const key = `${createBillImageKey()}_${crypto.randomBytes(8).toString("hex")}`;
    await minioClient.putObject(BILL_BUCKET, key, webpBuf, webpBuf.length, {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=36000, immutable",
    });

    return `${BILL_BUCKET}/${key}`;
  } catch {
    throw new Error("Upload image failed");
  }
};

export const removeBillImage = async (bill?: string) => {
  if (!bill) {
    return;
  }

  const key = bill.split("/").pop();
  if (key) {
    await minioClient.removeObject(BILL_BUCKET, key);
  }
};
