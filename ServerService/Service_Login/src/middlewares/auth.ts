import { NextFunction, Request, Response } from "express";
import TokenService from "../services/token.service";
import { tokenPackage_t } from "../type";
import { errorCode_e } from "../utils/enum";

export interface AuthRequest extends Request {
  authData?: tokenPackage_t;
}

const tokenService = new TokenService();

export default function AuthMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      errCode: errorCode_e.UnauthorizedError,
      message: "Authorization header missing",
    });
  }

  const accessToken = authHeader.split(" ")[1];
  const decoded = tokenService.decode(accessToken);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      errCode: errorCode_e.TokenExpiredError,
      message: "Token expired",
    });
  }

  if (decoded.type !== "accessToken") {
    return res.status(401).json({
      success: false,
      errCode: errorCode_e.UnauthorizedError,
      message: "Invalid token",
    });
  }

  req.authData = decoded;
  next();
}
