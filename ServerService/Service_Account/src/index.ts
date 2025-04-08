import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { transactionType_e } from "./type";

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
    data: Date,
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
    Transatcion.find().populate("contact").limit(10).then((data) => {
        res.send(data);
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