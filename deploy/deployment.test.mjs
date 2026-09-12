import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { createHash, createHmac } from 'node:crypto';
import { createEnvironment } from './create-env.mjs';

const require = createRequire(import.meta.url);
const yaml = require('js-yaml');
const compose = yaml.load(readFileSync(new URL('../docker-compose.yml', import.meta.url), 'utf8'));
const services = compose.services;

test('public traffic enters through HTTPS edge; database and storage ports stay private', () => {
  assert.deepEqual(services.edge.ports, ['80:80', '443:443', '443:443/udp']);
  assert.equal(services.web_gateway.ports, undefined);
  assert.equal(services.mongo.ports, undefined);
  for (const name of ['minio', 'mongo-express']) {
    assert.ok(services[name].ports.every(p => p.startsWith('127.0.0.1:')));
  }
  assert.deepEqual(services['mongo-express'].profiles, ['admin']);
  assert.equal(services['mongo-express'].environment.ME_CONFIG_BASICAUTH, 'true');
  for (const [name, service] of Object.entries(services)) {
    if (!name.startsWith('service_')) continue;
    assert.equal(service.ports, undefined);
    assert.equal(service.restart, 'unless-stopped');
    assert.ok(service.healthcheck.test.join(' ').includes('/readyz'));
    assert.equal(service.build, undefined);
    assert.equal(service.pull_policy, 'missing');
    assert.ok(!JSON.stringify(service.environment).includes('MONGO_ROOT'));
    if (name !== 'service_storage') {
      assert.equal(service.depends_on['mongo-users-init'].condition, 'service_completed_successfully');
    }
  }
});

test('generated environment has independent URI-safe secrets and no shell injection', () => {
  const env = Object.fromEntries(createEnvironment('example.com', 'ops@example.com').trim().split('\n').map(line => line.split('=')));
  const secrets = Object.entries(env).filter(([key]) => /PASSWORD|SECRET/.test(key)).map(([, value]) => value);
  assert.equal(new Set(secrets).size, 10);
  for (const secret of secrets) assert.match(secret, /^[a-f0-9]{64}$/);
  for (const domain of ['https://example.com', 'example.com/path', 'localhost', 'example.com\nSECRET=oops', 'example.com:443']) {
    assert.throws(() => createEnvironment(domain, 'ops@example.com'));
  }
  assert.throws(() => createEnvironment('example.com', 'ops@example.com\nSECRET=oops'));
});

