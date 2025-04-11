import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { transactionType_e, DailyTotal_t, statement_t } from "./type";

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
    tax: String,
    detail: String,
});
const transatcionSchema = new mongoose.Schema({
    topic: String,
    type: Number,
    amount: Number,
    desc: String,
    contact: { type: mongoose.Schema.Types.String, ref: "contact" },
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
        console.log(req.body);
        const newUser = new User(req.body);
        await newUser.save().then(() => console.log("User added!"));
        res.send("Message received!");
    } catch (err) {
        res.send({ Error: err });
    }
})
app.post('/transaction', async (req: Request, res: Response) => {
    try {
        console.log(req.body);
        const newTransatcion = new Transatcion(req.body);
        await newTransatcion.save().then(() => console.log("Transatcion added!"));
        res.send("Message received!");
    } catch (err) {
        res.send({ Error: err });
    }
})
app.get('/contact', async (req: Request, res: Response) => {
    User.find().then((data) => {
        res.send(data);
    })
})
app.get('/transaction', async (req: Request, res: Response) => {
    Transatcion.aggregate([
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    month: { $dateToString: { format: "%Y-%m", date: "$date" } }
                },
                transactions: {
                    $push: {
                        id: "$id",
                        topic: "$topic",
                        type: "$type",
                        money: "$amount",
                        who: "$contact",
                        description: "$description"
                    }
                }
            }
        },
        {
            $sort: { "_id.date": 1 }
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

        const result: statement_t[] = data.map(monthGroup => ({
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
    console.log(`id: ${req.query._id}`)
    Transatcion.deleteOne({ _id: req.query._id }).then((result) => {
        console.log(`count: ${result.deletedCount}, acknowledged: ${result.acknowledged}`)
        res.send(result);
    })
})
app.put('/contact', async (req: Request, res: Response) => {
    User.updateOne({ _id: req.query._id }, req.body).then((result) => {
        res.send(result);
    })
})
app.put('/transaction', async (req: Request, res: Response) => {
    Transatcion.updateOne({ _id: req.query._id }, req.body).then((result) => {
        res.send(result);
    })
})

/*********************************************** */
// Start Server
/*********************************************** */
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});