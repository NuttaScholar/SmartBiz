import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { tokenPackage_t } from "../type";
import { errorCode_e } from "../utils/enum";
import { JWT_SECRET } from "../config";

export interface AuthRequest extends Request {
    authData?: tokenPackage_t;
}

function decodeToken(token: string): tokenPackage_t | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as tokenPackage_t;
        return decoded;
    } catch (err) {
        return null;
    }
}

export default function AuthMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
        success: false,
        errCode: errorCode_e.UnauthorizedError,
        message: "Authorization header missing"
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        errCode: errorCode_e.UnauthorizedError,
        message: "Token not provided"
      });
    }

    const decoded = decodeToken(token);

    if (!decoded) {
        return res.status(401).json({
        success: false,
        errCode: errorCode_e.TokenExpiredError,
        message: "Token expired"
      });
    }

    if (decoded.type !== "accessToken") {
        return res.status(401).json({
        success: false,
        errCode: errorCode_e.UnauthorizedError,
        message: "Invalid token"
      });      
    }

    // ผ่านการตรวจสอบทั้งหมด
    req.authData = decoded;
    next();
}
