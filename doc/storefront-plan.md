# รายงานนำเสนอแนวทางการพัฒนาหน้าเว็บร้านค้า SmartBiz Storefront

## วัตถุประสงค์

พัฒนา `apps/storefront` ให้เป็นหน้าเว็บร้านค้าสำหรับลูกค้า โดยแยก entrypoint ออกจากแอปหลักแต่ยังใช้ข้อมูล สไตล์ และ component ที่มีอยู่ในโปรเจกต์ SmartBiz ได้ เพื่อให้ลูกค้าค้นหาสินค้า เลือกสินค้า ตรวจสอบส่วนลด ยืนยันคำสั่งซื้อ และติดตามสถานะคำสั่งซื้อได้จาก URL เฉพาะของลูกค้า

## ขอบเขตการพัฒนา

Storefront จะเป็น React + Vite app แยกตามโครงสร้างปัจจุบัน:

- Entry: `apps/storefront/src/main.tsx`
- Style เฉพาะหน้าเว็บร้านค้า: `apps/storefront/src/style.css`
- Config สำหรับรันแยก: `vite.storefront.config.ts`
- คำสั่งที่เกี่ยวข้อง: `npm run dev:storefront`, `npm run build:storefront`, `npm run preview:storefront`

แนวทางนี้ช่วยให้พัฒนาหน้าร้านโดยไม่กระทบ route หลังบ้านของแอปหลัก เช่น `/bill`, `/stock`, `/access` แต่ยัง reuse type, API wrapper, theme และ component จาก `src/` ได้ตามความเหมาะสม

## คุณสมบัติหลัก

### 1. Responsive รองรับ PC และ Mobile

หน้าเว็บควรออกแบบแบบ mobile-first และขยาย layout สำหรับ PC:

- Mobile: แสดงสินค้าเป็น list/card 1 คอลัมน์, cart summary เป็นแถบด้านล่างหรือ drawer
- Tablet: แสดงสินค้า 2 คอลัมน์ และสรุปรายการแบบ sticky section
- PC: แสดงสินค้าเป็น grid 3-4 คอลัมน์ พร้อม panel สรุปรายการคำสั่งซื้อด้านขวา
- ใช้ breakpoints ของ MUI เพื่อให้สอดคล้องกับแอปหลัก
- กำหนดขนาดรูปสินค้าและปุ่มให้คงที่เพื่อลด layout shift

### 2. ช่องค้นหารายการสินค้า

ควรมี search box อยู่ในตำแหน่งที่เข้าถึงง่ายบริเวณหัวหน้าเว็บ:

- ค้นหาจากชื่อสินค้าและรหัสสินค้า
- debounce การค้นหาเพื่อลดการ render หรือการเรียก API ถี่เกินไป
- รองรับสถานะ empty result, loading และ error
- ในระยะแรกสามารถ filter จากรายการสินค้าที่โหลดมาแล้วได้
- หากจำนวนสินค้าเพิ่มมากขึ้น ควรต่อยอดเป็น server-side search ผ่าน Stock service

Component ที่นำมาใช้ได้:

- `src/component/Molecules/FieldSearch.tsx` สำหรับช่องค้นหา หากรูปแบบตรงกับ UX ของ storefront
- MUI `TextField`, `InputAdornment` และ icon จาก `@mui/icons-material`

### 3. รายการสินค้าแสดงราคา คงคลัง ส่วนลด และราคาหลังหักส่วนลด

ข้อมูลสินค้าควรอ้างอิง type ปัจจุบันจาก `src/API/StockService/type.ts` โดยใช้ `productInfo_t` ซึ่งรองรับข้อมูลสำคัญอยู่แล้ว:

- `id`
- `name`
- `img`
- `price`
- `amount`
- `percentDiscount`
- `priceAfterDiscount`
- `status`
- `description`

การคำนวณราคาหลังส่วนลด:

```ts
priceAfterDiscount = price * (1 - percentDiscount / 100)
```

ข้อเสนอด้าน UI:

- แสดงราคาเต็มแบบขีดฆ่าเมื่อมีส่วนลด
- แสดงส่วนลดเป็นเปอร์เซ็นต์
- แสดงราคาหลังหักส่วนลดเป็นราคาหลัก
- แสดงจำนวนคงคลังและ badge เตือนเมื่อสินค้าใกล้หมดหรือหมด
- ปิดปุ่มเพิ่มสินค้าเมื่อ `amount` เท่ากับ 0 หรือสถานะเป็นสินค้าหมด

