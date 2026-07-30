import type { NextFunction, Request, Response } from "express";

const REQUEST_ID_PATTERN = /^[a-zA-Z0-9._:-]{1,128}$/;

export default function requestContext(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const receivedRequestID = request.header("x-request-id")?.trim();
  const requestID = receivedRequestID
    && REQUEST_ID_PATTERN.test(receivedRequestID)
    ? receivedRequestID
    : globalThis.crypto.randomUUID();

  response.locals.requestID = requestID;
  response.setHeader("X-Request-ID", requestID);
  next();
}
