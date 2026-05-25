# Service_Account API Guide

เอกสารนี้อัปเดตล่าสุดวันที่ 2026-05-25 หลัง refactor `Service_Account` ให้แยกโครงสร้างตามแนวทางเดียวกับ `Service_Bill`

## Structure

โครงสร้างหลักของ service:

```text
src/
  controllers/
  database/
  middlewares/
  models/
  repositories/
  routes/
  services/
  utils/
  config.ts
  index.ts
  type.ts
```

หน้าที่หลัก:

- `index.ts`: ประกอบ Express app, connect database, mount routes
- `routes/`: กำหนด endpoint
- `controllers/`: รับ `req/res`, ตรวจสิทธิ์ตาม role, ส่ง response
- `services/`: business logic เช่น wallet update, transaction image, contact in-use check
- `repositories/`: query MongoDB
- `models/`: Mongoose schema/interface

## Base URL

ค่า default จาก `.env`:

```text
http://localhost:3000
```

## Authentication

ทุก endpoint ต้องส่ง access token:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

endpoint ที่แนบรูปบิลของ transaction ใช้ `multipart/form-data` พร้อม field `file`

token ต้อง decode ด้วย `SECRET` และ payload ต้องเป็น:

```json
{
  "username": "admin",
  "role": 0,
  "type": "accessToken"
}
```

role ใน token:

| Value | Name |
| --- | --- |
| 0 | `admin` |
| 1 | `cashier` |
| 2 | `laber` |

สิทธิ์การใช้งาน:

| Area | Method | Role |
| --- | --- | --- |
| Contact | `GET`, `POST`, `PUT` | `admin`, `cashier` |
| Contact | `DELETE` | `admin` |
| Transaction | all | `admin` |
| Wallet | all | `admin` |

ถ้า role ไม่มีสิทธิ์จะได้ `PermissionDeniedError`

## Response Format

สำเร็จ:

```json
{
  "status": "success",
  "result": {}
}
```

สำเร็จแบบไม่มี payload:

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

หมายเหตุ: service ยังส่ง error ผ่าน `res.send(...)` เป็นหลัก ดังนั้นบาง error อาจยังได้ HTTP 200 พร้อม `status: "error"`

## Error Codes

| Code | Name | ความหมาย |
| --- | --- | --- |
| 0 | `UnknownError` | ไม่สามารถระบุสาเหตุได้ |
| 1 | `InUseError` | ข้อมูลถูกใช้งานอยู่หรือข้อมูลซ้ำ |
| 2 | `UnauthorizedError` | ไม่ได้ส่ง token หรือ token type ไม่ใช่ accessToken |
| 4 | `TokenExpiredError` | token verify ไม่ผ่านหรือหมดอายุ |
| 5 | `PermissionDeniedError` | ผู้ใช้ไม่มีสิทธิ์สำหรับ endpoint นั้น |
| 7 | `NotFoundError` | ไม่พบข้อมูล |
| 10 | `TimeoutError` | update wallet ไม่สำเร็จ |

## Transaction Types

| Value | Name | ผลต่อ wallet |
| --- | --- | --- |
| 0 | `income` | เพิ่มเงิน |
| 1 | `expenses` | ลดเงิน |
| 2 | `loan` | เพิ่มเงิน |
| 3 | `lend` | ลดเงิน |

เมื่อสร้าง/แก้ไข/ลบ transaction ระบบจะปรับ wallet หลักชื่อ `main` ตาม `type` และ `money`

## Contact APIs

Contact APIs อนุญาตให้ `admin` และ `cashier` ค้นหา เพิ่ม และแก้ไขรายชื่อได้ ส่วนการลบรายชื่อยังจำกัดเฉพาะ `admin`

### Search Contacts

```http
GET /contact?id=CUST001&index=0&size=30
```

query:

| Query | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | no | ค้นหา `codeName` แบบ regex ไม่สนตัวพิมพ์เล็กใหญ่ |
| `index` | number | no | page index เริ่มจาก 0 |
| `size` | number | no | จำนวนรายการต่อหน้า |

ถ้าไม่ส่ง `index/size` จะคืนรายการทั้งหมดเหมือน behavior เดิม

response แบบ pagination:

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
  ],
  "index": 0,
  "size": 30,
  "total": 1,
  "hasMore": false
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

ถ้า `codeName` ซ้ำ จะได้ `InUseError`

### Update Contact

```http
PUT /contact
```

ใช้ `codeName` เป็น key:

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

ถ้าไม่พบ contact จะได้ `NotFoundError`

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
GET /transaction?from=2026-05-25T00:00:00.000Z&to=2026-05-25T23:59:59.999Z&who=CUST001&topic=ยอดขาย&type=0
```

query:

| Query | Type | Required | Description |
| --- | --- | --- | --- |
| `from` | ISO date string | no | วันที่เริ่มต้น ถ้าไม่ส่งจะใช้เวลาปัจจุบัน |
| `to` | ISO date string | no | วันที่สิ้นสุด ถ้าไม่ส่งจะใช้เวลาปัจจุบัน |
| `who` | string | no | filter ด้วย contact `codeName` |
| `topic` | string | no | filter ด้วย topic แบบตรงตัว |
| `type` | number | no | filter ด้วย transaction type |

response group ตามเดือนและวัน:

```json
{
  "status": "success",
  "result": [
    {
      "date": "2026-05-01T00:00:00.000Z",
      "detail": [
        {
          "date": "2026-05-25T10:35:20.666Z",
          "transactions": [
            {
              "id": "6a12d468132f6cb9119beca9",
              "topic": "ยอดขาย",
              "type": 0,
              "money": 1250,
              "who": "CUST001",
              "description": "OrderID: ORD001",
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

### Create Transaction

```http
POST /transaction
```

รองรับทั้ง `application/json` และ `multipart/form-data`

body:

```json
{
  "date": "2026-05-25T10:35:20.666Z",
  "topic": "ยอดขาย",
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
- ถ้า update wallet ไม่สำเร็จ จะได้ `TimeoutError`

### Update Transaction

```http
PUT /transaction?id=<transactionObjectId>
```

รองรับทั้ง `application/json` และ `multipart/form-data`

พฤติกรรม:

- ถ้าส่ง `file` ใหม่ จะลบรูปเก่าและ upload รูปใหม่
- ถ้าส่ง `bill` เป็น string ว่าง จะลบรูปเก่าและล้างค่า `bill`
- ระบบ revert ผลกระทบ wallet ของ transaction เดิมก่อน แล้วคำนวณ transaction ใหม่
- ถ้าไม่พบ transaction จะได้ `NotFoundError`

### Delete Transaction

```http
DELETE /transaction?id=<transactionObjectId>
```

พฤติกรรม:

- ลบ transaction ตาม id
- ถ้าลบสำเร็จ จะ revert wallet จาก transaction นั้น
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

ตอน service start จะเรียก `ensureMainWallet()` เพื่อสร้าง wallet หลักชื่อ `main` ถ้ายังไม่มี

## Environment

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

run dev:

```bash
npm run dev
```

build:

```bash
npm run build
```

ผลตรวจล่าสุด:

```text
Test date: 2026-05-25
Service_Account npm run build: pass
Frontend npm run build: pass
```