Component ที่นำมาใช้ได้:

- `src/component/Organisms/CardProduct.tsx` มีโครงสร้างที่รองรับราคา ส่วนลด ราคาหลังหักส่วนลด จำนวน และรูปสินค้าอยู่แล้ว
- อาจสร้าง wrapper เช่น `StorefrontProductCard` เพื่อเพิ่มปุ่มเพิ่ม/ลดจำนวน โดยไม่แก้ behavior ของ component ที่ใช้ในแอปหลัก

### 4. หน้าสรุปรายการคำสั่งซื้อและปุ่มยืนยันคำสั่งซื้อ

ควรมี cart/order summary ที่แสดงรายการสินค้าที่ลูกค้าเลือก:

- ชื่อสินค้า
- จำนวน
- ราคาต่อชิ้นหลังหักส่วนลด
- ยอดรวมต่อสินค้า
- ยอดรวมทั้งหมดที่ต้องชำระ
- ปุ่มยืนยันคำสั่งซื้อ

สูตรคำนวณ:

```ts
lineTotal = quantity * priceAfterDiscount
totalAmount = sum(lineTotal)
```

เมื่อกดยืนยันคำสั่งซื้อ ให้สร้าง payload ตาม type ใน `src/API/BillService/type.ts`:

```ts
createOrderForm_t = {
  customerID,
  status,
  items,
  totalAmount,
}
```

สถานะเริ่มต้นควรใช้สถานะเริ่มกระบวนการของคำสั่งซื้อ เช่น `PrepareProduct` หรือสถานะที่ Service_Bill กำหนดไว้ใน `billStatus_e`

### 5. ประวัติคำสั่งซื้อและสถานะคำสั่งซื้อ

ควรมีหน้าหรือแท็บ "ประวัติคำสั่งซื้อ" สำหรับลูกค้า:

- แสดงเลขคำสั่งซื้อ
- วันที่สั่งซื้อ
- จำนวนรายการ
- ยอดรวม
- สถานะล่าสุด
- ปุ่มดูรายละเอียดคำสั่งซื้อ

ข้อมูลใช้จาก Bill service:

- ค้นหาคำสั่งซื้อด้วย `customerID`
- ตรวจสอบสถานะคำสั่งซื้อด้วย `orderID`
- reuse type `orderInfo_t`, `searchOrderForm_t` และ `billStatus_e`

แนวทาง route:

- `/storefront/:customerToken` หน้าเลือกสินค้าและสรุปรายการ
- `/storefront/:customerToken/orders` ประวัติคำสั่งซื้อ
- `/storefront/:customerToken/orders/:orderID` รายละเอียดคำสั่งซื้อและสถานะ

### 6. อนุญาตให้ใช้ component จาก app หลัก

สามารถ reuse component จาก `src/component` ได้ โดยควรเลือกใช้แบบไม่ผูกกับ flow หลังบ้านมากเกินไป:

- `CardProduct` สำหรับแสดงสินค้า
- `CardOrder` สำหรับสรุปคำสั่งซื้อหรือแสดงประวัติ
- `HeaderDialog` หรือ `AppBar_*` หากต้องการ header ที่หน้าตาใกล้แอปหลัก
- `FieldSearch` สำหรับค้นหา
- `Text_Money` หากต้องการ format เงินให้เหมือนกันทั้งระบบ
- `DialogQuestion` สำหรับยืนยันคำสั่งซื้อก่อนส่ง

ข้อควรระวัง:

- หาก component เดิมผูกกับ route หลังบ้านหรือ auth context ของแอปหลัก ควรสร้าง storefront wrapper แทนการแก้ component เดิม
- หลีกเลี่ยงการแก้ component กลางเพื่อ requirement เฉพาะ storefront ยกเว้นเป็น prop เพิ่มเติมที่ไม่กระทบหน้าเดิม

### 7. รองรับ Dynamic Params จาก URL เพื่อยืนยันตัวตนลูกค้า

Storefront ควรรองรับ URL ที่มี dynamic params เพื่อระบุตัวลูกค้า เช่น:

```txt
/storefront/:customerToken
/storefront/:customerToken/orders
/storefront/:customerToken/orders/:orderID
```

