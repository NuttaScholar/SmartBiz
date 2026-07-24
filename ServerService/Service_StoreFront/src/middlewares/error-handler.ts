import type { NextFunction, Request, Response } from "express";
import { error } from "../utils/response";

export function notFoundHandler(
  request: Request,
  response: Response,
): void {
  response
    .status(404)
    .json(error(`Route ${request.method} ${request.path} not found`, 404));
}

export function errorHandler(
  thrown: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
): void {
  const message =
    thrown instanceof Error ? thrown.message : "Something went wrong";

  console.error(thrown);
  response.status(500).json(error(message, 500));
}
