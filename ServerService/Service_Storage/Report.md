# Service_Storage API Guide

This guide reflects the current route/controller/service structure of `Service_Storage`.

## Base URL

```text
http://localhost:3002
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

All storage endpoints require admin.

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
| 0 | `UnknownError` |

## Bucket APIs

### Create Bucket

```http
POST /bucket
```

```json
{
  "Bucket": "images",
  "Private": false
}
```

### Update Bucket Policy

```http
PUT /bucket
```

```json
{
  "Bucket": "images",
  "Private": true
}
```

### Delete Bucket

```http
DELETE /bucket
```

```json
{
  "Bucket": "images"
}
```

The service removes objects in the bucket before deleting it.

## Presigned URL APIs

### Presigned Put

```http
GET /presignedPut?Bucket=images&Key=test.webp
```

Response:

```json
{
  "success": true,
  "data": {
    "url": "http://..."
  }
}
```

### Presigned Get

```http
GET /presignedGet?Bucket=images&Key=test.webp
```

The URL expires after 60 seconds.

## Image APIs

### Upload Image

```http
POST /image
```

Requires `multipart/form-data`.

| Field | Type | Required |
| --- | --- | --- |
| `file` | image file | yes |
| `Bucket` | string | yes |
| `Key` | string | yes |
| `width` | number | no |
| `height` | number | no |

The service converts images to webp and resizes them to fit the provided size or the default 720x720.

### Delete Image

```http
DELETE /image?Bucket=images&Key=test.webp
```

## Startup Buckets

On startup the service ensures these public buckets exist:

```text
images
product
```

## Environment

```env
PORT=3002
SECRET=NuttaScholar
SERVICE_AUTH_SECRET=<random-secret-at-least-32-characters>
WEB_HOSTS=http://localhost:3030,http://localhost:4030
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
