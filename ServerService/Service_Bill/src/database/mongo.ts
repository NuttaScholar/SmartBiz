import { MongoClient, Db } from "mongodb";

const MONGO_URI = process.env.DB_URL || "mongodb://root:example@localhost:27017";
const DB_NAME = process.env.DB_NAME || "Bill";

let db: Db;

export const connectMongo = async () => {
  if (db) return db;

  const client = new MongoClient(MONGO_URI);
  await client.connect();

  db = client.db(DB_NAME);
  console.log("MongoDB connected:", DB_NAME);

  return db;
};

export const getDB = () => {
  if (!db) throw new Error("MongoDB not initialized");
  return db;
};