แนวทางยืนยันตัวตน:

- อ่าน `customerToken` จาก `useParams`
- ส่ง token ไปตรวจสอบกับ backend หรือ endpoint สำหรับ resolve เป็น `customerID`
- เมื่อ resolve สำเร็จ จึงโหลดสินค้า ส่วนลดเฉพาะลูกค้า และประวัติคำสั่งซื้อ
- หาก token ไม่ถูกต้อง ให้แสดงหน้าข้อความว่าไม่พบสิทธิ์การเข้าถึง
- ไม่ควรเปิดเผย `customerID` ตรง ๆ หากต้องแชร์ลิงก์ให้ลูกค้า ควรใช้ token ที่ backend ตรวจสอบได้

ข้อมูลส่วนลดรายลูกค้า:

- ใช้ Discount API ผ่าน `customerID`
- map `discountItem_t.productID` เข้ากับสินค้าแต่ละรายการ
- เติม `percentDiscount` และ `priceAfterDiscount` ก่อน render สินค้า

### 8. ใช้ธีมสีเดียวกับโปรเจกต์หลัก

ธีมหลักใน `src/App.tsx` ใช้ MUI theme ดังนี้:

- Primary light: `#3393dc`
- Primary main: `#0078D4`
- Primary dark: `#005494`
- Secondary light: `#e6f2ff`
- Secondary main: `#E0EFFF`
- Secondary dark: `#CCDEF0`
- Font: `Kanit, Roboto`

Storefront ควรใช้ค่าสีและฟอนต์เดียวกัน โดยแนะนำให้ย้าย theme เป็นไฟล์กลาง เช่น:

```txt
src/theme.ts
```

จากนั้นให้ทั้งแอปหลักและ storefront import theme เดียวกัน เพื่อลดความเสี่ยงที่สีหรือ typography ไม่ตรงกันในอนาคต

## โครงสร้างหน้าที่แนะนำ

```txt
apps/storefront/src/
  main.tsx
  style.css
  StorefrontApp.tsx
  pages/
    ProductPage.tsx
    OrderHistoryPage.tsx
    OrderDetailPage.tsx
  components/
    StorefrontHeader.tsx
    ProductSearch.tsx
    StorefrontProductCard.tsx
    CartSummary.tsx
    OrderStatusBadge.tsx
  hooks/
    useCustomerIdentity.ts
    useStorefrontProducts.ts
    useCart.ts
```

## Backend Service ที่เสนอ

ควรสร้าง backend service ใหม่สำหรับ Storefront โดยเฉพาะ เช่น `ServerService/Service_Storefront` เพื่อเป็น customer-facing API ระหว่างหน้าเว็บร้านค้ากับ service ภายในที่มีอยู่เดิม

หน้าที่หลักของ `Service_Storefront`:

- ตรวจสอบ `customerToken` จาก URL และ resolve เป็น `customerID`
- จำกัดสิทธิ์ให้ลูกค้าเข้าถึงเฉพาะข้อมูลของตนเอง
- รวมข้อมูลสินค้าจาก Stock service กับส่วนลดรายลูกค้าจาก Bill/Discount service
- คำนวณ `priceAfterDiscount` ฝั่ง backend เพื่อให้ frontend แสดงผลตามข้อมูลที่ตรวจสอบแล้ว
- ตรวจสอบ stock ซ้ำก่อนสร้างคำสั่งซื้อ
- สร้างคำสั่งซื้อผ่าน Bill service โดยบันทึกราคาและส่วนลด ณ เวลาสั่งซื้อ
- ส่งประวัติคำสั่งซื้อและสถานะคำสั่งซื้อเฉพาะของลูกค้าคนนั้น

โครงสร้างที่แนะนำ:

```txt
ServerService/Service_Storefront/
  package.json
  tsconfig.json
  Dockerfile
  Report.md
  src/
    index.ts
    config.ts
    type.ts
    routes/
      storefront.routes.ts
    controllers/
      storefront.controller.ts
    services/
      storefront.service.ts
      token.service.ts
      stock.service.ts
      bill.service.ts
    repositories/
      customerToken.repo.ts
    models/
      customer-token.model.ts
      customer-token.interface.ts
    middlewares/
      storefrontAuth.ts
    utils/
      enum.ts
      response.ts
```

