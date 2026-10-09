import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { loadEnv } from 'vite';

// Run after building the four services: verify production protection and LAN opt-in.
const require = createRequire(import.meta.url);
process.env.NODE_ENV = 'production';
for (const service of ['Storage', 'Stock', 'Bill', 'StoreFront']) {
  const { readPublicStorageUrl } = require(`../../ServerService/Service_${service}/dist/utils/public-storage-url.js`);
  delete process.env.ALLOW_HTTP_PUBLIC_URL;
  assert.throws(() => readPublicStorageUrl('http://192.168.1.50:9000', ''), /HTTPS/);
  assert.equal(readPublicStorageUrl('https://media.example.com', ''), 'https://media.example.com');
  process.env.ALLOW_HTTP_PUBLIC_URL = 'true';
  assert.equal(readPublicStorageUrl('http://192.168.1.50:9000', ''), 'http://192.168.1.50:9000');
  assert.throws(() => readPublicStorageUrl('http://192.168.1.50:9000/bucket', ''), /without a path/);
  assert.throws(() => readPublicStorageUrl(undefined, 'http://minio:9000'), /required/);
}

const directory = mkdtempSync(join(tmpdir(), 'smartbiz-home-check-'));
try {
  const script = resolve('deploy/home/create-env.mjs');
  execFileSync(process.execPath, [script, '192.168.1.60'], { cwd: directory });
  const env = loadEnv('home', directory, '');
  assert.equal(env.VITE_WEB_SHOP, 'http://192.168.1.60:8082');
  assert.equal(env.VITE_API_GATEWAY_URL, 'http://192.168.1.60:8080');
  assert.equal(env.SECRET.length, 64);
  assert.notEqual(env.SECRET, env.SERVICE_AUTH_SECRET);
  const before = readFileSync(join(directory, '.env.home'), 'utf8');
  assert.throws(() => execFileSync(process.execPath, [script, '192.168.1.61'], { cwd: directory, stdio: 'pipe' }));
  assert.equal(readFileSync(join(directory, '.env.home'), 'utf8'), before);
} finally {
  rmSync(directory, { recursive: true, force: true });
}
console.log('Passed: HTTPS defaults, LAN opt-in, URL validation, env expansion, credential generation and overwrite protection.');
