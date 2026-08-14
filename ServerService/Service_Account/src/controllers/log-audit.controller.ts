import { Response } from "express";
import { Model } from "mongoose";
import { AuthRequest, isUserWithRole } from "../middlewares/auth";
import { LogAuditDocument } from "../models/log-audit.interface";
import LogAuditService from "../services/log-audit.service";
import { errorCode_e, role_e } from "../utils/enum";
import { error, success } from "../utils/response";

export default class LogAuditController {
  private service: LogAuditService;

  constructor(LogAuditModel: Model<LogAuditDocument>) {
    this.service = new LogAuditService(LogAuditModel);
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      if (!requireAdmin(req, res)) return;
      const result = await this.service.getById(req.params.id);
      return res.json(success<"getLogAudit">(result));
    } catch (err) {
      return handleError(res, err, "getLogAudit");
    }
  }

  async query(req: AuthRequest, res: Response) {
    try {
      if (!requireAdmin(req, res)) return;
      const result = await this.service.query({
        transactionId: req.query.transactionId as string,
        action: req.query.action as string,
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
      return res.json(success<"queryLogAudit">(result));
    } catch (err) {
      return handleError(res, err, "queryLogAudit");
    }
  }
}

function requireAdmin(req: AuthRequest, res: Response) {
  if (isUserWithRole(req, [role_e.admin])) return true;

  res.status(403).json(
    error<"none">(
      errorCode_e.PermissionDeniedError,
      "Admin access is required",
    ),
  );
  return false;
}

function handleError(
  res: Response,
  err: any,
  kind: "getLogAudit" | "queryLogAudit",
) {
  console.error(err);
  const errCode = err?.code || errorCode_e.UnknownError;
  const message = err?.message || "Unknown error";
  const status = errCode === errorCode_e.NotFoundError
    ? 404
    : err?.code
      ? 400
      : 500;

  if (kind === "getLogAudit") {
    return res.status(status).json(error<"getLogAudit">(errCode, message));
  }
  return res.status(status).json(error<"queryLogAudit">(errCode, message));
}
