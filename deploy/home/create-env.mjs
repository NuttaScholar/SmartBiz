import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const host = process.argv[2];
if (!host || !/^(?:\d{1,3}\.){3}\d{1,3}$/.test(host) || host.split('.').some(part => Number(part) > 255)) {
  throw new Error('Usage: npm run setup:home-env -- <server LAN IPv4 address>');
}
const template = readFileSync(new URL('./home.env.example', import.meta.url), 'utf8');
const output = template.replace('HOME_HOST=192.168.1.50', `HOME_HOST=${host}`)
  .replace(/GENERATE_SECRET/g, () => randomBytes(32).toString('hex'));
writeFileSync('.env.home', output, { flag: 'wx', mode: 0o600 });
console.log('Created .env.home with independent credentials. Existing files are never overwritten.');
