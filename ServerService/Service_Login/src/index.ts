import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { transactionType_e, DailyTotal_t, statement_t, responstDB_t, errorCode_e, TransitionForm_t, ContactForm_t, LoginForm_t } from "./type";
import moment from 'moment-timezone'
import bcrypt from 'bcrypt';

/*********************************************** */
// Instance 
/*********************************************** */
const app = express();

/*********************************************** */
// Config
/*********************************************** */
const PORT = 3001;

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
    passHash: {
        type: String,
        required: true
    }
});

// สร้าง Model
const User = mongoose.model("Profile", profileSchema);
/*********************************************** */
// Function
/*********************************************** */

/*********************************************** */
// Routes Setup
/*********************************************** */
app.post('/user', async (req: Request, res: Response) => {
    
})
app.post('/login', async (req: Request, res: Response) => {
    const {email, pass} = req.body as LoginForm_t;

    try{
        const resultDB = await User.findOne({ email: email });

        if(resultDB){
            const result = await bcrypt.compare(pass, resultDB.passHash)

            if(result){
                res.send("ok");
            }else{
                res.send("fail");
            }
        }else{
            res.send("Email not found");
        }    
    }catch(err){
        console.log(err);
        res.send(err);
    }
    
})
app.post('/token', async (req: Request, res: Response) => {
    
})
app.get('/user', async (req: Request, res: Response) => {
    
})
app.get('/', async (req: Request, res: Response) => {
    
})

app.delete('/user', async (req: Request, res: Response) => {
    
})

app.put('/user', async (req: Request, res: Response) => {
    
})


/*********************************************** */
// Start Server
/*********************************************** */
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});