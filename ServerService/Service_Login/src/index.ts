import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { LoginForm_t, responstLogin_t, tokenPackage_t, TokenForm_t, RegistFrom_t, UserProfile_t, EditUserFrom_t } from "./type";
import moment from 'moment-timezone';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import https from "https";
import fs from "fs";
import path from "path";
import cookieParser from "cookie-parser";
import { errorCode_e, role_e } from "./enum";

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
const defaultPass = "Default";
const saltRounds = 10;
/*********************************************** */
// Middleware Setup
/*********************************************** */
// อนุญาตให้ React frontend สามารถส่งคำขอมาได้
app.use(cors({
    origin: "http://localhost:3030", // URL ของ React (Web)
    credentials: true, // อนุญาตให้ส่ง cookie ไปกลับ
}));
app.use(express.json());
app.use(cookieParser());

/*********************************************** */
// Load SSL Certificate
/*********************************************** */
const key = fs.readFileSync(path.join(__dirname, process.env.SSL_KEY || ""));
const cert = fs.readFileSync(path.join(__dirname, process.env.SSL_CERT || ""));

/*********************************************** */
// Mongoose Setup
/*********************************************** */
// เชื่อมต่อ MongoDB
mongoose.connect("mongodb://root:example@localhost:27017/User?authSource=admin");

// กำหนด Schema
const profileSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true  // ห้ามซ้ำ
    },
    name: {
        type: String,
        required: true,
    },
    role: {
        type: Number,
        required: true,
    },
    passHash: {
        type: String,
        required: true
    },
    enable: {
        type: Boolean,
        required: true
    },
    tel: String,
    img: String // Image URL
});

