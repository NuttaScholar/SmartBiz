# Service_StoreFront API Guide

คู่มือนี้อ้างอิงจาก route/controller/service ปัจจุบันของ
`Service_StoreFront` และ contract ของหน้า `src/page/Storefront`

## Base URL

ค่าเริ่มต้นของ service:

```text
http://localhost:3005
```

Customer API สำหรับหน้า Storefront อยู่ใต้:

```text
/storefront/:customerToken
```

ส่วน API จัดการ Customer Link สำหรับ Admin อยู่ใต้:

```text
/storefront/admin/customer-links
```

`customerToken` มาจาก URL ของหน้าเว็บ เช่น:

```text
http://localhost:4030/storefront/customer-secret
```

## Authentication

API แบ่งการยืนยันสิทธิ์เป็นสองประเภท

### Customer APIs

ทุก endpoint ตรวจ customer token จาก path โดย service จะ:

1. trim token และคำนวณ SHA-256
2. ค้นหา `StorefrontAccess.tokenHash`
3. ตรวจ `isActive = true`

token ไม่มีวันหมดอายุ และจะใช้ไม่ได้เมื่อ Admin rotate token หรือกำหนด
`isActive = false`

กรณี token ไม่ถูกต้องหรือถูกปิด:

```http
HTTP/1.1 401 Unauthorized
```

```json
{
  "success": false,
  "message": "Customer link is invalid",
  "status": 401
}
```

### Admin Customer Link APIs

API ใต้ `/storefront/admin/customer-links` ใช้ JWT access token ตาม
`Service_Bill/src/middlewares/auth.ts`:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

payload ต้องมี:

```json
{
  "username": "admin",
  "role": 0,
  "type": "accessToken"
}
```

`role = 0` คือ Admin หากเป็น role อื่นจะตอบ `403 PermissionDeniedError`

ตัวอย่างเมื่อไม่ได้ส่ง JWT:

```json
{
  "success": false,
  "errCode": 2,
  "message": "Authorization header missing"
}
```

ตัวอย่างเมื่อผู้ใช้ไม่ใช่ Admin:

```json
{
  "success": false,
  "errCode": 5,
  "message": "You do not have permission to access this resource"
}
```

## Response Format

สำเร็จ:

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

ผิดพลาด:

```json
{
  "success": false,
  "message": "Order not found",
  "status": 404
}
```

HTTP status ที่ใช้:

| Status | ความหมาย |
| --- | --- |
| `400` | input หรือไฟล์ไม่ถูกต้อง |
| `401` | JWT หรือ customer token ไม่ถูกต้อง |
| `403` | ผู้ใช้ไม่ใช่ Admin |
| `404` | ไม่พบสินค้าหรือ order ของลูกค้ารายนั้น |
| `409` | stock ไม่พอ หรือสถานะ order ไม่รองรับ action |
| `413` | หลักฐานมีขนาดเกิน 2 MB |
| `500` | server error |

## Database Design

service เชื่อมต่อ MongoDB สามฐาน:

```text
Account
└── contacts (อ่านอย่างเดียว)

Stock
└── products (อ่านอย่างเดียว)

StoreFront
├── storefrontaccesses
└── storefrontorders
```

### Stock.products

ใช้ `ProductSchema` ร่วมกับโครงสร้างสินค้าเดิม:

| Field | Type | รายละเอียด |
| --- | --- | --- |
| `id` | string | รหัสสินค้า, unique |
| `name` | string | ชื่อสินค้า |
| `type` | number | หน้า Storefront เลือกเฉพาะ `merchandise = 0` |
| `status` | number | `normal = 0`, `stockLow = 1`, `stockOut = 2` |
| `amount` | number | จำนวนคงเหลือ |
| `description` | string | รายละเอียด |
| `img` | string | URL รูปภาพ |
| `price` | number | ราคาปกติ |
| `condition` | number | จุดแจ้ง stock ต่ำ |

### StoreFront.storefrontaccesses

เก็บ Customer Link และส่วนลดเฉพาะลูกค้า:

```json
{
  "customerID": "CUST-001",
  "customerName": "Customer One",
  "token": "64-character-random-token",
  "tokenHash": "<sha256-hex>",
  "isActive": true,
  "productDiscounts": [
    {
      "productID": "P-001",
      "discountPercent": 10
    }
  ]
}
```

indexes:

- unique index ที่ `customerID` เพื่อให้ลูกค้าหนึ่งรายมีหนึ่งลิงก์
- unique index ที่ `token`
- unique index ที่ `tokenHash`

