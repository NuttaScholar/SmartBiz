import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { responst_t, tokenPackage_t } from "./type";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import { errorCode_e, role_e, transactionType_e } from "./enum";
import * as minio from "minio";

dotenv.config();
/*********************************************** */
// Instance 
/*********************************************** */
const app = express();

/*********************************************** */
// Config
/*********************************************** */
const PORT = Number(process.env.PORT);
const secret = process.env.SECRET as jwt.Secret;

/*********************************************** */
// Middleware Setup
/*********************************************** */
// อนุญาตให้ React frontend สามารถส่งคำขอมาได้
console.log("origin:", process.env.WEB_HOST);
app.use(cors({
    origin: process.env.WEB_HOST as string, // URL ของ React (Web)
    credentials: true, // อนุญาตให้ส่ง cookie ไปกลับ
}));
app.use(express.json());
app.use(cookieParser());

/*********************************************** */
// Minio Setup
/*********************************************** */
// เชื่อมต่อ Minio
const minioClient = new minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || "localhost",
    port: Number(process.env.MINIO_PORT || 9000),
    useSSL: (process.env.MINIO_USE_SSL || "false") === "true",
    accessKey: process.env.MINIO_USER || "",
    secretKey: process.env.MINIO_PASSWORD || "",
});

/*********************************************** */
// Function
/*********************************************** */
function decoder(token: string): tokenPackage_t | null {
    try {
        var decoded = jwt.verify(token, secret) as tokenPackage_t;
        return decoded;
    } catch (err) {
        return null;
    }
}
/*********************************************** */
// Middleware
/*********************************************** */
interface AuthRequest extends Request {
    authData?: tokenPackage_t;
}
function AuthMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    if (req.headers.authorization) {
        const accessToken = req.headers.authorization.split(" ")[1];
        const decoded = decoder(accessToken);

        if (decoded) {
            if (decoded.type === "accessToken") {
                req.authData = decoded
                next();
            } else {
                const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.UnauthorizedError }
                res.send(result);
            }
        } else {
            const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.TokenExpiredError }
            res.send(result);
        }
    } else {
        const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.UnauthorizedError }
        res.send(result);
    }
}
/*********************************************** */
// Routes Setup
/*********************************************** */
app.get("/presignedPut", AuthMiddleware, async (req: AuthRequest, res: Response) => {
    const { Bucket, Key } = req.query as { Bucket?: string; Key?: string };
    if (!Bucket || !Key) {
        const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.InvalidInputError }
        res.send(result);
        return;
    }
    const policy = {
        Version: "2012-10-17",
        Statement: [
            {
                Effect: "Allow",
                Principal: { AWS: ["*"] },
                Action: ["s3:GetObject"],
                Resource: [`arn:aws:s3:::${Bucket}/*`],
            },
        ],
    };
    const exists = await minioClient.bucketExists(Bucket);
    if (!exists) {
        await minioClient.makeBucket(Bucket, "us-east-1");
        await minioClient.setBucketPolicy(Bucket, JSON.stringify(policy));
    }
    const url = await minioClient.presignedPutObject(Bucket, Key as string, 24 * 60 * 60);
    const result:responst_t<"getPresigned"> = {status:"success", result: {url}}
    res.send(result);
});

/*********************************************** */
// Start Server
/*********************************************** */
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});