Endpoint ที่ควรมี:

| Method | Path | หน้าที่ |
| --- | --- | --- |
| `GET` | `/storefront/session/:customerToken` | ตรวจสอบ token และคืนข้อมูลลูกค้าแบบย่อ |
| `GET` | `/storefront/:customerToken/products` | คืนรายการสินค้า ราคา คงคลัง ส่วนลด และราคาหลังลด |
| `POST` | `/storefront/:customerToken/orders` | ตรวจสอบตะกร้าและสร้างคำสั่งซื้อ |
| `GET` | `/storefront/:customerToken/orders` | คืนประวัติคำสั่งซื้อของลูกค้า |
| `GET` | `/storefront/:customerToken/orders/:orderID` | คืนรายละเอียดคำสั่งซื้อของลูกค้า |
| `GET` | `/storefront/:customerToken/orders/:orderID/status` | คืนสถานะล่าสุดของคำสั่งซื้อ |

การแยก service นี้ช่วยให้ frontend ไม่ต้องถือ admin token และไม่ต้องรู้รายละเอียดการเรียกหลาย service ภายใน ระบบจะมีจุดเดียวสำหรับบังคับสิทธิ์ ตรวจข้อมูล และแปลง response ให้เหมาะกับหน้าร้าน

## Data Flow ที่เสนอ

1. ลูกค้าเปิด URL ที่มี `customerToken`
2. Frontend เรียก `Service_Storefront` เพื่อตรวจสอบ token และรับข้อมูลลูกค้าแบบย่อ
3. Frontend เรียก `Service_Storefront` เพื่อโหลดรายการสินค้า
4. `Service_Storefront` ดึงข้อมูลสินค้าและคงคลังจาก Stock service
5. `Service_Storefront` ดึงส่วนลดรายลูกค้าจาก Bill/Discount service
6. `Service_Storefront` รวมข้อมูลสินค้า ส่วนลด และคำนวณราคาหลังหักส่วนลดก่อนส่งกลับให้ frontend
7. ลูกค้าค้นหาและเลือกสินค้าเข้าตะกร้า
8. Cart summary คำนวณยอดรวมแบบ real-time จากราคาที่ backend ส่งมา
9. ลูกค้ากดยืนยันคำสั่งซื้อ
10. Frontend ส่งตะกร้าไปยัง `Service_Storefront`
11. `Service_Storefront` ตรวจ token, ตรวจ stock, ตรวจราคา/ส่วนลดซ้ำ และสร้างคำสั่งซื้อผ่าน Bill service
12. ลูกค้าดูประวัติและติดตามสถานะผ่าน `Service_Storefront`

## API และ Type ที่เกี่ยวข้อง

ฝั่ง frontend ควรมี API layer ใหม่สำหรับ Storefront โดยเฉพาะ เช่น:

- `apps/storefront/src/api/storefront.ts` หรือ `src/API/StorefrontService/Storefront.ts`
- `apps/storefront/src/api/type.ts` หรือ `src/API/StorefrontService/type.ts`

type ภายใน service ใหม่ควร reuse หรือ map จาก type เดิมเป็นหลัก:

- `src/API/StockService/type.ts`
  - `productInfo_t`
  - `productRes_t`
  - `queryProduct_t`
- `src/API/BillService/type.ts`
  - `orderInfo_t`
  - `orderItem_t`
  - `createOrderForm_t`
  - `searchOrderForm_t`
  - `discount_t`
  - `discountItem_t`
- `src/enum.ts`
  - `billStatus_e`
  - `stockStatus_e`
  - `productType_e`

ตัวอย่าง response ที่เหมาะกับ frontend:

```ts
type storefrontProduct_t = {
  id: string;
  name: string;
  img: string;
  description?: string;
  price: number;
  amount: number;
  percentDiscount: number;
  priceAfterDiscount: number;
  status: stockStatus_e;
}

type storefrontOrderItem_t = {
  productID: string;
  quantity: number;
}

type storefrontCreateOrderReq_t = {
  items: storefrontOrderItem_t[];
}
```

`Service_Storefront` ควรเป็นผู้เติม `customerID`, `priceOriginal`, `priceAfterDiscount`, `discountPercent`, `totalAmount` และ `status` ก่อนส่งต่อไปยัง Bill service เพื่อไม่ให้ frontend สามารถแก้ไขยอดเงินเองได้

