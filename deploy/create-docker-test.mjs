// Prepare a separate local Docker stack; does not start containers or trust certificates.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createEnvironment } from './create-env.mjs';

const require = createRequire(import.meta.url);
const yaml = require('js-yaml');
const directory = '.production-audit-dist/docker-test';
mkdirSync(directory, { recursive: true });
const envFile = '.env.vps.test';
if (!existsSync(envFile)) {
  const env = Object.fromEntries(createEnvironment('example.com', 'local@example.com').trim().split('\n').map(line => line.split('=')));
  Object.assign(env, {
    COMPOSE_PROJECT_NAME: 'smartbiz-docker-test',
    STOREFRONT_DOMAIN: 'localhost', ADMIN_DOMAIN: 'app.localhost', MEDIA_DOMAIN: 'media.localhost',
    VITE_WEB_BACKEND: 'https://app.localhost:8443',
    VITE_WEB_SHOP: 'https://localhost:8443', VITE_API_GATEWAY_URL: 'https://app.localhost:8443',
  });
  writeFileSync(envFile, Object.entries(env).map(([key, value]) => `${key}=${value}`).join('\n') + '\n', { flag: 'wx', mode: 0o600 });
}

const compose = yaml.load(readFileSync('docker-compose.yml', 'utf8'));
for (const [name, service] of Object.entries(compose.services)) {
  delete service.container_name;
  if (service.networks?.private?.ipv4_address) {
    service.networks.private.ipv4_address = service.networks.private.ipv4_address.replace('192.168.110.', '192.168.111.');
  }
  if (name.startsWith('service_')) {
    service.environment.WEB_HOSTS = ['service_account', 'service_storefront'].includes(name)
      ? 'https://app.localhost:8443,https://localhost:8443' : 'https://app.localhost:8443';
    if ('MINIO_PUBLIC_URL' in service.environment) service.environment.MINIO_PUBLIC_URL = 'https://media.localhost:8443';
  }
}
compose.networks.private.ipam.config = [{ subnet: '192.168.111.0/24' }];
compose.services.minio.ports = ['127.0.0.1:19001:9001'];
compose.services['mongo-express'].ports = ['127.0.0.1:18081:8081'];
compose.services.edge.ports = ['127.0.0.1:8088:8088', '127.0.0.1:8443:8443'];
compose.services.edge.volumes[0] = `./${directory}/Caddyfile:/etc/caddy/Caddyfile:ro`;
compose.services.web.volumes = [
  './templates:/etc/nginx/templates:ro',
  './.production-audit-dist/site:/usr/share/nginx/html:ro',
  `./${directory}/nginx.conf:/etc/nginx/nginx.conf:ro`,
];
writeFileSync(`${directory}/Caddyfile`, '{\n\tadmin off\n\thttp_port 8088\n\thttps_port 8443\n}\n\nlocalhost, app.localhost, media.localhost {\n\ttls internal\n\treverse_proxy web:80\n}\n');
writeFileSync(`${directory}/nginx.conf`, readFileSync('nginx.conf', 'utf8').replaceAll('192.168.110.83', '192.168.111.83'));
writeFileSync(`${directory}/compose.yml`, yaml.dump(compose, { lineWidth: -1, noRefs: true }));
console.log('Prepared local stack smartbiz-docker-test on localhost ports 8088/8443. Existing .env.vps.test credentials were preserved. Use --project-directory . with the generated Compose file.');
