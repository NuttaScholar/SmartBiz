# Service_Login API Guide

This guide reflects the current route/controller/service structure of `Service_Login`.

## Base URL

```text
http://localhost:3001
```

The service reads `PORT` from `.env`; if not set, it falls back to `3000`.

## Authentication

Protected user management endpoints require:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Token payload must be signed by `SECRET` and contain:

```json
{
  "username": "admin@default.com",
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
  "errCode": 6,
  "message": "Invalid input"
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
| 0 | `UnknownError` |

## User APIs

### Login

```http
POST /login
```

```json
{
  "email": "admin@default.com",
  "pass": "Default"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "role": 0,
    "token": "<accessToken>"
  }
}
```

The refresh token is set as an HTTP-only `refreshToken` cookie.

### Refresh Access Token

```http
GET /token
```

Requires `refreshToken` cookie.

### Logout

```http
POST /logout
```

Clears the `refreshToken` cookie.

### Create User

```http
POST /user
```

Admin only.

```json
{
  "email": "user@example.com",
  "name": "User Name",
  "role": 1,
  "tel": "0800000000",
  "img": "https://example.com/avatar.webp"
}
```

New users receive the default password `Default`.

### List Users

```http
GET /user?name=User
```

Admin only. `name` is optional and performs a case-insensitive search.

### Update User

```http
PUT /user
```

Admin only.

```json
{
  "id": "<userId>",
  "name": "Updated Name",
  "role": 1,
  "enable": true
}
```

### Delete User

```http
DELETE /user?id=<userId>
```

Admin only.

### Change Password

```http
PUT /pass
```

Any authenticated user can change their own password.

```json
{
  "oldPass": "Default",
  "newPass": "NewPassword123"
}
```

## Default User

When the `Profile` collection is empty, the service creates:

```json
{
  "email": "admin@default.com",
  "name": "NuttaScholar",
  "role": 0,
  "enable": true
}
```

## Environment

```env
PORT=3001
SECRET=NuttaScholar
WEB_HOSTS=http://localhost:3030,http://localhost:4030
DB_URL=mongodb://root:example@localhost:27017/User?authSource=admin
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
