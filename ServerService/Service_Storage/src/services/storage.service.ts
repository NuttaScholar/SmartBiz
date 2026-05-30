import crypto from "crypto";
import * as minio from "minio";
import sharp from "sharp";
import {
  MAX_IMAGE_HEIGHT,
  MAX_IMAGE_WIDTH,
  MINIO_ENDPOINT,
  MINIO_PASSWORD,
  MINIO_PORT,
  MINIO_USE_SSL,
  MINIO_USER,
} from "../config";
import { errorCode_e } from "../utils/enum";

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

  async initBucket(bucket: string, isPrivate: boolean) {
    const exists = await this.client.bucketExists(bucket).catch(() => false);
    if (exists) return;

    await this.client.makeBucket(bucket, "us-east-1");
    await this.client.setBucketPolicy(bucket, JSON.stringify(this.createPolicy(bucket, isPrivate)));
  }

  async presignedPut(bucket?: string, key?: string) {
    const input = await this.ensureObjectInput(bucket, key);
    return this.client.presignedPutObject(input.bucket, input.key, 24 * 60 * 60);
  }

  async presignedGet(bucket?: string, key?: string) {
    const input = await this.ensureObjectInput(bucket, key);
    return this.client.presignedGetObject(input.bucket, input.key, 60);
  }

  async createBucket(bucket?: string, isPrivate = false) {
    if (!bucket) {
      throw { code: errorCode_e.InvalidInputError };
    }

    const exists = await this.client.bucketExists(bucket);
    if (exists) {
      throw { code: errorCode_e.AlreadyExistsError };
    }

    await this.client.makeBucket(bucket, "us-east-1");
    await this.client.setBucketPolicy(bucket, JSON.stringify(this.createPolicy(bucket, isPrivate)));
  }

  async updateBucket(bucket?: string, isPrivate?: boolean) {
    if (!bucket || isPrivate === undefined) {
      throw { code: errorCode_e.InvalidInputError };
    }

    await this.ensureBucketExists(bucket);
    await this.client.setBucketPolicy(bucket, JSON.stringify(this.createPolicy(bucket, isPrivate)));
  }

  async deleteBucket(bucket?: string) {
    if (!bucket) {
      throw { code: errorCode_e.InvalidInputError };
    }

    await this.ensureBucketExists(bucket);
    await this.emptyBucket(bucket);
    await this.client.removeBucket(bucket);
  }

  async uploadImage(img: Buffer, bucket?: string, key?: string, width?: number, height?: number) {
    if (!img || !bucket || !key) {
      throw { code: errorCode_e.InvalidInputError };
    }

    const webpBuf = await sharp(img)
      .rotate()
      .resize({
        width: width || MAX_IMAGE_WIDTH,
        height: height || MAX_IMAGE_HEIGHT,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();
    const newKey = `${key}_${crypto.randomBytes(8).toString("hex")}`;

    await this.client.putObject(bucket, newKey, webpBuf, webpBuf.length, {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=2592000, immutable",
    });

    return { url: `http://${MINIO_ENDPOINT}:${MINIO_PORT}/${bucket}/${newKey}` };
  }

  removeImage(bucket?: string, key?: string) {
    if (!bucket || !key) {
      throw { code: errorCode_e.InvalidInputError };
    }

    return this.client.removeObject(bucket, key);
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

  private async ensureObjectInput(bucket?: string, key?: string) {
    if (!bucket || !key) {
      throw { code: errorCode_e.InvalidInputError };
    }

    await this.ensureBucketExists(bucket);
    return { bucket, key };
  }

  private async ensureBucketExists(bucket: string) {
    const exists = await this.client.bucketExists(bucket);
    if (!exists) {
      throw { code: errorCode_e.NotFoundError };
    }
  }

  private async emptyBucket(bucket: string, prefix = "") {
    const stream = this.client.listObjectsV2(bucket, prefix, true);
    const batchSize = 1000;
    let batch: string[] = [];

    await new Promise<void>((resolve, reject) => {
      stream.on("data", (obj: { name: string }) => {
        if (!obj?.name) return;

        batch.push(obj.name);
        if (batch.length >= batchSize) {
          stream.pause();
          this.client
            .removeObjects(bucket, batch.splice(0))
            .then(() => stream.resume())
            .catch(reject);
        }
      });
      stream.on("error", reject);
      stream.on("end", async () => {
        if (batch.length) {
          await this.client.removeObjects(bucket, batch);
        }
        resolve();
      });
    });
  }
}
