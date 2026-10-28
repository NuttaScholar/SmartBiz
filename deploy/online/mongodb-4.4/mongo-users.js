// Idempotent provisioning. Existing volumes require the CURRENT root credentials.
const admin = new Mongo("mongodb://mongo:27017/?replicaSet=rs0").getDB("admin");
if (!admin.auth(_getEnv("MONGO_INITDB_ROOT_USERNAME"), _getEnv("MONGO_INITDB_ROOT_PASSWORD"))) {
  throw new Error("MongoDB administrator authentication failed");
}
const accounts = [
  ["account", ["Account"]],
  ["login", ["User"]],
  ["stock", ["Stock"]],
  ["bill", ["Account", "Bill", "Stock"]],
  ["storefront", ["Account", "Bill", "Stock", "StoreFront"]],
];
for (const [service, databases] of accounts) {
  const user = `smartbiz_${service}`;
  const pwd = _getEnv(`MONGO_${service.toUpperCase()}_PASSWORD`);
  if (!/^[a-f0-9]{64}$/.test(pwd || "")) throw new Error(`Invalid password for ${service}: use 64 hexadecimal characters`);
  const roles = databases.map(db => ({ role: "readWrite", db }));
  if (admin.getUser(user)) admin.updateUser(user, { pwd, roles });
  else admin.createUser({ user, pwd, roles });
}
print("Application database accounts provisioned");
