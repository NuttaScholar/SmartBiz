import jwt from "jsonwebtoken";
import { SERVICE_AUTH_SECRET } from "../config";

const SERVICE_NAME = "service_storefront";

export function createServiceToken(
  audience: string,
  scopes: string[],
): string {
  return jwt.sign(
    {
      type: "serviceToken",
      service: SERVICE_NAME,
      sub: `service:${SERVICE_NAME}`,
      scopes,
    },
    SERVICE_AUTH_SECRET,
    {
      algorithm: "HS256",
      audience,
      issuer: SERVICE_NAME,
      jwtid: globalThis.crypto.randomUUID(),
      expiresIn: "2m",
    },
  );
}
