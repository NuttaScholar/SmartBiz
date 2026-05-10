import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { responst_t, tokenPackage_t } from "../type";
import { errorCode_e } from "../utils/enum";
import dotenv from 'dotenv';

dotenv.config();

const secret = process.env.SECRET || "SMARTBIZ_SECRET_KEY";

export interface AuthRequest extends Request {
    authData?: tokenPackage_t;
}

function decodeToken(token: string): tokenPackage_t | null {
    try {
        const decoded = jwt.verify(token, secret) as tokenPackage_t;
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
        const result: responst_t<"none"> = {
            status: "error",
            errCode: errorCode_e.UnauthorizedError
        };
        return res.send(result);
    }

    const token = authHeader.split(" ")[1];
    const decoded = decodeToken(token);

    if (!decoded) {
        const result: responst_t<"none"> = {
            status: "error",
            errCode: errorCode_e.TokenExpiredError
        };
        return res.send(result);
    }

    if (decoded.type !== "accessToken") {
        const result: responst_t<"none"> = {
            status: "error",
            errCode: errorCode_e.UnauthorizedError
        };
        return res.send(result);
    }

    // ผ่านการตรวจสอบทั้งหมด
    req.authData = decoded;
    next();
}
