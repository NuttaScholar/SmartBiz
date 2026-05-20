# Service_Bill API Guide

คู่มือนี้อ้างอิงจาก route/controller/service ปัจจุบันของ `Service_Bill`

## Base URL

ค่าปัจจุบันจาก `.env` ของโปรเจกต์นี้คือ:

```text
http://localhost:3004
```

service อ่าน port จาก `PORT` ใน `.env` ถ้าไม่ได้กำหนดไว้จะ fallback เป็น `3000`

## Authentication

ทุก endpoint ใต้ `/bill` และ `/discount` ต้องส่ง access token ผ่าน header:

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

## Response Format

สำเร็จ:

```json
{
  "success": true,
  "data": {}
}
```

ผิดพลาด:

```json
{
  "success": false,
  "errCode": 7,
  "message": "Order not found"
}
```

## Error Codes ที่ใช้บ่อย

| Code | Name | ความหมาย |
| --- | --- | --- |
| 2 | `UnauthorizedError` | ไม่ได้ส่ง token หรือ token ไม่ถูกต้อง |
| 4 | `TokenExpiredError` | token หมดอายุหรือ verify ไม่ผ่าน |
| 6 | `InvalidInputError` | input ไม่ถูกต้อง |
| 7 | `NotFoundError` | ไม่พบข้อมูล |
| 9 | `InvalidStateError` | สถานะไม่พร้อมสำหรับ action |
| 0 | `UnknownError` | error อื่น ๆ |

## Customer Reference

`customerID` ใน Order และ Discount คือ `Contact.codeName` จากฐานข้อมูล `Account`

ก่อนสร้างหรือแก้ไขข้อมูลที่อ้างถึงลูกค้า service จะตรวจสอบว่า contact มีอยู่จริง:

```text
Account.contact.codeName == customerID
```

ถ้าไม่พบ จะตอบกลับ `NotFoundError` พร้อม message:

```text
Customer contact not found
```

## Order Status

| Value | Name | ความหมาย |
| --- | --- | --- |
| 0 | `PrepareProduct` | เตรียมสินค้า |
| 1 | `PrepareShipment` | เตรียมจัดส่ง |
| 2 | `Billing` | จัดการบิล |
| 3 | `WaitingPayment` | รอชำระเงิน |
| 4 | `Completed` | เสร็จสิ้น |

workflow ปกติ:

```text
PrepareProduct -> PrepareShipment -> Billing -> WaitingPayment -> Completed
```

หมายเหตุ: เมื่ออยู่สถานะ `Billing` จะไม่สามารถ auto next ได้ ต้องเลือก `billing/income` หรือ `billing/debt`

## Bill APIs

### Search Orders

```http
GET /bill/search?customerID=CUST001&orderID=ORD-123
```

query ทั้งสองตัวเป็น optional:

| Query | Type | Required | Description |
| --- | --- | --- | --- |
| `customerID` | string | no | ค้นหาแบบ regex ไม่สนตัวพิมพ์เล็กใหญ่ |
| `orderID` | string | no | ค้นหาด้วย orderID แบบตรงตัว |

ตัวอย่าง response:

```json
{
  "success": true,
  "data": [
    {
      "orderID": "ORD-1710000000000-1234",
      "customerID": "CUST001",
      "status": 0,
      "items": [],
      "totalAmount": 1000
    }
  ]
}
```

### Get Orders By Status

```http
GET /bill/status/:status
```

ตัวอย่าง:

```http
GET /bill/status/2
```

ถ้า `status` ไม่อยู่ใน `OrderStatus` จะได้ `InvalidInputError`

### Create Order

```http
POST /bill
```

body:

```json
{
  "customerID": "CUST001",
  "status": 0,
  "items": [
    {
      "productID": "PROD001",
      "quantity": 2,
      "priceOriginal": 500,
      "priceAfterDiscount": 450,
      "discountPercent": 10
    }
  ],
  "totalAmount": 900
}
```

notes:

| Field | Type | Required |
| --- | --- | --- |
| `customerID` | string | yes |
| `status` | number | yes |
| `items` | array | yes |
| `items[].productID` | string | yes |
| `items[].quantity` | number | yes |
| `items[].priceOriginal` | number | yes |
| `items[].priceAfterDiscount` | number | yes |
| `items[].discountPercent` | number | no |
| `totalAmount` | number | yes |

