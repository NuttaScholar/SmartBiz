// Run with mongosh --nodb: credentials are read from the container environment.
const admin = new Mongo("mongodb://mongo:27017/?directConnection=true").getDB("admin");
if (!admin.auth(process.env.MONGO_INITDB_ROOT_USERNAME, process.env.MONGO_INITDB_ROOT_PASSWORD)) {
  throw new Error("MongoDB administrator authentication failed");
}
let initialized = true;
try {
  admin.runCommand({ replSetGetStatus: 1 });
} catch (error) {
  if (error.code !== 94) throw error;
  initialized = false;
}
if (!initialized) {
  const result = admin.runCommand({ replSetInitiate: { _id: "rs0", members: [{ _id: 0, host: "mongo:27017" }] } });
  if (result.ok !== 1) throw new Error("Cannot initialize replica set");
}
for (let attempt = 0; attempt < 60; attempt++) {
  if (admin.runCommand({ hello: 1 }).isWritablePrimary) quit(0);
  sleep(1000);
}
throw new Error("MongoDB did not elect a primary within 60 seconds");
