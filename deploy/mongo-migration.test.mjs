// Explicit integration test: node --test deploy/mongo-migration.test.mjs
// Only uses uniquely named disposable containers and a test-only data volume.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { randomBytes } from 'node:crypto';

const modern = process.env.MONGO_TEST_VARIANT === '8.0';
const shell = modern ? 'mongosh' : 'mongo';
const variant = modern ? 'mongodb-8.0' : 'mongodb-4.4';
const adapt = script => {
  const helpers = 'function check(value){if(!value) throw new Error("Assertion failed");} function checkEqual(a,b){check(a===b);} function checkWrite(result){check(result.acknowledged===true || result.ok===1);}';
  script = script.replaceAll('assert.commandWorked(', 'checkWrite(').replaceAll('assert.eq(', 'checkEqual(').replaceAll('assert(', 'check(');
  return helpers + (modern ? script.replace(/_getEnv\("([^"]+)"\)/g, 'process.env.$1') : script);
};
test(`MongoDB ${variant} standalone data survives replica initialization and reruns`, { timeout: 180000 }, async () => {
  const name = `smartbiz-migration-test-${randomBytes(6).toString('hex')}`;
  const volume = `${name}-data`;
  const env = {
    ...process.env,
    MONGO_INITDB_ROOT_USERNAME: 'migration_admin',
    MONGO_INITDB_ROOT_PASSWORD: randomBytes(24).toString('hex'),
  };
  for (const service of ['ACCOUNT', 'LOGIN', 'STOCK', 'BILL', 'STOREFRONT']) {
    env[`MONGO_${service}_PASSWORD`] = randomBytes(32).toString('hex');
  }
  const image = process.env.MONGO_TEST_IMAGE || (modern ? 'mongo:8.0.5' : 'mongo:4.4.29');
  function docker(args, check = true) {
    const result = spawnSync('docker', args, { env, encoding: 'utf8', timeout: 90000 });
    if (check && result.status !== 0) throw new Error(result.stderr || result.stdout || String(result.error));
    return result;
  }
  const auth = 'const admin=db.getSiblingDB("admin"); assert(admin.auth(_getEnv("MONGO_INITDB_ROOT_USERNAME"),_getEnv("MONGO_INITDB_ROOT_PASSWORD")));';
  function evaluate(script) {
    return docker(['exec', name, shell, '--quiet', '--eval', adapt(auth + script)]).stdout;
  }
  async function ready() {
    for (let i = 0; i < 60; i++) {
      const result = docker(['exec', name, shell, '--quiet', '--nodb', '/opt/deploy/mongo-health.js'], false);
      if (result.status === 0) return;
      await new Promise(r => setTimeout(r, 500));
    }
    throw new Error('MongoDB did not become ready');
  }
  function start(replica) {
    const args = ['run', '-d', '--name', name, '--network', name, '--network-alias', 'mongo',
      '--mount', `type=volume,src=${volume},dst=/data/db`,
      '--mount', `type=bind,src=${resolve('deploy', variant)},dst=/opt/deploy,readonly`];
    for (const key of Object.keys(env).filter(k => k.startsWith('MONGO_') && k !== 'MONGO_TEST_IMAGE')) args.push('-e', key);
    args.push(image, 'bash', '-c', replica
      ? 'head -c 756 /dev/urandom | base64 > /tmp/test-key; chmod 400 /tmp/test-key; chown mongodb:mongodb /tmp/test-key; exec docker-entrypoint.sh mongod --bind_ip_all --replSet rs0 --keyFile /tmp/test-key'
      : 'exec docker-entrypoint.sh mongod --bind_ip_all');
    docker(args);
  }
  try {
    docker(['network', 'create', name]);
    docker(['volume', 'create', volume]);
    start(false);
    await ready();
    evaluate('assert.commandWorked(db.getSiblingDB("Account").sentinel.insertOne({_id:"preserved",value:42}));');
    docker(['stop', name]);
    docker(['rm', name]);
    start(true);
    await ready();
    assert.match(evaluate('try { print(admin.runCommand({replSetGetStatus:1}).code); } catch (error) { print(error.code); }'), /94/);
    for (let run = 0; run < 2; run++) {
      docker(['exec', name, shell, '--quiet', '--nodb', '/opt/deploy/mongo-replica-init.js']);
      docker(['exec', name, shell, '--quiet', '--nodb', '/opt/deploy/mongo-users.js']);
    }
    evaluate('assert.eq(admin.runCommand({isMaster:1}).setName,"rs0"); assert.eq(db.getSiblingDB("Account").sentinel.findOne({_id:"preserved"}).value,42);');
    docker(['exec', name, shell, '--quiet', '--eval',
      adapt('const admin=db.getSiblingDB("admin"); assert(admin.auth("smartbiz_account",_getEnv("MONGO_ACCOUNT_PASSWORD"))); const session=db.getMongo().startSession(); const account=session.getDatabase("Account"); session.startTransaction(); assert.commandWorked(account.sentinel.updateOne({_id:"preserved"},{$set:{value:43}})); session.commitTransaction(); assert.eq(account.sentinel.findOne({_id:"preserved"}).value,43); session.endSession();')]);
  } finally {
    docker(['rm', '-f', name], false);
    docker(['volume', 'rm', volume], false);
    docker(['network', 'rm', name], false);
  }
});
