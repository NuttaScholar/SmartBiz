import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET, SERVICE_AUTH_SECRET } from "../config";
import type { tokenPackage_t } from "../type";
import { errorCode_e, role_e } from "../utils/enum";
import { logRequestFailure } from "./error-handler";

export interface AuthRequest extends Request {
  authData?: tokenPackage_t;
}

const SERVICE_AUDIENCE = "service_storefront";
const TRUSTED_SERVICES = new Set([
  "service_account",
  "service_bill",
  "service_stock",
  "service_storage",
]);

function decodeToken(token: string): tokenPackage_t | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    }) as tokenPackage_t;
    if (
      decoded.type === "accessToken"
      && typeof decoded.username === "string"
      && decoded.role !== undefined
    ) {
      return decoded;
    }
  } catch {}

  try {
    const decoded = jwt.verify(token, SERVICE_AUTH_SECRET, {
      algorithms: ["HS256"],
      audience: SERVICE_AUDIENCE,
    }) as tokenPackage_t & JwtPayload;
    if (
      decoded.type === "serviceToken"
      && typeof decoded.service === "string"
      && TRUSTED_SERVICES.has(decoded.service)
      && decoded.iss === decoded.service
      && decoded.sub === `service:${decoded.service}`
      && typeof decoded.jti === "string"
      && typeof decoded.iat === "number"
      && typeof decoded.exp === "number"
      && decoded.exp - decoded.iat <= 300
      && Array.isArray(decoded.scopes)
      && decoded.scopes.every((scope) => typeof scope === "string")
    ) {
      return decoded;
    }
  } catch {}

  return null;
}

export function hasServiceScope(
  request: AuthRequest,
  scope: string,
): boolean {
  return request.authData?.type === "serviceToken"
    && request.authData.scopes?.includes(scope) === true;
}

export function isUserWithRole(
  request: AuthRequest,
  roles: number[],
): boolean {
  return request.authData?.type === "accessToken"
    && request.authData.role !== undefined
    && roles.includes(request.authData.role);
}

export function getPrincipalName(
  request: AuthRequest,
): string | undefined {
  if (request.authData?.type === "accessToken") {
    return request.authData.username;
  }
  return request.authData?.service;
}

export function authMiddleware(
  request: AuthRequest,
  response: Response,
  next: NextFunction,
): void {
  const [scheme, token] = request.headers.authorization?.split(" ") ?? [];
  if (scheme !== "Bearer" || !token) {
    logRequestFailure(
      "warn",
      request,
      response,
      401,
      "Valid Bearer authorization is required",
    );
    response.status(401).json({
      success: false,
      errCode: errorCode_e.UnauthorizedError,
      message: "Valid Bearer authorization is required",
    });
    return;
  }

  const decoded = decodeToken(token);
  if (!decoded) {
    logRequestFailure(
      "warn",
      request,
      response,
      401,
      "Token expired or invalid",
    );
    response.status(401).json({
      success: false,
      errCode: errorCode_e.TokenExpiredError,
      message: "Token expired or invalid",
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
  if (isUserWithRole(request, [role_e.admin])) {
    next();
    return;
  }

  logRequestFailure(
    "warn",
    request,
    response,
    403,
    "You do not have permission to access this resource",
  );
  response.status(403).json({
    success: false,
    errCode: errorCode_e.PermissionDeniedError,
    message: "You do not have permission to access this resource",
  });
}

export function adminOrServiceScope(scope: string) {
  return (
    request: AuthRequest,
    response: Response,
    next: NextFunction,
  ): void => {
    if (
      isUserWithRole(request, [role_e.admin])
      || hasServiceScope(request, scope)
    ) {
      next();
      return;
    }

    logRequestFailure(
      "warn",
      request,
      response,
      403,
      "You do not have permission to access this resource",
    );
    response.status(403).json({
      success: false,
      errCode: errorCode_e.PermissionDeniedError,
      message: "You do not have permission to access this resource",
    });
  };
}
