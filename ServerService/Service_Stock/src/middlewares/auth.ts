import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { tokenPackage_t } from "../type";
import { errorCode_e } from "../utils/enum";

export interface AuthRequest extends Request {
  authData?: tokenPackage_t;
}

function decodeToken(token: string): tokenPackage_t | null {
  try {
    return jwt.verify(token, JWT_SECRET) as tokenPackage_t;
  } catch (err) {
    return null;
  }
}

export default function AuthMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.send({ status: "error", errCode: errorCode_e.UnauthorizedError });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.send({ status: "error", errCode: errorCode_e.UnauthorizedError });
  }

  const decoded = decodeToken(token);
  if (!decoded) {
    return res.send({ status: "error", errCode: errorCode_e.TokenExpiredError });
  }

  if (decoded.type !== "accessToken") {
    return res.send({ status: "error", errCode: errorCode_e.UnauthorizedError });
  }

  req.authData = decoded;
  next();
}
