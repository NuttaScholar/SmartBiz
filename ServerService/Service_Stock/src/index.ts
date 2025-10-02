import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { productInfo_t, responst_t, tokenPackage_t } from "./type";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import { errorCode_e, role_e, stockStatus_e } from "./enum";

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
app.post('/product', AuthMiddleware, async (req: AuthRequest, res: Response) => {
    const data = req.authData;
    try {
        if (data?.role === role_e.admin) {
            const data = req.body as productInfo_t;

            if (await Product_m.findOne({ id: data.id })) {
                const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.AlreadyExistsError };
                return res.send(result);
            } else {
                const newUser = new Product_m({ ...data, status: stockStatus_e.normal });
                await newUser.save();
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
app.get('/product', AuthMiddleware, async (req: AuthRequest, res: Response) => {
    const data = req.authData;
    try {
        if (data?.role === role_e.admin) {
            const { type, name, status } = req.query;
            let filter: any = {};
            const matchStage = name ? { $match: { name: { $regex: name, $options: "i" } } } : null;
            if (status) filter.status = Number(status);
            if (type) filter.type = Number(type);
            console.log(filter);
            const data: productInfo_t[] = await Product_m.aggregate([
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


/*********************************************** */
// Start Server
/*********************************************** */
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});