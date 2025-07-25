import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { TransitionForm_t, ContactForm_t, responst_t, tokenPackage_t, statement_t, ContactInfo_t, transactionDetail_t } from "./type";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import { errorCode_e, role_e, transactionType_e } from "./enum";

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

type transatcion_t = {
    topic: string;
    type: number;
    money: number;
    description?: string;
    who?: string;
    date: Date;
}
type wallet_t = {
    name: string;
    amount: number;
}
// กำหนด Schema
const contactSchema = new mongoose.Schema({
    codeName: {
        type: String,
        required: true,
        unique: true  // ห้ามซ้ำ
    },
    billName: { type: String, required: true },
    address: String,
    tel: String,
    taxID: String,
    description: String,
});
const transatcionSchema = new mongoose.Schema<transatcion_t>({
    topic: { type: String, required: true },
    type: { type: Number, required: true },
    money: { type: Number, required: true },
    description: String,
    who: { type: mongoose.Schema.Types.String, ref: "contact" },
    date: { type: Date, required: true },
});
const walletSchema = new mongoose.Schema<wallet_t>({
    name: { type: String, required: true },
    amount: { type: Number, required: true },
});

// สร้าง Model
const User = mongoose.model("contact", contactSchema);
const Transatcion = mongoose.model<transatcion_t>("transaction", transatcionSchema);
const Wallet = mongoose.model("wallet", walletSchema);

Wallet.findOne({ name: "main" }).then((res) => {
    if (!res) {
        const newWallet = new Wallet({ name: "main", amount: 0 });
        newWallet.save().then(() => {
            console.log("Create Wallet Success!");
        }).catch(() => {
            console.log("Create Wallet Failed!");
        });
    }
}).catch((err) => { console.log(err); })

