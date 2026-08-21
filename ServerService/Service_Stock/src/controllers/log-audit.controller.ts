import { Response } from "express";
import { Model } from "mongoose";
import { AuthRequest, isUserWithRole } from "../middlewares/auth";
import { LogAuditDocument } from "../models/log-audit.interface";
import LogAuditService from "../services/log-audit.service";
import { errorCode_e, role_e } from "../utils/enum";
import { handleError } from "./product.controller";

export default class LogAuditController {
  private service: LogAuditService;

  constructor(LogAuditModel: Model<LogAuditDocument>) {
    this.service = new LogAuditService(LogAuditModel);
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      requireAdmin(req);
      const result = await this.service.getById(req.params.id);
      return res.json({ success: true, data: result });
    } catch (err) {
      return handleError(res, err);
    }
  }

  async query(req: AuthRequest, res: Response) {
    try {
      requireAdmin(req);
      const result = await this.service.query({
        productID: req.query.productID as string,
        action: req.query.action as string,
        operation: req.query.operation as string,
        actorName: req.query.actorName as string,
        actorType: req.query.actorType as string,
        from: req.query.from as string,
        to: req.query.to as string,
        minBeforeAmount: req.query.minBeforeAmount as string,
        maxBeforeAmount: req.query.maxBeforeAmount as string,
        minAfterAmount: req.query.minAfterAmount as string,
        maxAfterAmount: req.query.maxAfterAmount as string,
        page: req.query.page as string,
        size: req.query.size as string,
      });
      return res.json({ success: true, data: result });
    } catch (err) {
      return handleError(res, err);
    }
  }
}

function requireAdmin(req: AuthRequest) {
  if (!isUserWithRole(req, [role_e.admin])) {
    throw {
      code: errorCode_e.PermissionDeniedError,
      message: "Admin access is required",
    };
  }
}
