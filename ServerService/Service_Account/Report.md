# Service_Account API Guide

คู่มือนี้อ้างอิงจาก route/controller ปัจจุบันของ `Service_Account` และผลทดสอบ API ล่าสุด

## Base URL

ค่าปัจจุบันจาก `.env` ของ service นี้คือ:

```text
http://localhost:3000
```

service อ่าน port จาก `PORT` ใน `.env` ถ้าไม่ได้กำหนดจะ fallback เป็น `3000`

## Authentication

ทุก endpoint ต้องส่ง access token ผ่าน header:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

สำหรับ endpoint ที่รับรูปภาพบิลของ transaction ให้ส่งเป็น `multipart/form-data` พร้อม field `file`

token ต้อง decode ได้ด้วย `SECRET` และ payload ต้องมี:

```json
{
  "username": "admin",
  "role": 0,
  "type": "accessToken"
}
```

ทุก route ใน service นี้ตรวจสิทธิ์ admin เท่านั้น (`role = 0`) หาก role อื่นเรียกใช้จะได้ `PermissionDeniedError`

## Response Format

สำเร็จ:

```json
{
  "status": "success",
  "result": {}
}
```

บาง endpoint ที่ไม่มีข้อมูลส่งกลับจะตอบ:

```json
{
  "status": "success"
}
```

ผิดพลาด:

```json
{
  "status": "error",
  "errCode": 2
}
```

หมายเหตุ: implementation ปัจจุบันใช้ `res.send(...)` โดยไม่ได้ set HTTP status แยก ดังนั้น error response ส่วนใหญ่ยังได้ HTTP 200

## Error Codes ที่ใช้บ่อย

| Code | Name | ความหมาย |
| --- | --- | --- |
| 0 | `UnknownError` | ไม่สามารถระบุสาเหตุได้ |
| 1 | `InUseError` | ข้อมูลถูกใช้งานอยู่ หรือข้อมูลซ้ำ |
| 2 | `UnauthorizedError` | ไม่ได้ส่ง token หรือ token type ไม่ใช่ accessToken |
| 4 | `TokenExpiredError` | token verify ไม่ผ่านหรือหมดอายุ |
| 5 | `PermissionDeniedError` | ผู้ใช้ไม่ใช่ admin |
| 7 | `NotFoundError` | ไม่พบข้อมูลที่ต้องการ |
| 10 | `TimeoutError` | update wallet ไม่สำเร็จ |

## Transaction Types

| Value | Name | ผลต่อ wallet |
| --- | --- | --- |
| 0 | `income` | เพิ่มเงิน |
| 1 | `expenses` | ลดเงิน |
| 2 | `loan` | เพิ่มเงิน |
| 3 | `lend` | ลดเงิน |

เมื่อสร้าง/แก้ไข/ลบ transaction ระบบจะปรับ wallet หลักชื่อ `main` ตาม type และ money

## Contact APIs

### Search Contacts

```http
GET /contact?id=CUST001
```

query `id` เป็น optional ถ้าส่งมาจะค้นหา `codeName` แบบ regex ไม่สนตัวพิมพ์เล็กใหญ่

response:

```json
{
  "status": "success",
  "result": [
    {
      "codeName": "CUST001",
      "billName": "Customer One",
      "description": "VIP customer",
      "address": "Bangkok",
      "taxID": "1234567890123",
      "tel": "0800000000"
    }
  ]
}
```

### Create Contact

```http
POST /contact
```

body:

```json
{
  "codeName": "CUST001",
  "billName": "Customer One",
  "address": "Bangkok",
  "tel": "0800000000",
  "taxID": "1234567890123",
  "description": "VIP customer"
}
```

ถ้า `codeName` ซ้ำจะได้ `InUseError`

### Update Contact

```http
PUT /contact
```

body ใช้ `codeName` เป็น key สำหรับหา record และ field อื่นเป็นค่าที่ต้องการแก้ไข

```json
{
  "codeName": "CUST001",
  "billName": "Customer One Updated",
  "address": "Bangkok",
  "tel": "0800000000",
  "taxID": "1234567890123",
  "description": "updated"
}
```

### Delete Contact

```http
DELETE /contact?id=CUST001
```

ข้อจำกัด:

- ถ้ามี transaction ที่ `who` เท่ากับ contact id จะลบไม่ได้และได้ `InUseError`
- ถ้าไม่มี transaction ที่อ้างถึง จะลบ contact และตอบ `status: "success"`

## Transaction APIs

### Search Transactions

```http
GET /transaction?from=2026-05-24T00:00:00.000Z&to=2026-05-24T23:59:59.999Z&who=CUST001&topic=ขายสินค้า&type=0
```

query:

| Query | Type | Required | Description |
| --- | --- | --- | --- |
| `from` | ISO date string | no | วันที่เริ่มต้น ถ้าไม่ส่งจะใช้เวลาปัจจุบัน |
| `to` | ISO date string | no | วันที่สิ้นสุด ถ้าไม่ส่งจะใช้เวลาปัจจุบัน |
| `who` | string | no | filter ด้วย contact codeName |
| `topic` | string | no | filter ด้วย topic แบบตรงตัว |
| `type` | number | no | filter ด้วย transaction type |