/*********************************************** */
// Function
/*********************************************** */
const calWallet = (type: transactionType_e, wallet: number, val: number, invert?: boolean): number => {
    let total = 0;

    if (invert) {
        switch (type) {
            case transactionType_e.expenses:
            case transactionType_e.lend:
                total = wallet + val;
                break;
            case transactionType_e.income:
            case transactionType_e.loan:
                total = wallet - val;
                break;
            default:
                total = wallet;
                break;
        }
    } else {
        switch (type) {
            case transactionType_e.expenses:
            case transactionType_e.lend:
                total = wallet - val;
                break;
            case transactionType_e.income:
            case transactionType_e.loan:
                total = wallet + val;
                break;
            default:
                total = wallet;
                break;
        }
    }

    return total;
}

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
app.post('/contact', AuthMiddleware, async (req: AuthRequest, res: Response) => {
    const data = req.authData;
    try {
        if (data?.role === role_e.admin) {
            const data = req.body as ContactForm_t;

            if (await User.findOne({ codeName: data.codeName })) {
                const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.InUseError };
                return res.send(result);
            } else {
                const newUser = new User(data);
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
app.post('/transaction', AuthMiddleware, async (req: AuthRequest, res: Response) => {
    const data = req.authData;
    try {
        if (data?.role === role_e.admin) {
            const { money, type, ...rest } = req.body as TransitionForm_t;
            const newTransatcion = new Transatcion(req.body);
            await newTransatcion.save();
            const val = await Wallet.findOne({ name: "main" });
            const resWallet = await Wallet.updateOne({ _id: val?._id }, { amount: calWallet(type, val?.amount || 0, money) })

            if (resWallet.acknowledged) {
                const result: responst_t<"none"> = { status: "success" };
                return res.send(result);
            } else {
                const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.TimeoutError };
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
app.get('/contact', AuthMiddleware, async (req: AuthRequest, res: Response) => {
    const data = req.authData;
    try {
        if (data?.role === role_e.admin) {
            const id = req.query.id;
            const matchStage = id ? { $match: { codeName: { $regex: id, $options: "i" } } } : null;
            const data: ContactInfo_t[] = await User.aggregate([
                ...(matchStage ? [matchStage] : []),
                {
                    $project: {
                        _id: 0,            // ไม่ต้องส่ง _id ออก
                        codeName: "$codeName", // เปลี่ยนชื่อ _id เป็น codeName                            
                        billName: "$billName",
                        description: "$description",
                        address: "$address",
                        taxID: "$taxID",
                        tel: "$tel",
                    }
                },
                {
                    $sort: { "codeName": 1 }
                },
            ]);
            const result: responst_t<"getContact"> = { status: "success", result: data };
            return res.send(result);
        } else {
            const result: responst_t<"getContact"> = { status: "error", errCode: errorCode_e.PermissionDeniedError }
            return res.send(result);
        }
    } catch (err) {
        console.error(err);
        const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.UnknownError };
        return res.send(result);
    }
})
app.get('/trandetail', AuthMiddleware, async (req: AuthRequest, res: Response) => {
    const data = req.authData;
    try {
        if (data?.role === role_e.admin) {
            const id = req.query.id;
            const trans: transatcion_t | null = await Transatcion.findOne({ _id: id });
            if (trans !== null) {
                const { date, money, topic, type, description, who }: transatcion_t = trans;
                const result: TransitionForm_t = { date: date, money: money, topic: topic, type: type, description: description, who: who };
                const response: responst_t<"getTransDetail"> = { status: "success", result: result };
                return res.send(response);
            } else {
                const response: responst_t<"getTransDetail"> = { status: "error", errCode: errorCode_e.NotFoundError };
                return res.send(response);
            }
        } else {
            const response: responst_t<"getTransDetail"> = { status: "error", errCode: errorCode_e.PermissionDeniedError };
            return res.send(response);
        }
    } catch (err) {
        console.error(err);
        const result: responst_t<"getTransaction"> = { status: "error", errCode: errorCode_e.UnknownError };
        return res.send(result);
    }
})
app.get('/transaction', AuthMiddleware, async (req: AuthRequest, res: Response) => {
    const data = req.authData;
    try {
        if (data?.role === role_e.admin) {
            const { from, to, who, topic, type } = req.query;
            let filter: any = {
                date: {
                    $gte: new Date(from as string || Date.now()),
                    $lte: new Date(to as string || Date.now())
                },
            }
            if (who) filter.who = who;
            if (topic) filter.topic = topic;
            if (type) filter.type = Number(type);
            const data = await Transatcion.aggregate([
                {
                    $match: filter
                },
                {
                    $addFields: {
                        newDate: {
                            $dateAdd: {
                                startDate: "$date",
                                unit: "hour",
                                amount: 7
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            date: "$date",
                            month: { $dateToString: { format: "%Y-%m", date: "$newDate" } }
                        },
                        transactions: {
                            $push: {
                                id: "$_id",
                                topic: "$topic",
                                type: "$type",
                                money: "$money",
                                who: "$who",
                                description: "$description"
                            }
                        }
                    }
                },
                {
                    $sort: { "_id.date": -1 }
                },
                {
                    // 2. จัดกลุ่มใหม่ตามเดือน
                    $group: {
                        _id: "$_id.month",
                        detail: {
                            $push: {
                                date: "$_id.date",
                                transactions: "$transactions"
                            }
                        }
                    }
                },
                {
                    $sort: { _id: -1 }
                }
            ])
            const newData: statement_t[] = data.map(monthGroup => ({
                date: new Date(monthGroup._id + "-01"), // "2025-04" → "2025-04-01"
                detail: monthGroup.detail.map((daily: any) => ({
                    date: new Date(daily.date),
                    transactions: daily.transactions
                }))
            }));
            const result: responst_t<"getTransaction"> = { status: "success", result: newData }
            return res.send(result);
        } else {
            const result: responst_t<"getTransaction"> = { status: "error", errCode: errorCode_e.PermissionDeniedError }
            return res.send(result);
        }
    } catch (err) {
        console.error(err);
        const result: responst_t<"getTransaction"> = { status: "error", errCode: errorCode_e.UnknownError };
        return res.send(result);
    }
})
app.get('/wallet', AuthMiddleware, async (req: AuthRequest, res: Response) => {
    const data = req.authData;
    try {
        if (data?.role === role_e.admin) {
            const data = await Wallet.findOne({ name: "main" });
            let resault: responst_t<"getWallet"> = { status: "success", result: data?.amount || 0 };
            return res.send(resault);
        } else {
            const result: responst_t<"getWallet"> = { status: "error", errCode: errorCode_e.PermissionDeniedError }
            return res.send(result);
        }
    } catch (err) {
        const result: responst_t<"getWallet"> = { status: "error", errCode: errorCode_e.UnknownError };
        console.log(err);
        return res.send(result);
    }
})
app.delete('/contact', AuthMiddleware, async (req: AuthRequest, res: Response) => {
    const data = req.authData;
    try {
        if (data?.role === role_e.admin) {
            const exists = await Transatcion.find({ who: req.query.id });
            if (exists.length) {
                const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.InUseError };
                return res.send(result);
            } else {
                await User.deleteOne({ codeName: req.query.id });
                const result: responst_t<"none"> = { status: "success" };
                return res.send(result);
            }
        } else {
            const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.PermissionDeniedError }
            return res.send(result);
        }
    } catch (err) {
        const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.UnknownError };
        console.log(err);
        return res.send(result);
    }
})
app.delete('/transaction', AuthMiddleware, async (req: AuthRequest, res: Response) => {
    const data = req.authData;
    try {
        if (data?.role === role_e.admin) {
            const dataTran = await Transatcion.findOne({ _id: req.query.id });
            const resTran = await Transatcion.deleteOne({ _id: req.query.id });
            const result: responst_t<"none"> = { status: "success" };

            if (resTran.deletedCount) {
                const val = await Wallet.findOne({ name: "main" });
                await Wallet.updateOne({ _id: val?._id }, { amount: calWallet(dataTran?.type === undefined ? 255 : dataTran?.type, val?.amount || 0, dataTran?.money || 0, true) })
            }
            return res.send(result);
        } else {
            const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.PermissionDeniedError }
            return res.send(result);
        }
    } catch (err) {
        const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.UnknownError };
        console.log(err);
        return res.send(result);
    }
})
app.put('/contact', AuthMiddleware, async (req: AuthRequest, res: Response) => {
    const data = req.authData;
    try {
        if (data?.role === role_e.admin) {
            const { codeName, ...rest } = req.body;
            const newData = { ...rest };

            await User.updateOne({ codeName: codeName }, newData)
            const result: responst_t<"none"> = { status: "success" };
            return res.send(result);
        } else {
            const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.PermissionDeniedError }
            return res.send(result);
        }
    } catch (err) {
        const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.UnknownError };
        console.log(err);
        return res.send(result);
    }

})
app.put('/transaction', AuthMiddleware, async (req: AuthRequest, res: Response) => {
    const data = req.authData;
    try {
        if (data?.role === role_e.admin) {
            const { type, money } = req.body as TransitionForm_t;
            const dataTran = await Transatcion.findOne({ _id: req.query.id });
            const updateRes = await Transatcion.updateOne({ _id: req.query.id }, req.body)
            if (updateRes.matchedCount) {
                const val = await Wallet.findOne({ name: "main" });
                const delWallet = calWallet(dataTran?.type === undefined ? 255 : dataTran?.type, val?.amount || 0, dataTran?.money || 0, true)

                const resWallet = await Wallet.updateOne({ _id: val?._id }, { amount: calWallet(type, delWallet, money) })

                if (resWallet.acknowledged) {
                    const result: responst_t<"none"> = { status: "success" };
                    return res.send(result);
                } else {
                    const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.TimeoutError };
                    return res.send(result);
                }
            } else {
                const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.NotFoundError };
                return res.send(result);
            }
        } else {
            const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.PermissionDeniedError }
            return res.send(result);
        }
    } catch (err) {
        const result: responst_t<"none"> = { status: "error", errCode: errorCode_e.UnknownError };
        console.log(err);
        return res.send(result);
    }
})

/*********************************************** */
// Start Server
/*********************************************** */
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});