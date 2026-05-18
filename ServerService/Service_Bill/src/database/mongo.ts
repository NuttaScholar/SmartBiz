import mongoose from "mongoose";

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

  connections.Account = await createConn(
    "Account",
    process.env.MONGO_URI_ACCOUNT || "mongodb://localhost:27017/Account"
  );
  
  connections.Bill = await createConn(
    "Bill",
    process.env.MONGO_URI_BILL || "mongodb://localhost:27017/Bill"
  );

  console.log("Connected to databases:", Object.keys(connections));
  return connections;
}

export function getDB(name: "Account" | "Bill") {
  const conn = connections[name];  
  if (!conn) throw new Error(`Database '${name}' is not connected`);
  return conn;
}
