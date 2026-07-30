import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "./auth";
import AppError from "../utils/app-error";
import { error } from "../utils/response";

interface RequestFailureLog {
  level: "warn" | "error";
  event: "request_failed";
  requestID?: string;
  method: string;
  path: string;
  status: number;
  principal?: string;
  message: string;
  stack?: string;
}

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
  request: AuthRequest,
  response: Response,
  _next: NextFunction,
): void {
  const message = thrown instanceof Error
    ? thrown.message
    : "Something went wrong";
  const status = thrown instanceof AppError ? thrown.status : 500;

  if (status === 401 || status === 403 || status === 409) {
    logRequestFailure("warn", request, response, status, message);
  } else if (!(thrown instanceof AppError) || status >= 500) {
    logRequestFailure(
      "error",
      request,
      response,
      status,
      message,
      thrown instanceof Error ? thrown.stack : undefined,
    );
  }
  response.status(status).json(error(message, status));
}

export function logRequestFailure(
  level: RequestFailureLog["level"],
  request: AuthRequest,
  response: Response,
  status: number,
  message: string,
  stack?: string,
): void {
  const principal = request.authData?.type === "serviceToken"
    ? request.authData.service
    : request.authData?.username;

  const entry: RequestFailureLog = {
    level,
    event: "request_failed",
    requestID: response.locals.requestID,
    method: request.method,
    path: request.path,
    status,
    principal,
    message,
    stack,
  };

  if (level === "warn") {
    console.warn(JSON.stringify(entry));
  } else {
    console.error(JSON.stringify(entry));
  }
}