test('environment generator refuses to overwrite credentials', () => {
  const directory = mkdtempSync(join(tmpdir(), 'smartbiz-env-test-'));
  try {
    const file = join(directory, '.env.vps');
    writeFileSync(file, 'existing credentials');
    const result = spawnSync(process.execPath, [resolve('deploy/create-env.mjs'), 'example.com', 'ops@example.com'], { cwd: directory, encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.equal(readFileSync(file, 'utf8'), 'existing credentials');
  } finally {
    rmSync(directory, { recursive: true });
  }
});

test('Mongo user provisioning creates scoped users and updates them on rerun', () => {
  const users = new Map();
  const environment = Object.fromEntries(createEnvironment('example.com', 'ops@example.com').trim().split('\n').map(line => line.split('=')));
  const admin = {
    auth: () => true,
    getUser: user => users.get(user),
    createUser: data => users.set(data.user, data),
    updateUser: (user, data) => users.set(user, { user, ...data }),
  };
  function run() {
    vm.runInNewContext(readFileSync(new URL('./mongo-users.js', import.meta.url), 'utf8'), {
      Mongo: function () { return { getDB: () => admin }; },
      process: { env: environment }, print() {},
    });
  }
  run();
  assert.equal(users.size, 5);
  for (const account of users.values()) {
    assert.ok(account.roles.every(role => role.role === 'readWrite' && role.db !== 'admin'));
  }
  assert.equal(users.get('smartbiz_login').roles[0].db, 'User');
  environment.MONGO_LOGIN_PASSWORD = 'a'.repeat(64);
  run();
  assert.equal(users.size, 5);
  assert.equal(users.get('smartbiz_login').pwd, 'a'.repeat(64));
  environment.MONGO_LOGIN_PASSWORD = 'weak';
  assert.throws(run, /Invalid password/);
});

test('replica initialization only initiates uninitialized replicas and waits for primary', () => {
  const script = readFileSync(new URL('./mongo-replica-init.js', import.meta.url), 'utf8');
  for (const initialized of [false, true]) {
    let initiated = 0;
    let polls = 0;
    const admin = { auth: () => true, runCommand(command) {
      if (command.replSetGetStatus) {
        if (initialized) return { ok: 1 };
        throw Object.assign(new Error('no replset config has been received'), { code: 94 });
      }
      if (command.replSetInitiate) { initiated++; return { ok: 1 }; }
      if (command.hello) return { isWritablePrimary: ++polls >= 2 };
    } };
    assert.throws(() => vm.runInNewContext(script, {
      Mongo: function () { return { getDB: () => admin }; }, process: { env: {} },
      sleep() {}, quit(code) { assert.equal(code, 0); throw new Error('SUCCESS_EXIT'); },
    }), /SUCCESS_EXIT/);
    assert.equal(initiated, initialized ? 0 : 1);
    assert.equal(polls, 2);
  }
});

test('public presigned URLs use the HTTPS host, correct region and private client stays internal', async () => {
  Object.assign(process.env, {
    NODE_ENV: 'production', SECRET: 'a'.repeat(64), SERVICE_AUTH_SECRET: 'b'.repeat(64),
    WEB_HOSTS: 'https://app.example.com', MINIO_ENDPOINT: 'minio', MINIO_PORT: '9000',
    MINIO_USE_SSL: 'false', MINIO_PUBLIC_URL: 'https://media.example.com',
    MINIO_USER: 'test-access', MINIO_PASSWORD: 'test-secret-not-for-deployment',
    MONGO_URI_ACCOUNT: 'mongodb://unused/Account', MONGO_URI_BILL: 'mongodb://unused/Bill',
    MONGO_URI_STOCK: 'mongodb://unused/Stock', MONGO_URI_STOREFRONT: 'mongodb://unused/StoreFront',
  });
  const Storage = require('../ServerService/Service_Storage/dist/services/storage.service.js').default;
  const Evidence = require('../ServerService/Service_StoreFront/dist/services/evidence-storage.service.js').default;
  const storage = new Storage();
  // Exercise public service methods without a live object store; only bucket existence is stubbed.
  storage.client.bucketExists = async () => true;
  assert.equal(storage.client.host, 'minio');
  const links = [['GET', await storage.presignedGet('product', 'folder/a b.webp')],
    ['PUT', await storage.presignedPut('product', 'folder/a b.webp')],
    ['GET', await new Evidence().getEvidenceUrl('order/a b.pdf')]];
  for (const [method, link] of links) {
    const url = new URL(link);
    assert.equal(url.origin, 'https://media.example.com');
    assert.match(url.searchParams.get('X-Amz-Credential'), /\/us-east-1\/s3\/aws4_request$/);
    assert.equal(url.searchParams.get('X-Amz-SignedHeaders'), 'host');
    assert.match(url.searchParams.get('X-Amz-Signature'), /^[a-f0-9]{64}$/);
    assert.ok(url.pathname.includes('a%20b.'));
    // Independently verify SigV4 against the delivered hostname, not just URL syntax.
    const signature = url.searchParams.get('X-Amz-Signature');
    const credentialScope = url.searchParams.get('X-Amz-Credential').split('/').slice(1);
    const date = url.searchParams.get('X-Amz-Date');
    url.searchParams.delete('X-Amz-Signature');
    const encode = value => encodeURIComponent(value).replace(/[!'()*]/g, char => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
    const query = [...url.searchParams].map(([key, value]) => `${encode(key)}=${encode(value)}`).sort().join('&');
    const canonical = [method, url.pathname, query, `host:${url.host}\n`, 'host', 'UNSIGNED-PAYLOAD'].join('\n');
    const stringToSign = ['AWS4-HMAC-SHA256', date, credentialScope.join('/'), createHash('sha256').update(canonical).digest('hex')].join('\n');
    let key = Buffer.from(`AWS4${process.env.MINIO_PASSWORD}`);
    for (const part of credentialScope) key = createHmac('sha256', key).update(part).digest();
    assert.equal(createHmac('sha256', key).update(stringToSign).digest('hex'), signature);
  }
  const { readPublicStorageUrl } = require('../ServerService/Service_Storage/dist/utils/public-storage-url.js');
  for (const value of [undefined, 'http://media.example.com', 'https://user:pass@media.example.com', 'https://media.example.com/path']) {
    assert.throws(() => readPublicStorageUrl(value, 'http://minio:9000'));
  }
});
