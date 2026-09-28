import * as minio from "minio";
import sharp from "sharp";
import {
  EVIDENCE_URL_EXPIRY_SECONDS,
  MAX_EVIDENCE_IMAGE_HEIGHT,
  MAX_EVIDENCE_IMAGE_WIDTH,
  MINIO_ENDPOINT,
  MINIO_PUBLIC_URL,
  MINIO_PASSWORD,
  MINIO_PORT,
  MINIO_USE_SSL,
  MINIO_USER,
  PAYMENT_EVIDENCE_BUCKET,
} from "../config";
import AppError from "../utils/app-error";

type BucketPolicy = {
  Version: string;
  Statement: unknown[];
};

export interface EvidenceUploadResult {
  objectKey: string;
  fileName: string;
  mimeType: string;
}

export default class EvidenceStorageService {
  private readonly client = new minio.Client({
    endPoint: MINIO_ENDPOINT,
    port: MINIO_PORT,
    useSSL: MINIO_USE_SSL,
    accessKey: MINIO_USER,
    secretKey: MINIO_PASSWORD,
  });

  // Sign for the public hostname directly; rewriting a signed URL breaks S3 signatures.
  // Fixed region avoids a network lookup through the public edge during signing.
  private readonly publicClient = new minio.Client({
    endPoint: new URL(MINIO_PUBLIC_URL).hostname,
    port: Number(new URL(MINIO_PUBLIC_URL).port || (MINIO_PUBLIC_URL.startsWith("https:") ? 443 : 80)),
    useSSL: MINIO_PUBLIC_URL.startsWith("https:"),
    accessKey: MINIO_USER,
    secretKey: MINIO_PASSWORD,
    region: "us-east-1",
  });

  async initPrivateBucket(): Promise<void> {
    const exists = await this.client.bucketExists(
      PAYMENT_EVIDENCE_BUCKET,
    );
    if (!exists) {
      await this.client.makeBucket(
        PAYMENT_EVIDENCE_BUCKET,
        "us-east-1",
      );
    }

    const privatePolicy: BucketPolicy = {
      Version: "2012-10-17",
      Statement: [],
    };
    await this.client.setBucketPolicy(
      PAYMENT_EVIDENCE_BUCKET,
      JSON.stringify(privatePolicy),
    );
  }

  async uploadEvidence(
    data: Uint8Array,
    orderID: string,
    fileName: string,
    mimeType: string,
  ): Promise<EvidenceUploadResult> {
    const isImage = mimeType.startsWith("image/");
    const storedMimeType = isImage ? "image/webp" : mimeType;
    const storedFileName = isImage
      ? this.withWebpExtension(fileName)
      : fileName;
    const extension = this.extensionFor(storedMimeType);
    const randomBytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(randomBytes);
    const suffix = Array.from(randomBytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    const safeOrderID = orderID.replace(/[^a-z0-9_-]/gi, "_");
    const objectKey = `${safeOrderID}/${Date.now()}-${suffix}.${extension}`;
    const sourceBuffer = Buffer.from(data);
    const buffer = isImage
      ? await this.convertImageToWebp(sourceBuffer)
      : sourceBuffer;

    await this.client.putObject(
      PAYMENT_EVIDENCE_BUCKET,
      objectKey,
      buffer,
      buffer.length,
      {
        "Content-Type": storedMimeType,
        "Content-Disposition": `inline; filename="${this.safeFileName(storedFileName)}"`,
        "Cache-Control": "private, no-store",
      },
    );
    return {
      objectKey,
      fileName: storedFileName,
      mimeType: storedMimeType,
    };
  }

  getEvidenceUrl(objectKey: string): Promise<string> {
    return this.publicClient.presignedGetObject(
      PAYMENT_EVIDENCE_BUCKET,
      objectKey,
      EVIDENCE_URL_EXPIRY_SECONDS,
    );
  }

  async getEvidenceMetadata(objectKey: string): Promise<EvidenceUploadResult> {
    if (!objectKey || objectKey.length > 1024 || /[\x00-\x1f]/.test(objectKey)) {
      throw new AppError("Invalid evidence objectKey", 400);
    }
    let stat;
    try {
      stat = await this.client.statObject(PAYMENT_EVIDENCE_BUCKET, objectKey);
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (["NotFound", "NoSuchKey", "NoSuchObject"].includes(code ?? "")) {
        throw new AppError("Evidence objectKey was not found", 404);
      }
      throw error;
    }
    const mimeType = String(stat.metaData["content-type"] ?? "").split(";")[0].trim().toLowerCase();
    if (!["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"].includes(mimeType)) {
      throw new AppError("Evidence must be an image or PDF", 400);
    }
    if (stat.size <= 0 || stat.size > 2 * 1024 * 1024) {
      throw new AppError("Evidence must not exceed 2 MB", 413);
    }
    return { objectKey, mimeType, fileName: objectKey.split("/").pop() || objectKey };
  }

  async removeEvidence(objectKey: string): Promise<void> {
    await this.client.removeObject(PAYMENT_EVIDENCE_BUCKET, objectKey);
  }

  private extensionFor(mimeType: string): string {
    const extensions: Record<string, string> = {
      "application/pdf": "pdf",
      "image/gif": "gif",
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    return extensions[mimeType] || "bin";
  }

  private safeFileName(fileName: string): string {
    return fileName.replace(/["\r\n]/g, "_");
  }

  private withWebpExtension(fileName: string): string {
    const replaced = fileName.replace(/\.[^./\\]+$/, ".webp");
    return replaced === fileName ? `${fileName}.webp` : replaced;
  }

  private async convertImageToWebp(source: Buffer): Promise<Buffer> {
    try {
      return await sharp(source)
        .rotate()
        .resize({
          width: MAX_EVIDENCE_IMAGE_WIDTH,
          height: MAX_EVIDENCE_IMAGE_HEIGHT,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toBuffer();
    } catch {
      throw new AppError("Evidence image data is invalid", 400);
    }
  }
}
