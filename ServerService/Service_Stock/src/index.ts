import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { productInfo_t, responst_t, tokenPackage_t } from "./type";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import { errorCode_e, role_e, stockStatus_e } from "./enum";
import multer from "multer";
import * as minio from "minio";
import sharp from "sharp";
import crypto from "crypto";

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
const DefaultBucket = "product";
const MAX_W = 720;
const MAX_H = 720;

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
// Multer Setup
/*********************************************** */
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB (ปรับตามต้องการ)
    },
    fileFilter: (req, file, cb) => {
        // อนุญาตเฉพาะไฟล์ภาพที่คาดหวัง
        if (!/^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype)) {
            return cb(new Error("Unsupported file type"));
        }
        cb(null, true);
    },
});
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
// Mongoose Setup
/*********************************************** */
// เชื่อมต่อ MongoDB
mongoose.connect(process.env.DB_URL as string);

// กำหนด Schema
const productSchema = new mongoose.Schema<productInfo_t>({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: Number, required: true },
    status: { type: Number, required: true },
    amount: { type: Number, },
    description: { type: String, },
    img: { type: String },
    price: { type: Number },
    condition: { type: Number },
});

// สร้าง Model
const Product_m = mongoose.model("product", productSchema);

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
        Statement: Private === true ? [] : [
            {
                Effect: "Allow",
                Principal: { AWS: ["*"] },
                Action: ["s3:GetObject"],
                Resource: [`arn:aws:s3:::${Bucket}/*`],
            },
        ],
    };
    return policy;
}
async function postImg(img: Buffer<ArrayBufferLike>, Bucket: string, Key: string): Promise<{ url: string }> {
    try {
        const webpBuf = await sharp(img)
            .rotate()                           // แก้ orientation
            .resize({ width: MAX_W, height: MAX_H, fit: "inside", withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();
        const newKey = `${Key}_${crypto.randomBytes(8).toString("hex")}`
        await minioClient.putObject(Bucket, newKey, webpBuf, webpBuf.length, {
            "Content-Type": "image/webp",
            "Cache-Control": "public, max-age=36000, immutable",
        });
        const minioHost = process.env.MINIO_HOST ?? "http://localhost:9000";
        const webpUrl = `${minioHost}/${Bucket}/${newKey}`;
        return { url: webpUrl }
    } catch (err) {
        throw new Error("Upload image failed");
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
app.post('/product', AuthMiddleware, upload.single("file"), async (req: AuthRequest, res: Response) => {
    const data = req.authData;
    try {
        if (data?.role === role_e.admin) {
            const data = req.body as productInfo_t;

            if (await Product_m.findOne({ id: data.id })) {
                const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.AlreadyExistsError };
                return res.send(result);
            } else {
                let status = stockStatus_e.normal;

                if (data.amount !== undefined && data.condition !== undefined) {
                    const amount = Number(data.amount);
                    const condition = Number(data.condition);
                    if (amount === 0) {
                        console.log("stockOut")
                        status = stockStatus_e.stockOut;
                    } else if (amount < condition) {
                        console.log("stockLow")
                        status = stockStatus_e.stockLow;
                    } else {
                        console.log("normal")
                        status = stockStatus_e.normal
                    }
                }

                if (req.file) {
                    const resImg = await postImg(req.file.buffer, DefaultBucket, data.id);
                    const newProduct = new Product_m({ ...data, status: status, img: resImg.url });
                    await newProduct.save();
                } else {
                    const newProduct = new Product_m({ ...data, status: status });
                    await newProduct.save();
                }

                const result: responst_t<"none"> = { status: "success" };
                return res.send(result);
            }
        } else {
            const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.PermissionDeniedError }
            return res.send(result);
        }
    } catch (err) {
        console.error(err);
        const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.UnknownError };
        return res.send(result);
    }
})
app.put('/product', AuthMiddleware, upload.single("file"), async (req: AuthRequest, res: Response) => {
    const data = req.authData;
    try {
        if (data?.role === role_e.admin) {
            const data = req.body as productInfo_t;
            const resProduct = await Product_m.findOne({ id: data.id })
            if (!resProduct) {
                const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.NotFoundError };
                return res.send(result);
            } else {
                let status = stockStatus_e.normal;

                if (data.amount !== undefined && data.condition !== undefined) {
                    const amount = Number(resProduct.amount);
                    const condition = Number(data.condition);
                    if (amount === 0) {
                        console.log("stockOut")
                        status = stockStatus_e.stockOut;
                    } else if (amount < condition) {
                        console.log("stockLow")
                        status = stockStatus_e.stockLow;
                    } else {
                        console.log("normal")
                        status = stockStatus_e.normal
                    }
                }
                if (req.file) {
                    if (resProduct.img) {
                        const Bucket = DefaultBucket;
                        const Key = resProduct.img?.split("/").pop() as string;
                        await minioClient.removeObject(Bucket, Key);
                    }
                    const resImg = await postImg(req.file.buffer, DefaultBucket, data.id);
                    await Product_m.updateOne({ id: data.id }, { ...data, status: status, img: resImg.url });
                } else if (data.img === "") {
                    if (resProduct.img) {
                        const Bucket = DefaultBucket;
                        const Key = resProduct.img?.split("/").pop() as string;
                        await minioClient.removeObject(Bucket, Key);
                    }
                    await Product_m.updateOne({ id: data.id }, { ...data, status: status, img: "" });
                } else {
                    await Product_m.updateOne({ id: data.id }, { ...data, status: status });
                }
                const result: responst_t<"none"> = { status: "success" };
                return res.send(result);
            }
        } else {
            const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.PermissionDeniedError }
            return res.send(result);
        }
    } catch (err) {
        console.error(err);
        const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.UnknownError };
        return res.send(result);
    }
});
app.get('/product', AuthMiddleware, async (req: AuthRequest, res: Response) => {
    const data = req.authData;
    try {
        if (data?.role === role_e.admin) {
            const { type, name, status } = req.query;
            let filter: any = {};
            const matchStage = name ? { $match: { name: { $regex: name, $options: "i" } } } : null;
            if (status) filter.status = Number(status);
            if (type) filter.type = Number(type);
            const data: productInfo_t[] = await Product_m.aggregate([
                { $match: filter },
                ...(matchStage ? [matchStage] : []),
                {
                    $project: {
                        _id: 0,
                        id: "$id",            // ไม่ต้องส่ง _id ออก
                        type: "$type",
                        name: "$name",
                        img: "$img",
                        condition: "$condition",
                        status: "$status",
                        price: "$price",
                        description: "$description",
                        amount: "$amount"
                    }
                },
                {
                    $sort: { "name": 1 }
                },
            ]);
            const result: responst_t<"getProduct"> = { status: "success", result: data }
            return res.send(result);
        } else {
            const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.PermissionDeniedError }
            return res.send(result);
        }
    } catch (err) {
        console.error(err);
        const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.UnknownError };
        return res.send(result);
    }
})
app.delete('/product', AuthMiddleware, async (req: AuthRequest, res: Response) => {
    const data = req.authData;
    try {
        if (data?.role === role_e.admin) {
            const { id } = req.query;
            const data = await Product_m.findOne({ id: id });
            if (data?.img) {
                const Key = data.img.split("/").pop() as string;
                await minioClient.removeObject(DefaultBucket, Key);
            }
            await Product_m.deleteOne({ id: id });
            const result: responst_t<"none"> = { status: "success" };
            return res.send(result);
        } else {
            const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.PermissionDeniedError }
            return res.send(result);
        }
    } catch (err) {
        console.error(err);
        const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.UnknownError };
        return res.send(result);
    }
})


/*********************************************** */
// Start Server
/*********************************************** */
app.listen(PORT, async () => {
    const exists = await minioClient.bucketExists(DefaultBucket);
    if (!exists) {
        const policy = createPolicy(DefaultBucket, false);
        await minioClient.makeBucket(DefaultBucket, "us-east-1");
        await minioClient.setBucketPolicy(DefaultBucket, JSON.stringify(policy));
    }
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});