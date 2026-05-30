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
    return res.send({ status: "error", errCode: errorCode_e.UnauthorizedError });
  }

  const accessToken = authHeader.split(" ")[1];
  const decoded = tokenService.decode(accessToken);
  if (!decoded) {
    return res.send({ status: "error", errCode: errorCode_e.TokenExpiredError });
  }

  if (decoded.type !== "accessToken") {
    return res.send({ status: "error", errCode: errorCode_e.UnauthorizedError });
  }

  req.authData = decoded;
  next();
}
