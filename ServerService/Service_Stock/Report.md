# Service_Stock API Guide

คู่มือนี้อ้างอิงจาก route/controller/service ปัจจุบันของ `Service_Stock`

## Base URL

ค่าปัจจุบันจาก `.env` ของโปรเจกต์นี้คือ:

```text
http://localhost:3003
```

service อ่าน port จาก `PORT` ใน `.env` ถ้าไม่ได้กำหนดไว้จะ fallback เป็น `3000`

## Authentication

ทุก endpoint ต้องส่ง access token ผ่าน header:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

token ต้อง decode ได้ด้วย `SECRET` และ payload ต้องมี:

```json
{
  "username": "admin",
  "role": 0,
  "type": "accessToken"
}
```

endpoint ของ stock ตรวจสิทธิ์ `role === 0` หรือ `admin`

## Response Format

สำเร็จ:

```json
{
  "status": "success",
  "result": {}
}
```

บาง action ที่ไม่มี payload จะตอบ:

```json
{
  "status": "success"
}
```

ผิดพลาด:

```json
{
  "status": "error",
  "errCode": 6
}
```

บางกรณี เช่น stock in/out ทำงานสำเร็จบางรายการ จะตอบ:

```json
{
  "status": "warning",
  "result": [
    {
      "productID": "PROD001",
      "amount": 2,
      "price": 120
    }
  ]
}
```

## Error Codes ที่ใช้บ่อย

| Code | Name | ความหมาย |
| --- | --- | --- |
| 2 | `UnauthorizedError` | ไม่ได้ส่ง token หรือ token ไม่ถูกต้อง |
| 4 | `TokenExpiredError` | token หมดอายุหรือ verify ไม่ผ่าน |
| 5 | `PermissionDeniedError` | role ไม่มีสิทธิ์ใช้งาน endpoint |
| 6 | `InvalidInputError` | input ไม่ถูกต้อง |
| 7 | `NotFoundError` | ไม่พบข้อมูล |
| 8 | `AlreadyExistsError` | มีข้อมูลซ้ำ เช่น product id หรือ name |
| 0 | `UnknownError` | error อื่น ๆ |

## Product Type

| Value | Name | ความหมาย |
| --- | --- | --- |
| 0 | `merchandise` | สินค้า |
| 1 | `material` | วัตถุดิบ |
| 2 | `another` | อื่น ๆ |

## Stock Status

| Value | Name | ความหมาย |
| --- | --- | --- |
| 0 | `normal` | สต็อกปกติ |
| 1 | `stockLow` | สต็อกต่ำกว่า condition |
| 2 | `stockOut` | สต็อกหมด |

## Stock Log Type

| Value | Name | ความหมาย |
| --- | --- | --- |
| 0 | `in` | เติมสต็อก |
| 1 | `out` | ตัดสต็อก |

## Product APIs

### Create Product

```http
POST /product
```

รองรับ `multipart/form-data` เมื่อส่งรูปด้วย field `file` และรองรับ body ปกติเมื่อไม่มีรูป

body:

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

notes:

| Field | Type | Required |
| --- | --- | --- |
| `id` | string | yes |
| `type` | number | yes |
| `name` | string | yes |
| `condition` | number | yes |
| `amount` | number | no |
| `price` | number | no |
| `description` | string | no |
| `file` | image file | no |

ข้อจำกัด:

- ถ้า `id` ซ้ำ จะได้ `AlreadyExistsError`
- ถ้า `name` ซ้ำ จะได้ `AlreadyExistsError`
- ถ้าส่งรูป ระบบจะแปลงเป็น webp, resize ไม่เกิน 720x720 และอัปโหลดไป bucket `product`

### Update Product

```http
PUT /product
```

body:

```json
{
  "id": "PROD001",
  "type": 0,
  "name": "Product name updated",
  "condition": 5,
  "amount": 100,
  "price": 150,
  "description": "updated"
}
```

ข้อจำกัด:

- ถ้าไม่พบ product จะได้ `NotFoundError`
- ถ้าแก้ชื่อไปชน product อื่น จะได้ `AlreadyExistsError`
- ถ้าส่ง `file` ใหม่ ระบบจะลบรูปเดิมใน Minio แล้วอัปโหลดรูปใหม่
- ถ้าส่ง `img` เป็น string ว่าง ระบบจะลบรูปเดิมและบันทึก `img: ""`

### Get Products

```http
GET /product?type=0&name=keyword&status=0
```

query ทั้งสามตัวเป็น optional:

| Query | Type | Required | Description |
| --- | --- | --- | --- |
| `type` | number | no | filter ตาม Product Type |
| `name` | string | no | ค้นหาชื่อแบบ regex ไม่สนตัวพิมพ์เล็กใหญ่ |
| `status` | number | no | filter ตาม Stock Status |

response:

```json
{
  "status": "success",
  "result": {
    "status": {
      "stockTotal": 3,
      "stockLow": 0,
      "stockOut": 0,
      "materialTotal": 1,
      "materialLow": 0,
      "materialOut": 0
    },
    "products": [
      {
        "id": "PROD001",
        "type": 0,
        "name": "Product name",
        "condition": 10,
        "status": 0,
        "price": 120,
        "description": "",
        "amount": 100
      }
    ]
  }
}
```

