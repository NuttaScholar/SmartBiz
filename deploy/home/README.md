# Home LAN deployment (HTTP)

Run commands from the repository root. Requires Node.js dependencies and Docker Compose.

```powershell
npm ci
npm run setup:home-env -- 192.168.1.50
npm run build:home
docker compose --env-file .env.home -f docker-compose.home.yml up -d --build --wait
```

Replace the example IP with the Docker host's LAN IPv4 address. The setup command generates independent random credentials and refuses to overwrite `.env.home`. Reserve the IP in your router. Allow the configured ports through the host firewall for your LAN. HTTP traffic is unencrypted; this deployment is for a trusted home network.

Default URLs:

| Application | URL |
| --- | --- |
| Admin and API | http://192.168.1.50:8080 |
| Storefront | http://192.168.1.50:8082 |
| Media | http://192.168.1.50:9000 |

Edit `HOME_HOST` and `HOME_*_PORT` in `.env.home` to change addresses. Re-run `npm run build:home` and the Compose command after changes. Vite reads `VITE_WEB_SHOP` and `VITE_API_GATEWAY_URL` from `.env.home`; no frontend source edits are needed. These variables are public browser configuration, never credentials. Build output is isolated in `dist-home`; the production `dist` directory is unaffected. As with Vite normally, shell environment variables and `.env.home.local` can override env-file values.

Nginx configuration lives entirely in `deploy/home/`. It listens internally on fixed ports 8080 (Admin/API), 8082 (Storefront), and 9000 (Media); Compose maps the configurable host ports. Media preserves the incoming Host including its port for S3 signatures. Relative redirects preserve custom host ports.

All backend images can be built locally from `ServerService` using `--build`. Their `nuttascholar/smartbiz_*` tags match the main Compose file. `pull_policy: never` uses local backend images without downloading older registry copies; omit `--build` when the updated images already exist locally. `NODE_ENV` stays `production`; this Compose file explicitly opts into `ALLOW_HTTP_PUBLIC_URL=true` and `COOKIE_SECURE=false` for the relevant services. Other deployments keep their existing HTTPS defaults.

The `smartbiz-home` project has its own database/storage volumes and automatically allocated Docker network. It does not reuse VPS data. Existing accounts and files are not migrated. MongoDB and backend ports remain private. MinIO Console is bound to localhost:19001. Optional Mongo Express is bound to localhost:18081:

```powershell
docker compose --env-file .env.home -f docker-compose.home.yml --profile admin up -d mongo-express
```

Check after startup: open both web pages, sign in and refresh the session, load products/images, and upload/download an attachment or payment evidence. Signed URLs must contain the configured LAN IP and media port. Do not change generated database passwords after initialization without updating database users too.

Stop without deleting data:

```powershell
docker compose --env-file .env.home -f docker-compose.home.yml down
```
