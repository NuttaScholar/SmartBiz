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
// Type 
/*********************************************** */
type policy_t = {
    Version: string;
    Statement: (false | {
        Effect: string;
        Principal: {
            AWS: string[];
        };
        Action: string[];
        Resource: string[];
    })[]
}
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
function createPolicy(Bucket: string, Private: boolean): policy_t {
    const policy: policy_t = {
        Version: "2012-10-17",
        Statement: Private === true?[]:[ 
        {
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${Bucket}/*`],
        },
        ],
    };
    console.log(policy);
    return policy;
}
async function emptyBucket(bucket: string, prefix = ""): Promise<void> {
  const stream = minioClient.listObjectsV2(bucket, prefix, true); // recursive = true
  const BATCH_SIZE = 1000;
  let batch: string[] = [];

  await new Promise<void>((resolve, reject) => {
    stream.on("data", (obj: { name: string }) => {
      if (obj?.name) {
        batch.push(obj.name);
        if (batch.length >= BATCH_SIZE) {
          stream.pause();
          // ลบชุดใหญ่ครั้งละ BATCH_SIZE
          minioClient.removeObjects(bucket, batch.splice(0))
            .then(() => stream.resume())
            .catch(reject);
        }
      }
    });
    stream.on("error", reject);
    stream.on("end", async () => {
      if (batch.length) {
        await minioClient.removeObjects(bucket, batch);
      }
      resolve();
    });
  });
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
    if (req.authData?.role !== role_e.admin) {
        const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.PermissionDeniedError }
        res.send(result);
        return;
    }
    const { Bucket, Key } = req.query as { Bucket?: string; Key?: string };
    if (!Bucket || !Key) {
        const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.InvalidInputError }
        res.send(result);
        return;
    }

    const exists = await minioClient.bucketExists(Bucket);
    if (!exists) {
        const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.NotFoundError }
        res.send(result);
        return;
    }
    const url = await minioClient.presignedPutObject(Bucket, Key as string, 24 * 60 * 60);
    const result: responst_t<"getPresigned"> = { status: "success", result: { url } }
    res.send(result);
});
app.get("/presignedGet", AuthMiddleware, async (req: AuthRequest, res: Response) => {
    if (req.authData?.role !== role_e.admin) {
        const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.PermissionDeniedError }
        res.send(result);
        return;
    }
    const { Bucket, Key } = req.query as { Bucket?: string; Key?: string };
    if (!Bucket || !Key) {
        const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.InvalidInputError }
        res.send(result);
        return;
    }

    const exists = await minioClient.bucketExists(Bucket);
    if (!exists) {
        const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.NotFoundError }
        res.send(result);
        return;
    }
    const url = await minioClient.presignedGetObject(Bucket, Key as string, 24 * 60 * 60);
    const result: responst_t<"getPresigned"> = { status: "success", result: { url } }
    res.send(result);
});
app.post("/bucket", AuthMiddleware, async (req: AuthRequest, res: Response) => {
    if (req.authData?.role !== role_e.admin) {
        const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.PermissionDeniedError }
        res.send(result);
        return;
    }
    const { Bucket, Private } = req.body as { Bucket?: string; Private?: boolean };
    if (!Bucket) {
        const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.InvalidInputError }
        res.send(result);
        return;
    }
    try {
        const policy = createPolicy(Bucket, Private || false);
        const exists = await minioClient.bucketExists(Bucket);
        if (exists) {
            const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.AlreadyExistsError }
            res.send(result);
            return;
        }
        else {
            const result: responst_t<"none"> = { status: "success" }
            await minioClient.makeBucket(Bucket, "us-east-1");
            await minioClient.setBucketPolicy(Bucket, JSON.stringify(policy));
            res.send(result);
        }
    }
    catch (err) {
        const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.UnknownError }
        console.log(err);
        res.send(result);
    }
});
app.put("/bucket", AuthMiddleware, async (req: AuthRequest, res: Response) => {
    if (req.authData?.role !== role_e.admin) {
        const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.PermissionDeniedError }
        res.send(result);
        return;
    }
    const { Bucket, Private } = req.body as { Bucket?: string; Private?: boolean };
    if (!Bucket || Private === undefined) {
        const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.InvalidInputError }
        res.send(result);
        return;
    }
    try {
        const policy = createPolicy(Bucket, Private || false);
        const exists = await minioClient.bucketExists(Bucket);
        if (!exists) {
            const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.NotFoundError }
            res.send(result);
            return;
        }
        else {
            const result: responst_t<"none"> = { status: "success" }
            await minioClient.setBucketPolicy(Bucket, JSON.stringify(policy));
            res.send(result);
        }
    } catch (err) {
        const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.UnknownError }
        console.log(err);
        res.send(result);
    }
});
app.delete("/bucket", AuthMiddleware, async (req: AuthRequest, res: Response) => {
    if (req.authData?.role !== role_e.admin) {
        const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.PermissionDeniedError }
        res.send(result);
        return;
    }
    const { Bucket } = req.body as { Bucket?: string };
    if (!Bucket) {
        const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.InvalidInputError }
        res.send(result);
        return;
    }
    try {
        const exists = await minioClient.bucketExists(Bucket);
        if (!exists) {
            const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.NotFoundError }
            res.send(result);
            return;
        }
        else {
            const result: responst_t<"none"> = { status: "success" }
            await emptyBucket(Bucket);            
            await minioClient.removeBucket(Bucket);
            res.send(result);
        }
    } catch (err) {
        const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.UnknownError }
        console.log(err);
        res.send(result);
    }
});
/*********************************************** */
// Start Server
/*********************************************** */
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});