`token` และ `tokenHash` ถูกกำหนด `select: false` จึงไม่ติดมากับ query
ทั่วไป การตรวจลิงก์ใช้ `tokenHash` ส่วน raw token ถูกส่งให้ Admin ใน response
ตอนสร้างหรือ rotate เท่านั้น

ไม่มี field `expiresAt` เนื่องจาก Customer Link ไม่มีวันหมดอายุ

### StoreFront.storefrontorders

เก็บ order ของลูกค้า:

```json
{
  "orderID": "SO-260725-3A7F910C",
  "customerID": "CUST-001",
  "status": 0,
  "totalAmount": 180,
  "items": [
    {
      "productID": "P-001",
      "name": "Product One",
      "quantity": 2,
      "priceOriginal": 100,
      "discountPercent": 10,
      "priceAfterDiscount": 90,
      "img": "https://example.com/product.jpg"
    }
  ],
  "confirmationEvidence": {
    "fileName": "proof.png",
    "mimeType": "image/png",
    "dataUrl": "data:image/png;base64,...",
    "updatedAt": "2026-07-25T03:00:00.000Z"
  },
  "createdAt": "2026-07-25T03:00:00.000Z",
  "updatedAt": "2026-07-25T03:00:00.000Z"
}
```

รายการสินค้าภายใน order เป็น snapshot ของชื่อ รูป ราคา และส่วนลด ณ เวลาสั่ง
เพื่อให้ประวัติ order ไม่เปลี่ยนเมื่อแก้สินค้าในฐาน Stock ภายหลัง

indexes:

- unique index ที่ `orderID`
- compound index `{ customerID: 1, createdAt: -1 }`

## Order Status

| Value | Name | ความหมาย |
| --- | --- | --- |
| `0` | `Submitted` | ส่งคำสั่งซื้อแล้ว |
| `1` | `PaymentNotified` | แนบหลักฐาน/แจ้งชำระแล้ว |
| `2` | `PaymentConfirmed` | ยืนยันการชำระแล้ว |
| `3` | `PrepareProduct` | เตรียมสินค้า |
| `4` | `PrepareShipment` | เตรียมจัดส่ง |
| `5` | `Completed` | จัดส่งสำเร็จ |
| `6` | `Cancelled` | ยกเลิก |

customer ทำได้สอง transition:

```text
Submitted --upload evidence--> PaymentNotified
Submitted --cancel-----------> Cancelled
```

สถานะหลังจากนั้นเป็น workflow ฝั่งผู้ดูแลระบบ

## APIs

### Create Customer Link (Admin)

```http
POST /storefront/admin/customer-links
Authorization: Bearer <adminAccessToken>
Content-Type: application/json
```

body:

```json
{
  "customerID": "CUST-001"
}
```

ขั้นตอน:

1. ตรวจ JWT และบังคับ role เป็น Admin
2. ค้นหา `Account.contact.codeName == customerID`
3. ใช้ `billName` เป็นชื่อลูกค้า
4. สร้าง token แบบ cryptographically secure ขนาด 256 บิต
5. บันทึก `customerID`, `customerName`, `token`, `tokenHash` และ
   `isActive = true` ใน StoreFront
6. token ไม่มีวันหมดอายุ

token ที่ได้เป็น hexadecimal string ความยาว 64 ตัวอักษร เหมาะสำหรับใช้เป็น
path parameter โดยไม่ต้อง encode เพิ่ม

response `201 Created`:

```json
{
  "success": true,
  "message": "Customer link created",
  "data": {
    "customerID": "CUST-001",
    "customerName": "Customer One",
    "token": "0123456789abcdef...",
    "path": "/storefront/0123456789abcdef..."
  }
}
```

ถ้าไม่มี Contact จะตอบ `404` และถ้าลูกค้ามี link อยู่แล้วจะตอบ `409`
พร้อมแนะนำให้ใช้ rotate endpoint

### Rotate Customer Token (Admin)

```http
PATCH /storefront/admin/customer-links/:customerID/token
Authorization: Bearer <adminAccessToken>
```

ตัวอย่าง:

```http
PATCH /storefront/admin/customer-links/CUST-001/token
```

ระบบตรวจ Contact อีกครั้ง จากนั้นสร้าง token ใหม่และแทนที่ `token` กับ
`tokenHash` ใน document เดิมแบบ atomic ข้อมูลส่วนลดและ order ไม่ถูกลบ
token เก่าจะใช้เข้า Storefront ไม่ได้ทันที

response มีรูปแบบเดียวกับ Create Customer Link และ raw token ใหม่จะถูกส่ง
ใน response ครั้งนี้

