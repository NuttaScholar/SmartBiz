import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";
import { errorCode_e } from "./enum";
import { error } from "./response";
import { tokenPackage_t } from "./type";

export interface AuthRequest extends Request {
  authData?: tokenPackage_t;
}

const decoder = (token: string): tokenPackage_t | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as tokenPackage_t;
  } catch {
    return null;
  }
};

export const AuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.send(error<"none">(errorCode_e.UnauthorizedError));
  }

  const accessToken = authorization.split(" ")[1];
  const decoded = decoder(accessToken);

  if (!decoded) {
    return res.send(error<"none">(errorCode_e.TokenExpiredError));
  }

  if (decoded.type !== "accessToken") {
    return res.send(error<"none">(errorCode_e.UnauthorizedError));
  }

  req.authData = decoded;
  return next();
};
