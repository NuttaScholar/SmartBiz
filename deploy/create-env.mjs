import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function createEnvironment(domain, email) {
  if (!/^(?=.{1,220}$)(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(domain || '') ||
      /(?:^|\.)(localhost|local|test|invalid)$/i.test(domain)) {
    throw new Error('Supply a public domain name without a scheme, port or path');
  }
  if (!/^[a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email || '')) {
    throw new Error('Supply the email address for certificate renewal notices');
  }
  domain = domain.toLowerCase();
  const values = {
    COMPOSE_PROJECT_NAME: 'smartbiz',
    STOREFRONT_DOMAIN: domain,
    ADMIN_DOMAIN: `app.${domain}`,
    MEDIA_DOMAIN: `media.${domain}`,
    ACME_EMAIL: email,
    VITE_WEB_BACKEND: `https://app.${domain}`,
    VITE_WEB_SHOP: `https://${domain}`,
    VITE_API_GATEWAY_URL: `https://app.${domain}`,
    MONGO_VERSION: '4.4.29',
    MONGO_DEPLOY_DIR: 'mongodb-4.4',
    MONGO_SHELL: 'mongo',
    MONGO_ROOT_USER: 'smartbiz_root',
    MINIO_USER: 'smartbiz_storage',
    MONGO_EXPRESS_USERNAME: 'smartbiz_admin',
    MONGO_EXPRESS_PORT: '8081',
    MINIO_CONSOLE_PORT: '9001',
    ORDER_TTL_SECONDS: '2592000',
    LOG_AUDIT_RETENTION_DAYS: '365',
  };
  for (const key of ['SECRET', 'SERVICE_AUTH_SECRET', 'MONGO_ROOT_PASSWORD',
    'MONGO_ACCOUNT_PASSWORD', 'MONGO_LOGIN_PASSWORD', 'MONGO_STOCK_PASSWORD',
    'MONGO_BILL_PASSWORD', 'MONGO_STOREFRONT_PASSWORD', 'MINIO_PASSWORD', 'MONGO_EXPRESS_PASSWORD']) {
    values[key] = randomBytes(32).toString('hex');
  }
  return Object.entries(values).map(([key, value]) => `${key}=${value}`).join('\n') + '\n';
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const content = createEnvironment(process.argv[2], process.argv[3]);
  // Never overwrite live credentials or print them. On Unix only the owner can read.
  writeFileSync(resolve('.env.vps'), content, { flag: 'wx', mode: 0o600 });
  console.log('Created .env.vps. Keep this file private and backed up. Existing database volumes need the migration steps in deploy/README.md.');
}
