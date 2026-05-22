import * as minio from "minio";
import sharp from "sharp";
import crypto from "crypto";
import {
  MAX_IMAGE_HEIGHT,
  MAX_IMAGE_WIDTH,
  MINIO_ENDPOINT,
  MINIO_PASSWORD,
  MINIO_PORT,
  MINIO_USE_SSL,
  MINIO_USER,
} from "../config";

type BucketPolicy = {
  Version: string;
  Statement: {
    Effect: string;
    Principal: { AWS: string[] };
    Action: string[];
    Resource: string[];
  }[];
};

export default class StorageService {
  private client = new minio.Client({
    endPoint: MINIO_ENDPOINT,
    port: MINIO_PORT,
    useSSL: MINIO_USE_SSL,
    accessKey: MINIO_USER,
    secretKey: MINIO_PASSWORD,
  });

  async uploadImage(img: Buffer, bucket: string, key: string): Promise<{ url: string }> {
    const webpBuf = await sharp(img)
      .rotate()
      .resize({ width: MAX_IMAGE_WIDTH, height: MAX_IMAGE_HEIGHT, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const newKey = `${key}_${crypto.randomBytes(8).toString("hex")}`;
    await this.client.putObject(bucket, newKey, webpBuf, webpBuf.length, {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=36000, immutable",
    });

    return { url: `${bucket}/${newKey}` };
  }

  removeObject(bucket: string, key: string) {
    return this.client.removeObject(bucket, key);
  }

  async initBucket(bucket: string, isPrivate: boolean) {
    const exists = await this.client.bucketExists(bucket);
    if (exists) return;

    await this.client.makeBucket(bucket, "us-east-1");
    await this.client.setBucketPolicy(bucket, JSON.stringify(this.createPolicy(bucket, isPrivate)));
  }

  private createPolicy(bucket: string, isPrivate: boolean): BucketPolicy {
    return {
      Version: "2012-10-17",
      Statement: isPrivate
        ? []
        : [
            {
              Effect: "Allow",
              Principal: { AWS: ["*"] },
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${bucket}/*`],
            },
          ],
    };
  }
}