## แผนดำเนินงาน

| ระยะ | งาน | ผลลัพธ์ |
| --- | --- | --- |
| 1 | สร้าง `Service_Storefront` และ endpoint ตรวจ token | มี backend เฉพาะสำหรับหน้าร้าน |
| 2 | เชื่อม `Service_Storefront` กับ Stock และ Bill/Discount service | รวมสินค้า คงคลัง และส่วนลดรายลูกค้าได้ |
| 3 | ทำ endpoint สร้างคำสั่งซื้อพร้อมตรวจ stock/ราคา/ส่วนลดซ้ำ | สร้าง order ได้โดย frontend ไม่แก้ยอดเอง |
| 4 | ทำ endpoint ประวัติและสถานะคำสั่งซื้อ | ลูกค้าติดตามคำสั่งซื้อของตนเองได้ |
| 5 | แยก theme กลางและตั้งค่า Storefront app shell | Storefront ใช้สีและ font เดียวกับแอปหลัก |
| 6 | ทำ customer token resolver ฝั่ง frontend | เปิดหน้าร้านจาก dynamic params ได้ |
| 7 | ทำ search, responsive product list และ cart summary | ค้นหา เลือกสินค้า และเห็นยอดรวมได้ทั้ง PC/mobile |
| 8 | เชื่อม frontend กับ `Service_Storefront` ครบ flow | ใช้งานหน้าร้านครบตั้งแต่เลือกสินค้าถึงติดตามสถานะ |
| 9 | ทดสอบ responsive, API permission และ edge cases | พร้อม build และใช้งานจริง |

## เกณฑ์ตรวจรับ

- หน้าเว็บแสดงผลไม่ล้นจอบน mobile ขนาด 320px ขึ้นไป
- หน้าเว็บ PC แสดงรายการสินค้าและสรุปคำสั่งซื้อพร้อมกันได้อย่างชัดเจน
- ค้นหาสินค้าด้วยชื่อหรือรหัสสินค้าได้
- สินค้าแสดงราคา จำนวนคงคลัง ส่วนลด และราคาหลังหักส่วนลดครบถ้วน
- สรุปรายการคำสั่งซื้อคำนวณยอดรวมถูกต้อง
- ปุ่มยืนยันคำสั่งซื้อสร้าง order ได้จริงและป้องกันการกดซ้ำขณะ loading
- ลูกค้าดูประวัติคำสั่งซื้อและสถานะได้จาก dynamic URL ของตนเอง
- Frontend เรียกเฉพาะ `Service_Storefront` สำหรับ flow ลูกค้า ไม่เรียก service หลังบ้านโดยตรง
- Backend ตรวจ token และป้องกันการเข้าถึง order ของลูกค้าคนอื่น
- Backend ตรวจ stock ราคา และส่วนลดซ้ำก่อนสร้าง order
- ใช้สี `#0078D4` และธีมเดียวกับแอปหลัก
- Build ผ่านด้วย `npm run build:storefront`

## ความเสี่ยงและข้อเสนอแนะ

- หากใช้ `customerID` ตรงใน URL อาจเดาได้ง่าย ควรใช้ token หรือ signed link
- หาก frontend เรียก Stock/Bill/Discount service โดยตรงจะเสี่ยงด้านสิทธิ์และทำให้ business rule กระจาย ควรบังคับให้ flow ลูกค้าผ่าน `Service_Storefront` เท่านั้น
- `Service_Storefront` ควรมี rate limit หรือ token expiry สำหรับลิงก์ลูกค้า เพื่อลดความเสี่ยงจากลิงก์รั่ว
- ควรตรวจ stock อีกครั้งตอนยืนยันคำสั่งซื้อ เพื่อป้องกันลูกค้าหลายคนสั่งสินค้าเกินคงคลังพร้อมกัน
- ควรบันทึกราคาตอนสร้างคำสั่งซื้อใน `orderItem_t` ตามที่ type รองรับแล้ว เพื่อให้ประวัติคำสั่งซื้อไม่เปลี่ยนตามราคาสินค้าในอนาคต
- ควรแสดงสถานะ error ที่อ่านง่าย เช่น token หมดอายุ สินค้าหมด หรือสร้างคำสั่งซื้อไม่สำเร็จ
