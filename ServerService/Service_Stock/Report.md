# Service_Stock API Guide

This guide reflects the current route/controller/service structure of `Service_Stock`.

## Base URL

```text
http://localhost:3003
```

The service reads `PORT` from `.env`; if not set, it falls back to `3000`.

## Authentication

All endpoints require:

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

Product and stock writes require admin. Product/stock reads allow admin and cashier.

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

Completed with warnings:

```json
{
  "success": true,
  "message": "Completed with warnings",
  "data": [
    {
      "productID": "PROD001",
      "amount": 2,
      "price": 120
    }
  ]
}
```

Error:

```json
{
  "success": false,
  "errCode": 6,
  "message": "Invalid input"
}
```

## Common Error Codes

| Code | Name |
| --- | --- |
| 1 | `InUseError` |
| 2 | `UnauthorizedError` |
| 4 | `TokenExpiredError` |
| 5 | `PermissionDeniedError` |
| 6 | `InvalidInputError` |
| 7 | `NotFoundError` |
| 8 | `AlreadyExistsError` |
| 0 | `UnknownError` |

## Product Type

| Value | Name |
| --- | --- |
| 0 | `merchandise` |
| 1 | `material` |
| 2 | `another` |

All product types track `amount`, `condition`, and stock status. When the
service starts, legacy `another` records without inventory fields are
initialized with zero quantity and an out-of-stock status.

## Stock Status

| Value | Name |
| --- | --- |
| 0 | `normal` |
| 1 | `stockLow` |
| 2 | `stockOut` |

## Product APIs

### Create Product

```http
POST /product
```

Supports `multipart/form-data` with optional image field `file`.

```json
{
  "id": "PROD001",
  "type": 0,
  "name": "Product name",
  "condition": 10,
  "amount": 100,
  "price": 120,
  "description": "optional"
}
```

If `file` is sent, the service converts it to webp, resizes it to fit 720x720, and uploads it to the `product` bucket.

### Update Product

```http
PUT /product
```

Uses `id` to find the product. Sending `img: ""` removes the existing product image.

### Get Products

```http
GET /product?type=0&name=keyword&status=0
```

Response:

```json
{
  "success": true,
  "data": {
    "status": {
      "stockTotal": 3,
      "stockLow": 0,
      "stockOut": 0,
      "materialTotal": 1,
      "materialLow": 0,
      "materialOut": 0,
      "anotherTotal": 1,
      "anotherLow": 0,
      "anotherOut": 1
    },
    "products": []
  }
}
```

### Delete Product

```http
DELETE /product?id=PROD001
```

Before deletion, the service checks `Service_Bill` to ensure the product is not used by orders. If used, it returns `InUseError`.

## Stock APIs

### Get Stock List

```http
GET /stock?productType=0,1
```

`productType` is optional. It accepts a single number, comma-separated numbers, or repeated query values. When omitted, the response includes `merchandise`, `material`, and `another`.

### Get Stock Status

```http
GET /status
```

The status response tracks total, low-stock, and out-of-stock counts for all
three product types, including `another`.

### Stock In

```http
POST /stock_in
```

Requires `multipart/form-data`.

| Field | Type | Required |
| --- | --- | --- |
| `file` | image file | yes |
| `products` | JSON string | yes |
| `who` | string | no |

Example `products`:

```json
[
  {
    "productID": "PROD001",
    "amount": 10,
    "price": 1200
  }
]
```

Behavior:

- uploads the bill image to the `bill` bucket
- creates an expense transaction in `Service_Account`
- increases product amounts
- writes stock logs
- returns `success: true` with warning `data` when some product rows fail

### Stock Out

```http
POST /stock_out
```

```json
{
  "note": "Used in production",
  "products": [
    {
      "productID": "PROD001",
      "amount": 2,
      "price": 120
    }
  ]
}
```

### Adjust Stock From Service Bill

```http
POST /stock/adjust
Authorization: Bearer <service-token>
Content-Type: application/json
```

This endpoint is restricted to a `service_bill` token with the
`stock.inventory.adjust` scope. It changes up to 500 products atomically and
writes audit logs in the same MongoDB transaction. Service-originated changes
do not create entries in the normal `logs` collection.
If any product does not exist or the resulting amount is negative, none of the
changes are committed.

`delta` is applied directly to the current amount: a positive value increases
stock and a negative value decreases stock. Repeated product IDs in one request
are combined before applying the changes.

```json
{
  "reference": "ORDER-20260821-001",
  "note": "Order items changed",
  "items": [
    {
      "productID": "PROD001",
      "delta": -2
    },
    {
      "productID": "PROD002",
      "delta": 1
    }
  ]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "reference": "ORDER-20260821-001",
    "items": [
      {
        "productID": "PROD001",
        "beforeAmount": 10,
        "afterAmount": 8
      },
      {
        "productID": "PROD002",
        "beforeAmount": 4,
        "afterAmount": 5
      }
    ]
  }
}
```

The authenticated actor is recorded as `{ "type": "service", "name":
"service_bill" }`. `reference` and the adjustment details are stored only in
the audit snapshot so they can be correlated with the originating order.

### Get Log

```http
GET /log?id=PROD001&type=1&index=0&size=50
```

`id` is required. `type`, `index`, and `size` are optional.

## Audit APIs

Product create/update/delete and successful stock-in/stock-out rows write an
audit document to the `Stock.log_audit` collection. The product change, normal
stock log, and audit log are committed together in one MongoDB transaction.
Each audit entry contains the authenticated actor, operation, affected
collections, changed fields, product snapshots before and after the change,
and the related stock-log data when applicable.

Audit entries expire through the TTL index on `expiresAt`. Retention defaults
to 365 days and can be configured with `LOG_AUDIT_RETENTION_DAYS`.

Only users with the admin role may read audit entries; service tokens and
other roles receive `403 Forbidden`.

Get one audit entry:

```http
GET /log-audit/<auditId>
```

Query audit entries (newest first):

```http
GET /log-audit?productID=PROD001&operation=STOCK_IN&action=UPDATE&actorName=admin&actorType=user&from=2026-08-01T00:00:00.000Z&to=2026-08-31T23:59:59.999Z&page=1&size=20
```

`productID` and `actorName` use case-insensitive partial matching. For example,
`productID=prod` matches `PROD001`, and `actorName=bill` matches
`service_bill`. Regular-expression metacharacters are treated as literal text.

Supported operations are `PRODUCT_CREATE`, `PRODUCT_UPDATE`,
`PRODUCT_DELETE`, `STOCK_IN`, and `STOCK_OUT`. Amount filters are also
available: `minBeforeAmount`, `maxBeforeAmount`, `minAfterAmount`, and
`maxAfterAmount`. The maximum page size is 100.

## Environment

```env
PORT=3003
SECRET=NuttaScholar
SERVICE_AUTH_SECRET=<random-secret-at-least-32-characters>
WEB_HOSTS=http://localhost:3030,http://localhost:4030
DB_URL=mongodb://root:example@localhost:27017/Stock?authSource=admin&replicaSet=rs0
LOG_AUDIT_RETENTION_DAYS=365
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_USER=admin
MINIO_PASSWORD=StrongPass123!
SERVICE_ACCOUNT_URL=http://localhost:3000
SERVICE_BILL_URL=http://localhost:3004
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
