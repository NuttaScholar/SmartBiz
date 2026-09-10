# Deploy SmartBiz on a VPS

The root `docker-compose.yml` now targets a VPS with public HTTPS domains. It replaces the previous direct HTTP gateway. Caddy owns ports 80/443, issues and renews certificates, and preserves the Host header when forwarding to the private Nginx gateway. Nginx trusts forwarded client IP/protocol only from the fixed Caddy address. Deploy directly behind public DNS; a CDN/load balancer in front needs a separate trusted-proxy configuration.

## Fresh installation

1. Point DNS A records for `example.com`, `app.example.com`, and `media.example.com` to the VPS. Only publish AAAA records if IPv6 works. Allow inbound TCP 80/443 (UDP 443 is optional HTTP/3); preserve your SSH access. No other public application ports are needed. Ensure the Docker subnet `192.168.110.0/24` does not overlap the VPS/VPN network.
2. Copy the deployment package to the VPS. It only needs `docker-compose.yml`, `.env.vps`, `nginx.conf`, `templates/`, `deploy/Caddyfile`, the three `deploy/mongo-*.js` scripts, `dist/`, and `smartbiz-images.tar`. The `ServerService` source folder and Node.js are not required on the VPS. Install Docker Engine with Compose v2 and ensure no other program binds 80/443.
3. Generate credentials on the VPS (or securely transfer the generated file):

   ```sh
   node deploy/create-env.mjs example.com admin@example.com
   chmod 600 .env.vps
   ```

   The generator refuses to overwrite `.env.vps`. It creates independent random secrets and URI-safe per-service database passwords. Set `COMPOSE_PROJECT_NAME` to the existing project name when reusing volumes. Do not commit/share the file or render expanded Compose config into logs; use `config --quiet`.
4. Configure frontend `.env.production` with only these public values, replacing the example domain:

   ```dotenv
   VITE_WEB_SHOP=https://example.com
   VITE_API_GATEWAY_URL=https://app.example.com
   ```

   Load the supplied backend images and start the stack from the deployment directory:

   ```sh
   docker load -i smartbiz-images.tar
   docker compose --env-file .env.vps config --quiet
   docker compose --env-file .env.vps up -d --wait --wait-timeout 300
   ```

   Compose uses the six prebuilt `nuttascholar/smartbiz_*` images and has `pull_policy: never`, so it neither needs source code nor pulls a different backend image from Docker Hub. The gateway mounts the supplied `dist`; it does not compile the frontend. Initial certificate issuance needs correct DNS and public reachability and may complete after containers become healthy.
5. Verify all three HTTPS domains and the full login/order/upload/download flow. Check `docker compose --env-file .env.vps ps -a` and logs if startup fails. `/gateway/health` checks Nginx only; backend `/readyz` endpoints check database connection state, and Storage checks its MinIO connection. These do not replace a real transaction smoke test. An unhealthy container is marked unhealthy; Compose does not automatically restart a still-running unhealthy process. Startup failures exit and are restarted by the restart policy.

## Storage

All SDK traffic uses `minio:9000` inside Docker. Browser-facing URLs use `https://media.example.com`. Presigned URLs are signed using the public hostname and the fixed `us-east-1` region, without a network request through Caddy. Do not rewrite the hostname/path of an already signed URL. The MinIO API has no host port mapping. MinIO Console is loopback-only; use an SSH tunnel if needed.

Existing absolute URLs containing a former IP address are not rewritten in MongoDB by this deployment. Back up and migrate these records separately after verifying which fields hold storage URLs. Relative bucket/object paths continue to use the configured public origin. Test private evidence URLs, image reads and presigned PUTs from the browser before launch.

## Existing MongoDB volumes — maintenance migration

Changing `MONGO_ROOT_PASSWORD` in an env file does **not** change a password inside an existing database. Do not delete volumes to work around authentication errors.

1. Back up MongoDB and MinIO and verify a restore on a separate volume. Retain the existing Compose project name, MongoDB major version/FCV, replica-set name, keyfile and volumes. The supplied init scripts require MongoDB 8/mongosh; do not select MongoDB 4.4.
2. Stop application containers during maintenance. Generate `.env.vps`, then replace `MONGO_ROOT_USER` and `MONGO_ROOT_PASSWORD` in that file with the **current** database administrator credentials. New per-service passwords remain the generated values.
3. Run `docker compose --env-file .env.vps up -d mongo`, then `docker compose --env-file .env.vps run --rm mongo-users-init`. This waits for the replica-set setup and creates/updates the application users. The operation is idempotent but applying changed application passwords invalidates the old credentials; keep applications stopped until updated.
4. Rotate the old/default administrator password interactively in authenticated `mongosh` (`db.changeUserPassword` with `passwordPrompt()`), then update `MONGO_ROOT_PASSWORD` in `.env.vps` to the same value. Avoid putting a password in shell history. Recreate MongoDB so its authenticated health check uses the new password. Do not rotate by editing the env file alone.
5. Start the stack with the fresh-install command (without `--build`) and verify transactions and storage. Keep the previous release and backups for rollback. If application passwords were rotated, rollback images must also use the new per-service credentials.

Application users authenticate against `admin` but receive only database-scoped `readWrite` roles: Account → Account; Login → User; Stock → Stock; Bill → Account/Bill/Stock; Storefront → Account/Bill/Stock/StoreFront. Cross-database services currently construct models and indexes in those databases, so these are database-level roles, not collection-level minimum privileges. No application receives MongoDB root credentials. MinIO still uses shared storage credentials across services; credential-level storage isolation is separate work.

## Operations and limits

- Keep `.env.vps`, database backups and the `caddy-data` certificate volume private. Compose environment variables remain visible to operators with Docker access; this is not an external secrets vault.
- Existing tracked `.env` files remain available for the local workflow. Generated `.env.vps` and `.env.vps.test` files are ignored by Git. Rotate any credentials that were committed or shared, including JWT and service-auth secrets (existing tokens will stop working).
- Mongo Express is disabled by default. Start it only with `docker compose --env-file .env.vps --profile admin up -d mongo-express` and connect through an SSH tunnel to localhost:8081.
- Back up `mongo-data`, `minio-data`, and certificate data using appropriate database-consistent tooling. Never run `down -v` on the live project.
- Restart policies apply to long-running services; one-shot initialization jobs intentionally use `restart: no`. Database-backed processes retry on startup through container restart, and Mongoose reconnects after transient outages. Monitor health and disk usage.
- This deployment work does not resolve the separate audit findings for default application accounts, disabled-user/token revocation logic or vulnerable dependencies. Resolve those before a public production launch.

References: [Caddy automatic HTTPS](https://caddyserver.com/docs/automatic-https), [Compose startup order](https://docs.docker.com/compose/how-tos/startup-order/), [MinIO JS API](https://github.com/minio/minio-js/blob/master/docs/API.md).
