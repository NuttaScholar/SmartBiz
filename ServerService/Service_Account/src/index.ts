import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { transactionType_e, DailyTotal_t, statement_t, responstDB_t } from "./type";
import moment from 'moment-timezone'

/*********************************************** */
// Instance 
/*********************************************** */
const app = express();

/*********************************************** */
// Config
/*********************************************** */
const PORT = 3000;

/*********************************************** */
// Middleware Setup
/*********************************************** */
// อนุญาตให้ React frontend สามารถส่งคำขอมาได้
app.use(cors());
app.use(express.json());

/*********************************************** */
// Mongoose Setup
/*********************************************** */
// เชื่อมต่อ MongoDB
mongoose.connect("mongodb://root:example@localhost:27017/Account?authSource=admin");

// กำหนด Schema
const contactSchema = new mongoose.Schema({
    _id: String,    // codeName
    billName: String,
    address: String,
    tel: String,
    taxID: String,
    description: String,
});
const transatcionSchema = new mongoose.Schema({
    topic: String,
    type: Number,
    money: Number,
    description: String,
    who: { type: mongoose.Schema.Types.String, ref: "contact" },
    date: { type: Date, required: true },
});

// สร้าง Model
const User = mongoose.model("contact", contactSchema);
const Transatcion = mongoose.model("transaction", transatcionSchema);
/*********************************************** */
// Routes Setup
/*********************************************** */
app.post('/contact', async (req: Request, res: Response) => {
    try {
        const { codeName, ...rest } = req.body;
        const newData = { _id: codeName, ...rest };
        console.log(newData);

        const newUser = new User(newData);
        newUser.save().then(() => {
            const result: responstDB_t<"post"> = { status: "success" };
            res.send(result);
        }).catch((err) => {
            const result: responstDB_t<"post"> = { status: "error" };
            console.log(err);
            res.send(result);
        });
    } catch (err) {
        const result: responstDB_t<"post"> = { status: "error" };
        console.log(err);
        res.send(result);
    }
})
app.post('/transaction', async (req: Request, res: Response) => {
    try {
        const dateInBangkok = { ...req.body, date: moment.tz(req.body.date, "Asia/Bangkok").toDate() }
        console.log(req.body);
        console.log(dateInBangkok);
        const newTransatcion = new Transatcion(req.body);
        newTransatcion.save().then(() => {
            const result: responstDB_t<"post"> = { status: "success" };
            res.send(result);
        }).catch((err) => {
            const result: responstDB_t<"post"> = { status: "error" };
            console.log(err);
            res.send(result);
        });
    } catch (err) {
        const result: responstDB_t<"post"> = { status: "error" };
        console.log(err);
        res.send(result);
    }
})
app.get('/contact', async (req: Request, res: Response) => {
    User.aggregate([{
        $project: {
            codeName: "$_id", // เปลี่ยนชื่อ _id เป็น codeName
            _id: 0,            // ไม่ต้องส่ง _id ออก
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
    ]).then((data) => {
        res.send(data);
    });
})
app.get('/transaction', async (req: Request, res: Response) => {
    const { from, to, who, topic, type } = req.query;
    let filter: any = {
        date: {
            $gte: new Date(from as string || Date.now()),
            $lte: new Date(to as string || Date.now())
        },
    }
    console.log(req.query);
    if (who) filter.contact = who;
    if (topic) filter.topic = topic;
    if (type) filter.type = Number(type);
    Transatcion.aggregate([
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
    ]).then((data) => {

        const result: responstDB_t<"getTransaction"> = data.map(monthGroup => ({
            date: new Date(monthGroup._id + "-01"), // "2025-04" → "2025-04-01"
            detail: monthGroup.detail.map((daily: any) => ({
                date: new Date(daily.date),
                transactions: daily.transactions
            }))
        }));
        res.send(result);
    })
})
app.delete('/contact', async (req: Request, res: Response) => {
    User.deleteOne({ _id: req.body._id }).then((result) => {
        console.log(`count: ${result.deletedCount}, acknowledged: ${result.acknowledged}`)
        res.send(result);
    })
})
app.delete('/transaction', async (req: Request, res: Response) => {
    console.log(`id: ${req.query.id}`)
    Transatcion.deleteOne({ _id: req.query.id }).then((data) => {
        const result: responstDB_t<"del"> = { status: "success", deletedCount: data.deletedCount };

        res.send(result);
    }).catch(() => {
        const result: responstDB_t<"del"> = { status: "error" };

        res.send(result);
    })
})
app.put('/contact', async (req: Request, res: Response) => {
    const { codeName, ...rest } = req.body;
    const newData = { ...rest };
    console.log("put", newData);

    User.updateOne({ _id: codeName }, newData).then((data) => {
        const result: responstDB_t<"put"> = { status: "success", updatedCount: data.modifiedCount };
        res.send(result);
    }).catch((err) => {
        const result: responstDB_t<"put"> = { status: "error", updatedCount: 0 };
        console.log(err);
        res.send(result);
    })
})
app.put('/transaction', async (req: Request, res: Response) => {
    console.log(`id: ${req.query.id}`);
    Transatcion.updateOne({ _id: req.query.id }, req.body).then((data) => {
        const result: responstDB_t<"put"> = { status: "success", updatedCount: data.modifiedCount };
        res.send(result);
    }).catch((err) => {
        const result: responstDB_t<"put"> = { status: "error", updatedCount: 0 };
        console.log(err);
        res.send(result);
    })
})

/*********************************************** */
// Start Server
/*********************************************** */
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});