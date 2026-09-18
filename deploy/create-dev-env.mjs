import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const secret = () => randomBytes(32).toString('hex');
const values = {
  MONGO_VERSION: '8.0.5',
  MONGO_DEPLOY_DIR: 'mongodb-8.0',
  MONGO_SHELL: 'mongosh',
  MONGO_ROOT_USER: 'smartbiz_dev_root',
  MONGO_ROOT_PASSWORD: secret(),
  MONGO_ACCOUNT_PASSWORD: secret(),
  MONGO_LOGIN_PASSWORD: secret(),
  MONGO_STOCK_PASSWORD: secret(),
  MONGO_BILL_PASSWORD: secret(),
  MONGO_STOREFRONT_PASSWORD: secret(),
  SECRET: secret(),
  SERVICE_AUTH_SECRET: secret(),
  MINIO_USER: 'smartbiz_dev_storage',
  MINIO_PASSWORD: secret(),
  ORDER_TTL_SECONDS: '2592000',
  LOG_AUDIT_RETENTION_DAYS: '30',
};

const output = Object.entries(values).map(([key, value]) => `${key}=${value}`).join('\n') + '\n';
writeFileSync(resolve('.env.dev'), output, { flag: 'wx', mode: 0o600 });
console.log('Created .env.dev with independent development credentials.');