### Delete Product

```http
DELETE /product?id=PROD001
```

ถ้า product มีรูป ระบบจะลบ object ใน bucket `product` ก่อนลบ product

## Stock APIs

### Get Stock List

```http
GET /stock
```

ค่า default จะดึงเฉพาะ product ที่เป็น `merchandise` หรือ `material`

สามารถเลือก `productType` ที่ต้องการได้:

```http
GET /stock?productType=0
GET /stock?productType=0,1
GET /stock?productType=0&productType=1
```

| Query | Type | Required | Description |
| --- | --- | --- | --- |
| `productType` | number, comma-separated numbers, or repeated query | no | filter ตาม Product Type; ถ้าไม่ส่งจะใช้ `0,1` |

ถ้าส่งค่าไม่อยู่ใน Product Type จะได้ `InvalidInputError`

response:

```json
{
  "status": "success",
  "result": [
    {
      "id": "PROD001",
      "type": 0,
      "name": "Product name",
      "condition": 10,
      "status": 0,
      "price": 120,
      "amount": 100
    }
  ]
}
```

### Get Stock Status

```http
GET /status
```

response:

```json
{
  "status": "success",
  "result": {
    "stockTotal": 3,
    "stockLow": 0,
    "stockOut": 0,
    "materialTotal": 1,
    "materialLow": 0,
    "materialOut": 0
  }
}
```

### Stock In

```http
POST /stock_in
```

ต้องส่งเป็น `multipart/form-data`:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `file` | image file | yes | รูปบิล/หลักฐาน |
| `products` | JSON string | yes | array ของรายการเติมสต็อก |
| `who` | string | no | ผู้เกี่ยวข้องกับ transaction |

ตัวอย่าง `products`:

```json
[
  {
    "productID": "PROD001",
    "amount": 10,
    "price": 1200
  }
]
```

พฤติกรรม:

- อัปโหลดรูปเข้า bucket `bill`
- สร้าง transaction ที่ `SERVICE_ACCOUNT_URL/transaction`
- เพิ่มจำนวนสินค้า
- สร้าง log type `0`
- ถ้าบางรายการหา product ไม่เจอ จะตอบ `warning` พร้อมรายการที่ทำไม่สำเร็จ

### Stock Out

```http
POST /stock_out
```

body:

```json
{
  "note": "ใช้ในการผลิต",
  "products": [
    {
      "productID": "PROD001",
      "amount": 2,
      "price": 120
    }
  ]
}
```

พฤติกรรม:

- ลดจำนวนสินค้า
- สร้าง log type `1`
- ถ้าสินค้าไม่พอหรือหา product ไม่เจอ จะตอบ `warning` พร้อมรายการที่ทำไม่สำเร็จ

### Get Log

```http
GET /log?id=PROD001&type=1&index=0&size=50
```

| Query | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | yes | product id |
| `type` | number | no | log type, default `0` |
| `index` | number | no | skip index, default `0` |
| `size` | number | no | page size, default `50` |

response:

```json
{
  "status": "success",
  "result": {
    "total": 1,
    "index": 0,
    "size": 1,
    "logs": [
      {
        "productID": "PROD001",
        "amount": 2,
        "type": 1,
        "date": "2026-05-22T13:15:35.311Z",
        "price": 120,
        "note": "ใช้ในการผลิต"
      }
    ]
  }
}
```

## Environment

`.env` ที่เกี่ยวข้อง:

```env
PORT=3003
SECRET=NuttaScholar
WEB_HOST=http://localhost:3030
DB_URL=mongodb://root:example@localhost:27017/Stock?authSource=admin
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_USER=admin
MINIO_PASSWORD=StrongPass123!
SERVICE_ACCOUNT_URL=http://localhost:3000
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

ผลล่าสุด:

```text
npm run build: pass
npm run dev: pass
API smoke test: pass
```

ผลทดสอบ `npm run dev` ล่าสุด:

```text
[DB] Stock connected
Stock Service running on port 3003
```

ตรวจสอบ route โดยเรียกแบบไม่ส่ง token:

```http
GET http://localhost:3003/product
```

response ที่ได้ถูกต้องตาม `AuthMiddleware`:

```json
{
  "status": "error",
  "errCode": 2
}
```

ผลทดสอบ API ล่าสุด:

```text
GET /product without token: pass, UnauthorizedError
POST /product create temp product: pass
GET /product search temp product: pass
PUT /product update temp product: pass
GET /stock: pass
GET /status: pass
POST /stock_out temp product: pass
GET /log stock out history: pass
POST /stock_in without file validation: pass, InvalidInputError
DELETE /product cleanup temp product: pass
```

หมายเหตุ: การทดสอบ `POST /stock_in` รอบนี้ตรวจเฉพาะ validation path แบบไม่ส่งไฟล์ จึงไม่สร้าง transaction จริงไปที่ `SERVICE_ACCOUNT_URL`
