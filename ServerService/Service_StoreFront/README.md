# Service_StoreFront

Backend service for the SmartBiz customer StoreFront. The project follows the
layered structure used by `Service_Bill`.

## Getting started

1. Copy `.env.example` to `.env` and adjust the database/service URLs.
2. Install dependencies with `npm install`.
3. Start development mode with `npm run dev`.

The service listens on port `3005` by default. Use `GET /health` to verify the
service and its database connections.

## Commands

- `npm run dev` - run TypeScript with automatic restart
- `npm run build` - compile into `dist`
- `npm start` - run the compiled service
- `npm run typecheck` - check TypeScript without emitting files
- `npm test` - run Jasmine tests in ChromeHeadless

## Source layout

- `controllers` - HTTP request/response handling
- `database` - database connections
- `middlewares` - Express middleware
- `models` - Mongoose schemas and TypeScript document types
- `repositories` - data access
- `routes` - route declarations
- `services` - business logic

## Logging

- Responses include `X-Request-ID`; a valid incoming request ID is preserved.
- Expected `400` and `404` responses are not logged as server errors.
- Authentication/authorization failures (`401`, `403`) and conflicts (`409`)
  are logged as structured warnings without stack traces.
- Unexpected failures and `5xx` responses are logged as structured errors with
  stack traces.
- Logs include method, path, status, request ID, and authenticated principal,
  but never include access tokens or customer tokens.
- `utils` - shared helpers
