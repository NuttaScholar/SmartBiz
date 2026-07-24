import mongoose from "mongoose";
import {
  MONGO_URI_STOCK,
  MONGO_URI_STOREFRONT,
} from "../config";

export type DatabaseName = "Stock" | "StoreFront";

const connections = new Map<DatabaseName, mongoose.Connection>();

async function createConnection(
  name: DatabaseName,
  uri: string,
): Promise<mongoose.Connection> {
  const connection = mongoose.createConnection(uri, { dbName: name });

  connection.on("connected", () => console.log(`[DB] ${name} connected`));
  connection.on("error", (error) =>
    console.error(`[DB] ${name} error:`, error),
  );
  connection.on("disconnected", () =>
    console.log(`[DB] ${name} disconnected`),
  );

  return connection.asPromise();
}

export async function connectDB(): Promise<
  ReadonlyMap<DatabaseName, mongoose.Connection>
> {
  if (connections.size > 0) {
    return connections;
  }

  const databaseConfigs: Array<[DatabaseName, string]> = [
    ["Stock", MONGO_URI_STOCK],
    ["StoreFront", MONGO_URI_STOREFRONT],
  ];
  const connectedDatabases = await Promise.all(
    databaseConfigs.map(async ([name, uri]) => [
      name,
      await createConnection(name, uri),
    ] as const),
  );

  connectedDatabases.forEach(([name, connection]) => {
    connections.set(name, connection);
  });

  return connections;
}

export function getDB(name: DatabaseName): mongoose.Connection {
  const connection = connections.get(name);
  if (!connection) {
    throw new Error(`Database '${name}' is not connected`);
  }

  return connection;
}

export async function disconnectDB(): Promise<void> {
  await Promise.all(
    Array.from(connections.values(), (connection) => connection.close()),
  );
  connections.clear();
}
