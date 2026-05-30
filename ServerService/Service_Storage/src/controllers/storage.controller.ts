import { Response } from "express";
import StorageService from "../services/storage.service";
import { AuthRequest } from "../middlewares/auth";
import { errorCode_e, role_e } from "../utils/enum";

export default class StorageController {
  constructor(private service: StorageService) {}

  async presignedPut(req: AuthRequest, res: Response) {
    try {
      if (!ensureAdmin(req, res)) return;
      const { Bucket, Key } = req.query;
      const url = await this.service.presignedPut(Bucket as string | undefined, Key as string | undefined);
      return res.send({ status: "success", result: { url } });
    } catch (err) {
      return handleError(res, err);
    }
  }

  async presignedGet(req: AuthRequest, res: Response) {
    try {
      if (!ensureAdmin(req, res)) return;
      const { Bucket, Key } = req.query;
      const url = await this.service.presignedGet(Bucket as string | undefined, Key as string | undefined);
      return res.send({ status: "success", result: { url } });
    } catch (err) {
      return handleError(res, err);
    }
  }

  async createBucket(req: AuthRequest, res: Response) {
    try {
      if (!ensureAdmin(req, res)) return;
      const { Bucket, Private } = req.body;
      await this.service.createBucket(Bucket, Private || false);
      return res.send({ status: "success" });
    } catch (err) {
      return handleError(res, err);
    }
  }

  async updateBucket(req: AuthRequest, res: Response) {
    try {
      if (!ensureAdmin(req, res)) return;
      const { Bucket, Private } = req.body;
      await this.service.updateBucket(Bucket, Private);
      return res.send({ status: "success" });
    } catch (err) {
      return handleError(res, err);
    }
  }

  async deleteBucket(req: AuthRequest, res: Response) {
    try {
      if (!ensureAdmin(req, res)) return;
      const { Bucket } = req.body;
      await this.service.deleteBucket(Bucket);
      return res.send({ status: "success" });
    } catch (err) {
      return handleError(res, err);
    }
  }

  async uploadImage(req: AuthRequest, res: Response) {
    try {
      if (!ensureAdmin(req, res)) return;
      const { Bucket, Key, height, width } = req.body;
      if (!req.file?.buffer) {
        throw { code: errorCode_e.InvalidInputError };
      }

      const result = await this.service.uploadImage(
        req.file.buffer,
        Bucket,
        Key,
        Number(width) || undefined,
        Number(height) || undefined,
      );
      return res.send({ status: "success", result });
    } catch (err) {
      return handleError(res, err);
    }
  }

  async deleteImage(req: AuthRequest, res: Response) {
    try {
      if (!ensureAdmin(req, res)) return;
      const { Bucket, Key } = req.query;
      await this.service.removeImage(Bucket as string | undefined, Key as string | undefined);
      return res.send({ status: "success" });
    } catch (err) {
      return handleError(res, err);
    }
  }
}

function ensureAdmin(req: AuthRequest, res: Response) {
  if (req.authData?.role === role_e.admin) {
    return true;
  }

  res.send({ status: "error", errCode: errorCode_e.PermissionDeniedError });
  return false;
}

function handleError(res: Response, err: any) {
  console.log(err);
  return res.send({
    status: "error",
    errCode: err?.code ?? errorCode_e.UnknownError,
  });
}
