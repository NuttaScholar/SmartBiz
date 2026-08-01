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
| 5 | `Submitted` | รับคำสั่งซื้อ Online แล้ว รอหลักฐาน |
| 6 | `PaymentNotified` | ลูกค้าแนบหลักฐานแล้ว รอตรวจสอบ |
| 7 | `PaymentConfirmed` | สถานะรองรับความเข้ากันได้ของ flow Online |
| 8 | `Cancelled` | ยกเลิกคำสั่งซื้อ Online |

Order มี `source` เพื่อเลือก workflow โดยไม่เปลี่ยนเลขสถานะเดิม:

- `direct`: รายการที่สร้างจากหน้า Bill; document รุ่นเก่าที่ไม่มี `source` ถือเป็น `direct`
- `online`: รายการจาก Storefront

workflow สั่งโดยตรง:

```text
PrepareProduct -> PrepareShipment -> Billing -> WaitingPayment -> Completed
```

หมายเหตุ: เมื่ออยู่สถานะ `Billing` จะไม่สามารถ auto next ได้ ต้องเลือก `billing/income` หรือ `billing/debt`

workflow หน้าร้าน Online:

```text
Submitted -> PaymentNotified -> PrepareProduct -> PrepareShipment -> Completed
Submitted -> Cancelled
```

เมื่อยืนยันหลักฐาน ระบบบันทึก `paymentConfirmedAt` และ `paymentConfirmedBy`
พร้อมเปลี่ยนเป็น `PrepareProduct` ใน document เดิม ไม่สร้าง Bill order ซ้ำ

## Bill APIs

### Search Orders

```http
GET /bill/search?customerID=CUST001&orderID=ORD-123&status=2&source=direct
```

query ทุกตัวเป็น optional:

| Query | Type | Required | Description |
| --- | --- | --- | --- |
| `customerID` | string | no | ค้นหาแบบ regex ไม่สนตัวพิมพ์เล็กใหญ่ |
| `orderID` | string | no | ค้นหาด้วย orderID แบบตรงตัว |
| `status` | number | no | ค้นหาด้วย OrderStatus; ถ้าค่าไม่ถูกต้องจะได้ `InvalidInputError` |
| `source` | `online` \| `direct` | no | กรองแหล่งที่มาของ order |

ตัวอย่าง response:

```json
{
  "success": true,
  "data": [
    {
      "id": "ORD-1710000000000-1234",
      "customer": "Customer One",
      "customerID": "Ctm01",
      "date": "2026-05-23T10:00:00.000Z",
      "total": 900,
      "status": 0,
      "source": "direct",
      "list": [
        {
          "id": "PROD001",
          "type": 0,
          "name": "Product One",
          "img": "https://example.com/product-one.jpg",
          "status": 0,
          "price": 500,
          "amount": 2,
          "total": 900,
          "percentDiscount": 10,
          "priceAfterDiscount": 450
        }
      ]
    }
  ]
}
```

Search Orders enriches each item in `list` from the Stock database by `items[].productID`.
Product fields added to the response include `img`, `name`, and `total`, where `total = items[].quantity * items[].priceAfterDiscount`.
If a Stock product is missing during search response mapping, the API falls back to `name = productID`, `img = ""`, and the price stored on the order item.

Frontend contract:

- `src/API/BillService/type.ts` treats `responst_t<"getOrders">.result` as `orderInfo_t[]`.
- `src/API/BillService/Bill.ts` maps `searchOrders` to the enriched Search Orders response shape directly.
- Frontend `getOrdersByStatus` calls `GET /bill/search?status=<status>` so status tabs receive the same enriched `list[]` product data as normal search.
- `src/page/Bill/component/OrderListHeader.tsx` stores API `orderInfo_t` directly instead of rebuilding product cards from raw order items.
- `src/page/Bill/component/DialogOrderDetail.tsx` displays product `name`, `img`, `status`, `type`, `price`, `amount`, discount, and `total` from `list[]`.

### Get Orders By Status

```http
GET /bill/status/:status
```

ตัวอย่าง:

```http
GET /bill/status/2
```

ถ้า `status` ไม่อยู่ใน `OrderStatus` จะได้ `InvalidInputError`

หมายเหตุสำหรับ frontend: หน้ารายการบิลใช้ `GET /bill/search?status=<status>` แทน endpoint นี้ เพื่อให้ได้ response แบบ enriched ที่มีรายละเอียดสินค้าใน `list[]`.

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

total validation:

- `totalAmount` must equal `sum(items[].quantity * items[].priceAfterDiscount)`
- values are compared after rounding to 2 decimal places
- if the calculated total does not match the received `totalAmount`, the API returns `InvalidInputError`

inventory behavior:

- creating an order deducts stock for both `merchandise` and `another`
- insufficient stock returns `InvalidStateError`
- updating an order applies only the quantity difference
- deleting an order before Billing restores its stock

