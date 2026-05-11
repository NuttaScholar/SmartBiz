import mongoose from "mongoose";

const MONGO_URI = process.env.DB_URL || "mongodb://localhost:27017/SmartBiz";

export const connectMongo = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected");
    } catch (err) {
        console.error("MongoDB connection error:", err);
    }
};
