// Run with MongoDB 8.0+ mongosh --nodb; never put credentials in command arguments.
const admin = new Mongo("mongodb://mongo:27017/?directConnection=true").getDB("admin");
if (!admin.auth(process.env.MONGO_INITDB_ROOT_USERNAME, process.env.MONGO_INITDB_ROOT_PASSWORD)) {
  throw new Error("MongoDB administrator authentication failed");
}
let status;
try {
  status = admin.runCommand({ replSetGetStatus: 1 });
} catch (error) {
  if (error.code !== 94) throw error;
  status = { ok: 0, code: 94 };
}
// The legacy shell returns { ok: 0, code: 94 } instead of necessarily throwing.
if (status.ok !== 1 && status.code !== 94) {
  throw new Error("Cannot read replica set status (code " + status.code + ")");
}
if (status.ok !== 1) {
  const result = admin.runCommand({ replSetInitiate: { _id: "rs0", members: [{ _id: 0, host: "mongo:27017" }] } });
  if (result.ok !== 1) throw new Error("Cannot initialize replica set");
}
for (let attempt = 0; attempt < 60; attempt++) {
  const primary = admin.runCommand({ hello: 1 });
  if (primary.ok !== 1) throw new Error("Cannot check primary status");
  if (primary.isWritablePrimary && primary.setName === "rs0") quit(0);
  sleep(1000);
}
throw new Error("MongoDB did not elect a primary within 60 seconds");
