import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import type { tokenPackage_t } from "../type";
import { errorCode_e, role_e } from "../utils/enum";

export interface AuthRequest extends Request {
  authData?: tokenPackage_t;
}

function decodeToken(token: string): tokenPackage_t | null {
  try {
    return jwt.verify(token, JWT_SECRET) as tokenPackage_t;
  } catch {
    return null;
  }
}

export function authMiddleware(
  request: AuthRequest,
  response: Response,
  next: NextFunction,
): void {
  const authHeader = request.headers.authorization;
  if (!authHeader) {
    response.status(401).json({
      success: false,
      errCode: errorCode_e.UnauthorizedError,
      message: "Authorization header missing",
    });
    return;
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    response.status(401).json({
      success: false,
      errCode: errorCode_e.UnauthorizedError,
      message: "Token not provided",
    });
    return;
  }

  const decoded = decodeToken(token);
  if (!decoded) {
    response.status(401).json({
      success: false,
      errCode: errorCode_e.TokenExpiredError,
      message: "Token expired or invalid",
    });
    return;
  }
  if (decoded.type !== "accessToken") {
    response.status(401).json({
      success: false,
      errCode: errorCode_e.UnauthorizedError,
      message: "Invalid token",
    });
    return;
  }

  request.authData = decoded;
  next();
}

export function adminMiddleware(
  request: AuthRequest,
  response: Response,
  next: NextFunction,
): void {
  if (request.authData?.role === role_e.admin) {
    next();
    return;
  }

  response.status(403).json({
    success: false,
    errCode: errorCode_e.PermissionDeniedError,
    message: "You do not have permission to access this resource",
  });
}
