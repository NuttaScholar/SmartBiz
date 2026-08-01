# Service_Account API Guide

This guide reflects the current route/controller/service structure of `Service_Account`.

## Base URL

```text
http://localhost:3000
```

The service reads `PORT` from `.env`; if not set, it falls back to `3000`.

## Authentication

All `/contact`, `/transaction`, `/trandetail`, and `/wallet` endpoints require:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Token payload must be signed by `SECRET` and contain:

```json
{
  "username": "admin",
  "role": 0,
  "type": "accessToken"
}
```

## Response Format

Success:

```json
{
  "success": true,
  "data": {}
}
```

Success without payload:

```json
{
  "success": true
}
```

Error:

```json
{
  "success": false,
  "errCode": 7,
  "message": "Not found"
}
```

## Common Error Codes

| Code | Name |
| --- | --- |
| 2 | `UnauthorizedError` |
| 4 | `TokenExpiredError` |
| 5 | `PermissionDeniedError` |
| 6 | `InvalidInputError` |
| 7 | `NotFoundError` |
| 8 | `AlreadyExistsError` |
| 9 | `InvalidStateError` |
| 0 | `UnknownError` |

## Contact APIs

### Create Contact

```http
POST /contact
```

Admin and cashier only.

```json
{
  "codeName": "CUST001",
  "billName": "Customer One",
  "address": "Bangkok",
  "tel": "0800000000",
  "taxID": "1234567890123",
  "description": "optional"
}
```

### Search Contacts

```http
GET /contact?id=CUST&index=0&size=20
```

When pagination is requested, `data` contains:

```json
{
  "contacts": [],
  "index": 0,
  "size": 20,
  "total": 100,
  "hasMore": true
}
```

Without pagination, `data` is a contact array.

### Update Contact

```http
PUT /contact
```

Admin and cashier only. Uses `codeName` to find the contact.

### Delete Contact

```http
DELETE /contact?id=CUST001
```

Admin only. If the contact is used by transactions, service returns `InUseError`.

## Transaction APIs

### Create Transaction

```http
POST /transaction
```

Admin only. Supports `multipart/form-data` with optional `file`.

```json
{
  "date": "2026-05-30T00:00:00.000Z",
  "topic": "Sale",
  "type": 0,
  "money": 1200,
  "who": "CUST001",
  "description": "optional",
  "bill": "optional",
  "readonly": false
}
```

### Get Transaction Detail

```http
GET /trandetail?id=<transactionId>
```

### Search Transactions

```http
GET /transaction?from=2026-05-01&to=2026-05-30&who=CUST001&topic=Sale&type=0
```

All query values are optional.

### Update Transaction

```http
PUT /transaction?id=<transactionId>
```

Admin only. Readonly transactions cannot be edited.

### Delete Transaction

```http
DELETE /transaction?id=<transactionId>
```

Admin only. Readonly transactions cannot be deleted.

## Wallet APIs

### Get Main Wallet

```http
GET /wallet
```

Response:

```json
{
  "success": true,
  "data": 15000
}
```

## Environment

```env
PORT=3000
SECRET=NuttaScholar
SERVICE_AUTH_SECRET=<random-secret-at-least-32-characters>
WEB_HOSTS=http://localhost:3030,http://localhost:4030
DB_URL=mongodb://root:example@localhost:27017/Account?authSource=admin
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_USER=admin
MINIO_PASSWORD=StrongPass123!
```

## Run And Test

```bash
npm install
npm run dev
npm run build
npm test
```

Latest verification:

```text
npm run build: pass
Response format scan: pass, no status/result response shape remains in src
```
