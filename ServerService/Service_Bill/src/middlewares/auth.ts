import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET, SERVICE_AUTH_SECRET } from "../config";
import { tokenPackage_t } from "../type";
import { errorCode_e } from "../utils/enum";

export interface AuthRequest extends Request {
  authData?: tokenPackage_t;
}

const SERVICE_AUDIENCE = "service_bill";
const TRUSTED_SERVICES = new Set([
  "service_account",
  "service_stock",
  "service_storefront",
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

export default function AuthMiddleware(
  request: AuthRequest,
  response: Response,
  next: NextFunction,
) {
  const [scheme, token] = request.headers.authorization?.split(" ") ?? [];
  if (scheme !== "Bearer" || !token) {
    return response.status(401).json({
      success: false,
      errCode: errorCode_e.UnauthorizedError,
      message: "Valid Bearer authorization is required",
    });
  }

  const decoded = decodeToken(token);
  if (!decoded) {
    return response.status(401).json({
      success: false,
      errCode: errorCode_e.TokenExpiredError,
      message: "Token expired or invalid",
    });
  }

  request.authData = decoded;
  next();
}