response จะ group เป็นเดือนและวัน:

```json
{
  "status": "success",
  "result": [
    {
      "date": "2026-05-01T00:00:00.000Z",
      "detail": [
        {
          "date": "2026-05-24T10:35:20.666Z",
          "transactions": [
            {
              "id": "6a12d468132f6cb9119beca9",
              "topic": "ขายสินค้า",
              "type": 0,
              "money": 1250,
              "who": "CUST001",
              "description": "income",
              "readonly": false,
              "bill": ""
            }
          ]
        }
      ]
    }
  ]
}
```

### Get Transaction Detail

```http
GET /trandetail?id=<transactionObjectId>
```

ถ้าไม่พบ transaction จะได้ `NotFoundError`

response:

```json
{
  "status": "success",
  "result": {
    "date": "2026-05-24T10:35:20.666Z",
    "money": 1250,
    "topic": "ขายสินค้า",
    "type": 0,
    "description": "income",
    "who": "CUST001",
    "readonly": false,
    "bill": ""
  }
}
```

### Create Transaction

```http
POST /transaction
```

รองรับทั้ง `application/json` และ `multipart/form-data` หากต้องแนบรูปบิลให้ส่ง field `file`

body:

```json
{
  "date": "2026-05-24T10:35:20.666Z",
  "topic": "ขายสินค้า",
  "type": 0,
  "money": 1250,
  "who": "CUST001",
  "description": "income",
  "bill": "",
  "readonly": false
}
```

พฤติกรรม:

- ถ้ามี `file` จะ upload เข้า MinIO bucket `bill` และเก็บ URL ใน field `bill`
- หลังบันทึก transaction จะปรับ wallet หลักตาม `type` และ `money`
- ถ้า update wallet ไม่สำเร็จจะได้ `TimeoutError`

### Update Transaction

```http
PUT /transaction?id=<transactionObjectId>
```

รองรับทั้ง `application/json` และ `multipart/form-data`

body ส่ง field ที่ต้องการแก้ไขในรูปแบบเดียวกับ create transaction

พฤติกรรมเกี่ยวกับรูปบิล:

- ถ้าส่ง `file` ใหม่ ระบบจะลบรูปเก่าและ upload รูปใหม่
- ถ้าส่ง `bill` เป็น string ว่าง ระบบจะลบรูปเก่าและล้างค่า `bill`
- ระบบ revert ผลกระทบ wallet ของ transaction เดิมก่อน แล้วคำนวณ transaction ใหม่
- ถ้าไม่พบ transaction จะได้ `NotFoundError`

### Delete Transaction

```http
DELETE /transaction?id=<transactionObjectId>
```

พฤติกรรม:

- ลบ transaction ตาม id
- ถ้าลบสำเร็จ ระบบจะ revert ผลกระทบ wallet ของ transaction นั้น
- ลบรูปบิลจาก MinIO ถ้ามี

## Wallet APIs

### Get Main Wallet

```http
GET /wallet
```

response:

```json
{
  "status": "success",
  "result": 1250
}
```

เมื่อ service start จะเรียก `ensureMainWallet()` เพื่อสร้าง wallet หลักชื่อ `main` ถ้ายังไม่มี

## Environment

`.env` ที่เกี่ยวข้อง:

```env
WEB_HOST="http://localhost:3030"
PORT=3000
SECRET="NuttaScholar"
DB_URL="mongodb://root:example@localhost:27017/Account?authSource=admin"
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_USER=admin
MINIO_PASSWORD=StrongPass123!
```

## Run And Test

ติดตั้ง dependency:

```bash
npm install
```

รัน service:

```bash
npm run dev
```

build:

```bash
npm run build
```

unit test:

```bash
npm test
```

ผลทดสอบล่าสุด:

```text
Test date: 2026-05-24
npm run build: pass
npx karma start karma.conf.js --single-run --browsers ChromeHeadless: no specs found, 0 executed
API smoke test: pass, 15 checks
Seed data: temporary Contact + Transaction in Account database, removed after test
Running service: Docker container service_account on http://localhost:3000
```

ผลทดสอบ API ล่าสุด:

```text
GET /contact without token: pass, errCode 2
GET /contact with non-admin token: pass, errCode 5
POST /contact create: pass
POST /contact duplicate: pass, errCode 1
GET /contact?id search: pass
GET /wallet: pass
POST /transaction create income: pass
GET /transaction filter by who/type: pass
Extract transaction id from GET /transaction: pass
GET /trandetail?id: pass
PUT /transaction update: pass
DELETE /contact while transaction exists: pass, errCode 1
DELETE /transaction cleanup: pass
PUT /contact update: pass
DELETE /contact cleanup: pass
Cleanup seeded Contact/Transaction: pass
```
