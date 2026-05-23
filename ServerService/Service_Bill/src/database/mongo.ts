import mongoose from "mongoose";
import { MONGO_URI_ACCOUNT, MONGO_URI_BILL, MONGO_URI_STOCK } from "../config";

const connections: Record<string, mongoose.Connection> = {};

async function createConn(name: string, uri: string) {
  const conn = await mongoose.createConnection(uri, { dbName: name });

  conn.on("connected", () => console.log(`[DB] ${name} connected`));
  conn.on("error", err => console.error(`[DB] ${name} error:`, err));
  conn.on("disconnected", () => console.log(`[DB] ${name} disconnected`));

  return conn;
}

export async function connectDB() {
  if (Object.keys(connections).length > 0) return connections;

  connections.Account = await createConn("Account", MONGO_URI_ACCOUNT);

  connections.Bill = await createConn("Bill", MONGO_URI_BILL);
  connections.Stock = await createConn("Stock", MONGO_URI_STOCK);

  console.log("Connected to databases:", Object.keys(connections));
  return connections;
}

export function getDB(name: "Account" | "Bill" | "Stock") {
  const conn = connections[name];
  if (!conn) throw new Error(`Database '${name}' is not connected`);
  return conn;
}
