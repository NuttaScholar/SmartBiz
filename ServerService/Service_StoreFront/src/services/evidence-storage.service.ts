import * as minio from "minio";
import {
  EVIDENCE_URL_EXPIRY_SECONDS,
  MINIO_ENDPOINT,
  MINIO_PASSWORD,
  MINIO_PORT,
  MINIO_USE_SSL,
  MINIO_USER,
  PAYMENT_EVIDENCE_BUCKET,
} from "../config";

type BucketPolicy = {
  Version: string;
  Statement: unknown[];
};

export default class EvidenceStorageService {
  private readonly client = new minio.Client({
    endPoint: MINIO_ENDPOINT,
    port: MINIO_PORT,
    useSSL: MINIO_USE_SSL,
    accessKey: MINIO_USER,
    secretKey: MINIO_PASSWORD,
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
  ): Promise<string> {
    const extension = this.extensionFor(mimeType);
    const randomBytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(randomBytes);
    const suffix = Array.from(randomBytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    const safeOrderID = orderID.replace(/[^a-z0-9_-]/gi, "_");
    const objectKey = `${safeOrderID}/${Date.now()}-${suffix}.${extension}`;
    const buffer = Buffer.from(data);

    await this.client.putObject(
      PAYMENT_EVIDENCE_BUCKET,
      objectKey,
      buffer,
      buffer.length,
      {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${this.safeFileName(fileName)}"`,
        "Cache-Control": "private, no-store",
      },
    );
    return objectKey;
  }

  getEvidenceUrl(objectKey: string): Promise<string> {
    return this.client.presignedGetObject(
      PAYMENT_EVIDENCE_BUCKET,
      objectKey,
      EVIDENCE_URL_EXPIRY_SECONDS,
    );
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
}