error example:

```json
{
  "success": false,
  "errCode": 6,
  "message": "totalAmount does not match calculated total (900)"
}
```

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
- ถ้าส่ง `items` หรือ `totalAmount` ระบบจะตรวจว่า `totalAmount` ต้องเท่ากับ `sum(items[].quantity * items[].priceAfterDiscount)` หากไม่ตรง จะได้ `InvalidInputError`

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
SERVICE_AUTH_SECRET=<random-secret-at-least-32-characters>
MONGO_URI_ACCOUNT=mongodb://root:example@localhost:27017/Account?authSource=admin
MONGO_URI_BILL=mongodb://root:example@localhost:27017/Bill?authSource=admin
MONGO_URI_STOCK=mongodb://root:example@localhost:27017/Stock?authSource=admin
```

## Storefront Order APIs (Service-to-Service)

`Service_Bill` เป็นเจ้าของ Online order ตั้งแต่สร้างรายการ โดย endpoint กลุ่มนี้
รับ service token จาก `service_storefront` เท่านั้น:

| Method | Endpoint | Scope | หน้าที่ |
| --- | --- | --- | --- |
| `POST` | `/bill/storefront` | `bill.storefront.manage` | สร้าง order ที่ `source=online`, `status=Submitted` และตัด stock |
| `GET` | `/bill/storefront?customerID=...&orderID=...` | `bill.storefront.read` | อ่าน Online order ของลูกค้า |
| `PATCH` | `/bill/storefront/:orderID/evidence` | `bill.storefront.manage` | บันทึก metadata หลักฐานและเปลี่ยนเป็น `PaymentNotified` |
| `DELETE` | `/bill/storefront/:orderID?customerID=...` | `bill.storefront.manage` | soft cancel สถานะ `Submitted` และคืน stock |
| `GET` | `/bill/storefront/payment-confirmations` | `bill.storefront.read` | รายการ `PaymentNotified` ที่รอตรวจสอบ |
| `PATCH` | `/bill/storefront/:orderID/payment-confirmation` | `bill.storefront.manage` | ยืนยันชำระ บันทึกผู้ยืนยัน และเปลี่ยนเป็น `PrepareProduct` |

ตัวอย่าง document กลาง:

```json
{
  "orderID": "SO-260801-ABCDEF01",
  "customerID": "CUST-001",
  "source": "online",
  "status": 6,
  "items": [],
  "totalAmount": 180,
  "confirmationEvidence": {
    "fileName": "proof.webp",
    "mimeType": "image/webp",
    "objectKey": "SO-260801-ABCDEF01/1785550000000-proof.webp",
    "updatedAt": "2026-08-01T03:00:00.000Z"
  }
}
```

หน้า Bill ใช้ `source` เป็นตัวกรอง “หน้าร้าน Online” และ “สั่งโดยตรง”
จากนั้นแสดง status tabs ตาม flow ของ source ที่เลือก

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
npm test: pass, 20 specs
npm run dev: pass
API smoke test: pass (2026-05-23)
Frontend npm run build: pass (2026-05-24)
```

ผลทดสอบ `npm run dev` ล่าสุด:

```text
Connected to databases: [ 'Account', 'Bill', 'Stock' ]
Databases connected: [ 'Account', 'Bill', 'Stock' ]
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

ผลทดสอบ API ล่าสุด:

```text
Test date: 2026-05-23
Seed data: temporary Contact + Product in Account/Stock, removed after test

GET /bill/search without token: pass, HTTP 401, errCode 2
POST /bill invalid totalAmount: pass, HTTP 400, errCode 6
POST /bill valid totalAmount: pass, created orderID ORD-1779548638754-1588
GET /bill/search with customerID/orderID/status: pass
GET /bill/search enrich product details from Stock: pass, list[0].name/img populated, list[0].total = 900
GET /bill/:orderID/status: pass, status 0
PUT /bill/:orderID invalid totalAmount: pass, HTTP 400, errCode 6
PUT /bill/:orderID valid totalAmount: pass, totalAmount = 1350
GET /bill/search after update: pass, list[0].total = 1350
PUT /discount/:customerID: pass
GET /discount/:customerID: pass
DELETE /bill/:orderID cleanup: pass
Cleanup seeded Contact/Product/Discount: pass
```

ผลทดสอบ frontend ล่าสุด:

```text
Test date: 2026-05-24
npm run build: pass
Bill frontend API type update: pass
Bill order list consumes enriched orderInfo_t[] directly: pass
Bill status tab uses /bill/search?status=<status>: pass
Bill order detail uses product status/type from API list[]: pass
Vite dev server start: pass, http://127.0.0.1:3030/
Browser UI smoke test: skipped, Codex in-app browser was unavailable in this session
```
