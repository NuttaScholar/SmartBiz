const admin = new Mongo("mongodb://127.0.0.1:27017/?directConnection=true").getDB("admin");
if (!admin.auth(process.env.MONGO_INITDB_ROOT_USERNAME, process.env.MONGO_INITDB_ROOT_PASSWORD)) quit(1);
quit(admin.runCommand({ ping: 1 }).ok === 1 ? 0 : 1);