// สร้าง Model
const User = mongoose.model("Profile", profileSchema);
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
function Auth(req: Request, res: Response, onSuccess: (data: tokenPackage_t) => void) {
    if (req.headers.authorization) {
        const accessToken = req.headers.authorization.split(" ")[1];
        const decoded = decoder(accessToken);

        if (decoded) {
            onSuccess(decoded);
        } else {
            const result: responstLogin_t<"none"> = { status: "error", errCode: errorCode_e.TokenExpiredError }
            res.send(result);
        }
    } else {
        const result: responstLogin_t<"none"> = { status: "error", errCode: errorCode_e.UnauthorizedError }
        res.send(result);
    }
}
/*********************************************** */
// Routes Setup
/*********************************************** */
app.post('/user', async (req: Request, res: Response) => {
    try {
        Auth(req, res, async (data) => {
            if (data.type === "accessToken" && data.role === role_e.admin) {
                const data = req.body as RegistFrom_t;
                const passHash = await bcrypt.hash(defaultPass, saltRounds)
                const newData: UserProfile_t = { passHash: passHash, enable: true, ...data };
                const newUser = new User(newData);
                newUser.save().then(() => {
                    const result: responstLogin_t<"none"> = { status: "success" };
                    res.send(result);
                }).catch((err) => {
                    const result: responstLogin_t<"none"> = { status: "error", errCode: errorCode_e.InvalidInputError }
                    res.send(result);
                })
            } else {
                const result: responstLogin_t<"none"> = { status: "error", errCode: errorCode_e.PermissionDeniedError }
                res.send(result);
            }
        })
    } catch (err) {
        const result: responstLogin_t<"none"> = { status: "error", errCode: errorCode_e.UnknownError }
        console.log(err);
        res.send(result);
    }
});
app.post('/login', async (req: Request, res: Response) => {
    const { email, pass } = req.body as LoginForm_t;

    try {
        const resultDB = await User.findOne({ email: email });

        if (resultDB) {
            const compare = await bcrypt.compare(pass, resultDB.passHash)

            if (compare) {
                const accessToken = jwt.sign(
                    {
                        username: resultDB.email,
                        role: resultDB.role,
                        type: "accessToken",
                    },
                    secret,
                    {
                        expiresIn: "15m",
                    }
                );
                const refreshToken = jwt.sign(
                    {
                        username: resultDB.email,
                        role: resultDB.role,
                        type: "refreshToken",
                    },
                    secret,
                    {
                        expiresIn: "1d",
                    }
                );
                const result: responstLogin_t<"postLogin"> = { status: "success", token: accessToken }
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: true,       // ตั้ง true เมื่อใช้ HTTPS
                    sameSite: "strict", // ป้องกัน CSRF
                    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 วัน
                });
                res.send(result);
            } else {
                const result: responstLogin_t<"none"> = { status: "error", errCode: errorCode_e.InvalidInputError }
                res.send(result);
            }
        } else {
            const result: responstLogin_t<"none"> = { status: "error", errCode: errorCode_e.InvalidInputError }
            res.send(result);
        }
    } catch (err) {
        const result: responstLogin_t<"none"> = { status: "error", errCode: errorCode_e.UnknownError }

        console.log(err);
        res.send(result);
    }
});
app.post('/logout', async (req: Request, res: Response) => {
    const result: responstLogin_t<"none"> = { status: "success" }
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
    });
    res.send(result);
})
app.get('/user', async (req: Request, res: Response) => {
    Auth(req, res, async (data) => {
        if (data.type === "accessToken" && data.role === role_e.admin) {
            const name = req.query.name;
            console.log("key",name);
            const matchStage = name ? { $match: { name: { $regex: name, $options: "i" } } } : null;

            User.aggregate([
                ...(matchStage ? [matchStage] : []),
                {
                    $project: {
                        _id: "$_id",
                        email: "$email",
                        name: "$name",
                        role: "$role",
                        enable: "$enable",
                        tel: "$tel",
                        img: "$img" // Image URL
                    }
                },
                {
                    $sort: { "codeName": 1 }
                },
            ]).then((data) => {
                const result: responstLogin_t<"getUser"> = { status: "success", result: data }
                res.send(result);
            }).catch((err) => {
                const result: responstLogin_t<"getUser"> = { status: "error", errCode: errorCode_e.UnknownError }
                console.log(err);
                res.send(result);
            });
        } else {
            const result: responstLogin_t<"none"> = { status: "error", errCode: errorCode_e.PermissionDeniedError }
            res.send(result);
        }
    })
});
app.get('/token', async (req: Request, res: Response) => {
    if (req.cookies.refreshToken) {
        const token = req.cookies.refreshToken;
        const decoded = decoder(token);
        if (decoded) {
            if (decoded.type === "refreshToken") {
                const accessToken = jwt.sign(
                    {
                        username: decoded.username,
                        role: decoded.role,
                        type: "accessToken",
                    },
                    secret,
                    {
                        expiresIn: "15m",
                    }
                );
                const result: responstLogin_t<"getToken"> = { status: "success", token: accessToken }
                res.send(result);
            }
        } else {
            const result: responstLogin_t<"none"> = { status: "error", errCode: errorCode_e.TokenExpiredError }
            res.send(result);
        }
    } else {
        const result: responstLogin_t<"none"> = { status: "error", errCode: errorCode_e.UnauthorizedError }
        res.send(result);
    }
})
app.delete('/user', async (req: Request, res: Response) => {
    Auth(req, res, async (data) => {
        if (data.type === "accessToken" && data.role === role_e.admin) {
            const data = await User.deleteOne({ _id: req.query.id });
            const result: responstLogin_t<"none"> = { status: "success" };

            res.send(result);
        } else {
            const result: responstLogin_t<"none"> = { status: "error", errCode: errorCode_e.PermissionDeniedError }
            res.send(result);
        }
    });
});
app.put('/user', async (req: Request, res: Response) => {
    Auth(req, res, async (data) => {
        if (data?.type === "accessToken" && data.role === role_e.admin) {
            const data = req.body as EditUserFrom_t;
            const { id, ...newData } = data;

            User.updateOne({ _id: id }, newData).then((data) => {
                const result: responstLogin_t<"none"> = { status: "success" };
                res.send(result);
            }).catch((err) => {
                const result: responstLogin_t<"none"> = { status: "error", errCode: errorCode_e.UnknownError };
                console.log(err);
                res.send(result);
            })
        } else {
            const result: responstLogin_t<"none"> = { status: "error", errCode: errorCode_e.PermissionDeniedError }
            res.send(result);
        }
    })
});
app.get('/', async (req: Request, res: Response) => {
    console.log("accessToken", req.cookies.accessToken);
    console.log("refreshToken", req.cookies.refreshToken);
    const result: responstLogin_t<"none"> = { status: "success" };
    res.send(result);
});

/*********************************************** */
// Start Server
/*********************************************** */
/*const server = https.createServer({ key, cert }, app);
server.listen(PORT, "0.0.0.0", () => {
    console.log(`HTTPS Server is running at https://localhost:${PORT}`);
});*/
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