`orderID` สร้างอัตโนมัติในรูปแบบ:

```text
ORD-<timestamp>-<4digits>
```

### Update Order

```http
PUT /bill/:orderID
```

body ส่ง field ที่ต้องการแก้ไข:

```json
{
  "items": [
    {
      "productID": "PROD001",
      "quantity": 3,
      "priceOriginal": 500,
      "priceAfterDiscount": 450,
      "discountPercent": 10
    }
  ],
  "totalAmount": 1350
}
```

ข้อจำกัด:

- ถ้า order ไม่พบ จะได้ `NotFoundError`
- ถ้า order อยู่สถานะ `Billing` หรือหลังจากนั้น จะได้ `InvalidStateError`
- ถ้าส่ง `customerID` ใหม่ ระบบจะตรวจสอบกับ Contact ก่อน

### Delete Order

```http
DELETE /bill/:orderID
```

response:

```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

ข้อจำกัด:

- ถ้า order ไม่พบ จะได้ `NotFoundError`
- ถ้า order อยู่สถานะ `Billing` หรือหลังจากนั้น จะได้ `InvalidStateError`

### Move To Next Step

```http
PATCH /bill/:orderID/next
```

เปลี่ยนสถานะตาม workflow:

```text
0 -> 1 -> 2
3 -> 4
```

ข้อจำกัด:

- ถ้าอยู่ `Billing` จะได้ `InvalidInputError`
- ถ้าอยู่สถานะสุดท้ายแล้ว จะได้ `InvalidInputError`

### Mark Billing As Income

```http
PATCH /bill/:orderID/billing/income
```

ใช้เมื่อ order อยู่สถานะ `Billing` เท่านั้น แล้วจะเปลี่ยนเป็น:

```text
Completed
```

### Mark Billing As Debt

```http
PATCH /bill/:orderID/billing/debt
```

ใช้เมื่อ order อยู่สถานะ `Billing` เท่านั้น แล้วจะเปลี่ยนเป็น:

```text
WaitingPayment
```

### Get Order Status

```http
GET /bill/:orderID/status
```

response:

```json
{
  "success": true,
  "data": 2
}
```

## Discount APIs

### Get Discounts

```http
GET /discount/:customerID
```

ตัวอย่าง:

```http
GET /discount/CUST001
```

ข้อจำกัด:

- ถ้า contact ไม่พบ จะได้ `NotFoundError`
- ถ้า contact มีอยู่แต่ยังไม่มี discount record จะได้ `NotFoundError` พร้อม message `No discount data for this customer`

response:

```json
{
  "success": true,
  "data": {
    "customerID": "CUST001",
    "discounts": [
      {
        "productID": "PROD001",
        "discountPercent": 10
      }
    ]
  }
}
```

### Update Discounts

```http
PUT /discount/:customerID
```

body:

```json
{
  "discounts": [
    {
      "productID": "PROD001",
      "discountPercent": 15
    },
    {
      "productID": "PROD002",
      "discountPercent": 5
    }
  ]
}
```

notes:

| Field | Type | Required |
| --- | --- | --- |
| `discounts` | array | yes |
| `discounts[].productID` | string | yes |
| `discounts[].discountPercent` | number | yes |

พฤติกรรม:

- ถ้า customer มีอยู่จริง จะ update หรือ create discount record ให้ด้วย `upsert`
- ถ้า `discounts` ไม่ใช่ array จะได้ `InvalidInputError`
- ถ้า contact ไม่พบ จะได้ `NotFoundError`

## Environment

`.env` ที่เกี่ยวข้อง:

```env
PORT=3004
SECRET=NuttaScholar
MONGO_URI_ACCOUNT=mongodb://root:example@localhost:27017/Account?authSource=admin
MONGO_URI_BILL=mongodb://root:example@localhost:27017/Bill?authSource=admin
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
npm test: pass, 8 specs
npm run dev: pass
```

ผลทดสอบ `npm run dev` ล่าสุด:

```text
Connected to databases: [ 'Account', 'Bill' ]
Databases connected: [ 'Account', 'Bill' ]
Bill Service running on port 3004
```

ตรวจสอบ route โดยเรียกแบบไม่ส่ง token:

```http
GET http://localhost:3004/bill/search
```

response ที่ได้ถูกต้องตาม `AuthMiddleware`:

```json
{
  "success": false,
  "errCode": 2,
  "message": "Authorization header missing"
}
```