### Validate Customer Session

```http
GET /storefront/:customerToken/session
```

response:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "customerID": "CUST-001",
    "customerName": "Customer One",
    "token": "customer-secret"
  }
}
```

ใช้แทน mock ใน `useStorefrontSession`

### List Products

```http
GET /storefront/:customerToken/products
GET /storefront/:customerToken/products?q=coffee
```

`q` เป็น optional และค้นจากรหัสหรือชื่อสินค้าแบบไม่สนตัวพิมพ์เล็กใหญ่

response:

```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": "P-001",
      "name": "Product One",
      "img": "https://example.com/product.jpg",
      "description": "Description",
      "price": 100,
      "amount": 5,
      "percentDiscount": 10,
      "priceAfterDiscount": 90,
      "status": 0
    }
  ]
}
```

service อ่านราคาและ stock จากฐาน `Stock` แล้วนำส่วนลดของ customer มาคำนวณ
`priceAfterDiscount` โดยปัดทศนิยมสองตำแหน่ง

### Create Order

```http
POST /storefront/:customerToken/orders
Content-Type: application/json
```

body:

```json
{
  "items": [
    {
      "productID": "P-001",
      "quantity": 2
    }
  ]
}
```

validation:

- `items` ต้องไม่ว่าง
- `productID` ห้ามซ้ำใน request เดียวกัน
- `quantity` ต้องเป็นจำนวนเต็มมากกว่า 0
- สินค้าต้องเป็น merchandise และมีราคา
- quantity ต้องไม่เกิน stock ปัจจุบัน
- frontend ไม่ต้องและไม่ควรส่งราคา/ส่วนลด/ยอดรวม
- service คำนวณ snapshot และ `totalAmount` จากฐานข้อมูลเท่านั้น

สำเร็จตอบ `201 Created` พร้อม `StorefrontOrder`

### List Customer Orders

```http
GET /storefront/:customerToken/orders
```

คืน order ของ customer เจ้าของ token เรียงจากใหม่ไปเก่า

### Get Order Detail

```http
GET /storefront/:customerToken/orders/:orderID
```

service บังคับทั้ง `customerID` และ `orderID` เพื่อป้องกัน token ของลูกค้ารายหนึ่ง
อ่าน order ของลูกค้าอีกราย

### Upload Or Replace Evidence

```http
PATCH /storefront/:customerToken/orders/:orderID/evidence
Content-Type: application/json
```

body:

```json
{
  "fileName": "proof.png",
  "mimeType": "image/png",
  "dataUrl": "data:image/png;base64,iVBORw0KGgo..."
}
```

รองรับ:

- `image/jpeg`
- `image/png`
- `image/gif`
- `image/webp`
- `application/pdf`

ข้อจำกัด:

- decoded file size ต้องไม่เกิน 2 MB
- MIME ใน `dataUrl` ต้องตรงกับ `mimeType`
- แก้ไขได้เฉพาะสถานะ `Submitted` หรือ `PaymentNotified`
- upload สำเร็จจะเปลี่ยนสถานะเป็น `PaymentNotified`
- Express JSON limit ตั้งไว้ที่ 3 MB เพื่อรองรับ base64 overhead

### Cancel Order

```http
DELETE /storefront/:customerToken/orders/:orderID
```

endpoint นี้เป็น soft cancel ไม่ลบ document และทำได้เฉพาะสถานะ `Submitted`
จากนั้นจะคืน order ที่มี `status = 6`

## Environment

```env
WEB_HOST=http://localhost:4030
PORT=3005
SECRET=NuttaScholar
MONGO_URI_ACCOUNT=mongodb://root:example@localhost:27017/Account?authSource=admin
MONGO_URI_STOCK=mongodb://root:example@localhost:27017/Stock?authSource=admin
MONGO_URI_STOREFRONT=mongodb://root:example@localhost:27017/StoreFront?authSource=admin
```

ตัวแปร `SERVICE_ACCOUNT_URL`, `SERVICE_BILL_URL` และ `SERVICE_STOCK_URL`
ยังคงรองรับไว้ใน config สำหรับ integration ภายในในอนาคต แต่ API ชุดนี้อ่าน
Account, Stock และ StoreFront ผ่าน MongoDB โดยตรง

## Run And Test

```bash
npm install
npm run dev
npm run typecheck
npm run build
npm test
```

ผลตรวจล่าสุด (2026-07-25):

```text
npm run typecheck: pass
npm run build: pass
npm test: pass, 12 specs
```
