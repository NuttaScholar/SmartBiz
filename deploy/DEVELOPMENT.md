# Frontend development

The development stack is fully defined by `docker-compose.dev.yml`; it does not
merge with or extend the production `docker-compose.yml`. Docker creates the
separate `smartbiz-dev` network and volumes, so development data is isolated.
It uses independent credentials from the ignored `.env.dev` file.

Create the environment file once:

```sh
npm run setup:dev-env
```

Start the backend services and API gateway:

```sh
npm run dev:services
```

Then run either frontend in another terminal:

```sh
npm run dev
npm run dev:storefront
```

The Admin frontend is at `http://localhost:3030`, Storefront is at
`http://localhost:4030`, and both send `/api/*` through the Vite proxy to the
development gateway at `http://127.0.0.1:8080`. MinIO API and console are bound
to loopback at ports 19000 and 19001, keeping them separate from production.

Stop the development stack without deleting its data:

```sh
npm run dev:services:down
```

To also delete development database and object-storage data, explicitly run:

```sh
docker compose -p smartbiz-dev --env-file .env.dev -f docker-compose.dev.yml down -v
```

Do not add `-f docker-compose.yml`; that would merge the production definition
into this standalone stack. Backend source hot reload is outside this workflow;
the stack runs the versioned backend images declared in the development file.
