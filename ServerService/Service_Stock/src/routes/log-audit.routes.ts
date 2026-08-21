import { Router } from "express";
import { Model } from "mongoose";
import LogAuditController from "../controllers/log-audit.controller";
import { LogAuditDocument } from "../models/log-audit.interface";

export default function logAuditRoutes(LogAuditModel: Model<LogAuditDocument>) {
  const router = Router();
  const controller = new LogAuditController(LogAuditModel);

  router.get("/", (req, res) => controller.query(req, res));
  router.get("/:id", (req, res) => controller.getById(req, res));

  return router;
}
