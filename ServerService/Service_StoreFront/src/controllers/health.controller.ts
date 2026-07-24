import type { Request, Response } from "express";
import HealthService from "../services/health.service";
import { success } from "../utils/response";

export default class HealthController {
  constructor(private readonly healthService: HealthService) {}

  getHealth = (_request: Request, response: Response): void => {
    const snapshot = this.healthService.getSnapshot();
    response
      .status(snapshot.status === "ok" ? 200 : 503)
      .json(success(snapshot));
  };
}
