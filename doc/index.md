# รายงานสำรวจโปรเจค SmartBiz

เอกสารนี้สรุปหน้าที่ของไฟล์และโฟลเดอร์หลักในโปรเจค SmartBiz โดยอ้างอิงรายการไฟล์ที่ไม่ถูกตัดออกตาม `.gitignore` ผ่าน `git ls-files --cached --others --exclude-standard` ตาม workflow การสร้างภาพรวมโปรเจค

## ภาพรวมโปรเจค

SmartBiz เป็น Web Application สำหรับงานธุรกิจขนาดเล็ก พัฒนาด้วย React + Vite ฝั่ง frontend และแยก backend เป็นหลาย Express/TypeScript service ได้แก่ login/user, account, storage, stock และ bill/order โดยมีทั้งโหมดแอปหลักและ Storefront ผ่าน Vite config แยก

ฟีเจอร์หลักที่พบจากโค้ด:

- ระบบ login, refresh token, จัดการผู้ใช้ และเปลี่ยนรหัสผ่าน
- ระบบบัญชีรายรับรายจ่าย พร้อม contact, transaction, wallet และแนบรูปบิล
- ระบบสต็อกสินค้า/วัตถุดิบ พร้อม product, stock in/out, log และรูปสินค้า
- ระบบบิล/คำสั่งซื้อ พร้อม workflow สถานะ order และส่วนลดรายลูกค้า
- ระบบ Storefront frontend แยก entrypoint สำหรับหน้าร้านหรือ flow เฉพาะ
- ระบบจัดเก็บรูปภาพผ่าน MinIO

สถาปัตยกรรมโดยรวมคือ frontend เรียก backend ผ่าน `src/API/*` และ backend service ตรวจ JWT จาก `Service_Login` ผ่าน header `Authorization: Bearer <token>`

## รายการที่ถูกยกเว้นตาม `.gitignore`

รายการเหล่านี้ไม่ควรนำมาอธิบายเป็นโครงสร้างหลักของโปรเจค:

- `node_modules/`
- `dist/`, `dist-ssr/`
- `logs/`, `*.log` และ debug log ของ npm/yarn/pnpm/lerna
- `.env.production`
- `*.local`
- `/workflow*.md`, `/workflows*.md`
- `.vscode/*` ยกเว้น `.vscode/extensions.json`
- `.idea/`, `.DS_Store`, `*.suo`, `*.ntvs*`, `*.njsproj`, `*.sln`, `*.sw?`

หมายเหตุ: `.env` ของ root และ service ย่อยยังอยู่ในรายการไฟล์ที่ไม่ถูก ignore จึงนับเป็นไฟล์ใน scope รายงาน แต่เอกสารนี้อธิบายเฉพาะหน้าที่ ไม่เปิดเผยค่าภายในไฟล์

## โครงสร้างระดับ Root

| Path | หน้าที่ |
| --- | --- |
| `.dockerignore` | กำหนดไฟล์ที่ไม่ต้องส่งเข้า Docker build context ของ frontend |
| `.gitignore` | กำหนดไฟล์และโฟลเดอร์ที่ไม่ต้อง track เช่น dependency, build output, log, local workflow note และไฟล์ local |
| `.env` | ค่า environment สำหรับรันระบบ เช่น host, port, secret และค่าการเชื่อมต่อ service/storage โดยไม่ควรเปิดเผยค่าจริง |
| `README.md` | เอกสารแนะนำโปรเจคและการติดตั้งเบื้องต้น |
| `LICENSE` | เงื่อนไข license ของโปรเจค |
| `Dockerfile` | build image frontend โดย build React/Vite แล้ว serve ผ่าน Nginx |
| `package.json` | package หลักของ frontend ระบุ script `dev`, `dev:storefront`, `build`, `build:storefront`, `lint`, `preview`, `preview:storefront` และ dependency ของ React/Vite/MUI |
| `package-lock.json` | lock dependency ของ frontend |
| `index.html` | HTML entrypoint ของ Vite ที่ mount React app |
| `vite.config.ts` | ตั้งค่า Vite ใช้ React plugin, dev server/preview port `3030` และ build หลาย entrypoint ได้แก่ `index.html` กับ `apps/storefront/index.html` |
| `vite.storefront.config.ts` | ตั้งค่า Vite สำหรับ Storefront โดย rewrite `/` ไป `apps/storefront/index.html` และใช้ port `4030` |
| `tsconfig.json` | TypeScript project references ของ frontend |
| `tsconfig.app.json` | TypeScript config สำหรับ source ฝั่ง browser/app |
| `tsconfig.node.json` | TypeScript config สำหรับไฟล์ config ที่รันบน Node เช่น Vite config |
| `eslint.config.js` | ตั้งค่า ESLint สำหรับตรวจคุณภาพโค้ด frontend |
| `docker-compose.yml` | ประกอบระบบ container ได้แก่ MongoDB, mongo-express, MinIO, account/login/stock/bill/storage service และ Nginx web |
| `nginx.conf` | config หลักของ Nginx container |
| `templates/default.conf.template` | server block template สำหรับ serve React SPA และ fallback ไป `index.html` |
| `index.md` | รายงานภาพรวมโครงสร้างโปรเจคฉบับนี้ |

## โฟลเดอร์ระดับ Root

| Path | หน้าที่ |
| --- | --- |
| `.github/` | โฟลเดอร์สำหรับ GitHub workflow/config ปัจจุบันไม่พบไฟล์ที่ไม่ถูก ignore ภายใน |
| `cert/` | เก็บ certificate/key สำหรับเปิด HTTPS ใน Vite dev server หากเปิดใช้ |
| `apps/` | โฟลเดอร์รวม app รองที่ใช้ Vite config แยก เช่น `apps/storefront/` |
| `public/` | static assets ที่ Vite serve ตรง เช่น `vite.svg` |
| `src/` | source code frontend React |
| `ServerService/` | source code backend service ย่อยทั้งหมด |
| `templates/` | template config ของ Nginx ที่ mount เข้า container |

## Frontend: `src/`

| Path | หน้าที่ |
| --- | --- |
| `src/main.tsx` | entrypoint ของ React สร้าง root และ render `App` |
| `src/App.tsx` | กำหนด theme, provider, lazy loading และ route หลัก เช่น `/login`, `/access`, `/bill`, `/stock` |
| `src/App.css`, `src/index.css` | style ระดับแอปและ global style |
| `src/vite-env.d.ts` | type declaration สำหรับ Vite environment |
| `src/type.ts` | type กลางของ frontend |
| `src/enum.ts` | enum กลาง เช่น transaction type, product type, role, stock status, bill status และ error code |
| `src/assets/` | รูปประกอบที่ import ใน React เช่น `NoImage.jpg`, `react.svg` |
| `src/constants/` | ค่าคงที่ เช่น `urlbase.tsx` สำหรับประกอบ URL ของ MinIO จาก env |
| `src/context/` | React context กลาง เช่น `AuthContext.tsx` สำหรับสถานะ authentication |
| `src/hooks/` | custom hooks กลาง เช่น `useAuth.ts` |
| `src/lib/` | utility กลาง เช่น axios instances, retry wrapper, local storage helper, calculate helper และ init page |
| `src/function/` | helper function/enum legacy เช่น `Enum.ts`, `Window.tsx` |
| `src/dataSet/` | dataset ฝั่ง frontend เช่นรายการ contact |

## Secondary Apps: `apps/`

โฟลเดอร์นี้ใช้เก็บ app รองที่มี entrypoint และ Vite config แยกจากแอปหลัก เพื่อให้เพิ่ม Storefront, prototype หรือ mini app ใหม่ได้โดยไม่ปนกับ `src/` ของแอปหลัก

| Path | หน้าที่ |
| --- | --- |
| `apps/storefront/index.html` | HTML entrypoint ของ Storefront app |
| `apps/storefront/src/main.tsx` | React entrypoint ของ Storefront app |
| `apps/storefront/src/style.css` | stylesheet เฉพาะ Storefront app |

## Frontend API Layer: `src/API/`

โฟลเดอร์นี้เป็นตัวกลางเรียก backend API แยกตาม service และ normalize response ให้ frontend ใช้งานได้ง่ายขึ้น

| Path | หน้าที่ |
| --- | --- |
| `src/API/AccountService/Account.ts` | เรียก API งานบัญชี/transaction/wallet |
| `src/API/AccountService/Contact.ts` | เรียก API จัดการ contact |
| `src/API/AccountService/type.ts` | type ของ Account service |
| `src/API/LoginService/Login.ts` | เรียก API login/logout/token |
| `src/API/LoginService/User.ts` | เรียก API จัดการ user |
| `src/API/LoginService/type.ts` | type ของ Login service |
| `src/API/StorageService/Storage.ts` | เรียก API จัดการ storage/image/presigned URL |
| `src/API/StorageService/type.ts` | type ของ Storage service |
| `src/API/StockService/Stock.ts` | เรียก API สินค้า สต็อก stock in/out status และ log |
| `src/API/StockService/type.ts` | type ของ Stock service |
| `src/API/BillService/Bill.ts` | เรียก API `Service_Bill` ครบทั้ง `/bill` และ `/discount` พร้อมแปลง response เป็นรูปแบบ frontend |
| `src/API/BillService/type.ts` | type ของ Bill service เช่น order, order item, discount, search form และ response |

## Frontend Components: `src/component/`

โครงสร้าง component แบ่งแนว atomic design

| Path | หน้าที่ |
| --- | --- |
| `src/component/Atoms/` | component ขนาดเล็ก เช่น field, label, tab, money/month text, box layout และ card value |
| `src/component/Molecules/` | component ที่ประกอบจากหลาย atom เช่น app bar, field form หลายประเภท, selector, dialog header, list user/contact, product list และ transaction detail |
| `src/component/Organisms/` | component ระดับใหญ่ที่ใช้ซ้ำข้ามหน้า เช่น form สินค้า, card order/product, dialog contact/edit image, receipt preview, summary/status/monthly list |

## Frontend Pages: `src/page/`

| Path | หน้าที่ |
| --- | --- |
| `src/page/Login.tsx` | หน้า login |
| `src/page/SetUser.tsx` | หน้าจัดการผู้ใช้ |
| `src/page/SetPass.tsx` | หน้าเปลี่ยนรหัสผ่าน |
| `src/page/Cadit.tsx` | หน้าบันทึกรายการกู้ยืมหรือเครดิต |
| `src/page/CheckIn.tsx` | หน้าบันทึกเวลาเข้าออกงาน |
| `src/page/PageLoader.tsx` | loading fallback ตอน lazy load page |
| `src/page/NotFound.tsx` | หน้า fallback เมื่อ route ไม่ตรง |
| `src/page/test.tsx` | หน้า demo/test route |

### `src/page/Access/`

ระบบบัญชีรายรับรายจ่าย

| Path | หน้าที่ |
| --- | --- |
| `Access.tsx` | หน้าหลักของระบบบัญชี |
| `page/AccessSearch.tsx` | หน้าค้นหารายการบัญชี |
| `context/AccessContext.tsx` | state/context ของระบบบัญชี |
| `hooks/useAccess.ts` | hook สำหรับดึง context บัญชี |
| `lib/accessWithRetry.ts` | wrapper เรียก API บัญชีพร้อม refresh token/retry |
| `lib/contactWithRetry.ts` | wrapper เรียก API contact พร้อม refresh token/retry |
| `lib/initTrans.ts` | ค่าเริ่มต้นของ transaction form |
| `constants/typeSelect.ts` | option/type สำหรับเลือกประเภทรายการ |
| `component/` | UI เฉพาะระบบบัญชี เช่น dialog contact/transaction, money total, speed dial และ yearly transaction |

### `src/page/Bill/`

ระบบบิลและคำสั่งซื้อ

| Path | หน้าที่ |
| --- | --- |
| `Bill.tsx` | หน้าหลักรายการบิล/order |
| `page/BillCreate.tsx` | หน้าสร้างหรือแก้ไขบิล |
| `page/BillDetail.tsx` | หน้ารายละเอียดบิลตาม `orderID` |
| `page/BillPreview.tsx` | หน้าพรีวิวบิล |
| `page/SetDiscount.tsx` | หน้าตั้งค่าส่วนลดรายลูกค้า |
| `context/BillContext.ts` | state/context ของระบบบิล |
| `hooks/useBillContex.ts` | hook สำหรับดึง context บิล |
| `lib/billWithRetry.ts` | wrapper เรียก `src/API/BillService/Bill.ts` พร้อม refresh token/retry |
| `component/` | UI เฉพาะระบบบิล เช่น order list/status, merch list, form header, dialog order/detail/edit และ speed dial |

### `src/page/Stock/`

ระบบสต็อก

| Path | หน้าที่ |
| --- | --- |
| `Stock.tsx` | หน้าหลักรายการสินค้า/วัตถุดิบ |
| `page/StockIn.tsx` | หน้าบันทึกรับสินค้าเข้า |
| `page/StockOut.tsx` | หน้าบันทึกสินค้าออก |
| `context/StockContext.ts` | state/context ของระบบสต็อก |
| `hooks/useStockContex.ts` | hook สำหรับดึง context สต็อก |
| `lib/stockWithRetry.ts` | wrapper เรียก API stock พร้อม refresh token/retry |
| `component/` | UI เฉพาะระบบสต็อก เช่น form product/stock, stock list/status, history dialog, edit dialog, log table และ speed dial |

## Backend: `ServerService/`

Backend แยกเป็น service ย่อยแบบ distributed monolith แต่ละ service มี `package.json`, `package-lock.json`, `Dockerfile`, `tsconfig.json`, `karma.conf.js` และบาง service มี `webpack.config.js` โครงสร้าง service รุ่นใหม่แยกชั้นเป็น `routes`, `controllers`, `services`, `repositories`, `models`, `middlewares`, `utils` และ `database` ชัดเจนขึ้น

ไฟล์ config ที่พบซ้ำใน service:

- `.env` เก็บค่า port, secret, database URL หรือ storage config ของ service นั้น โดยไม่ควรเปิดเผยค่าจริง
- `.env.example` พบในบาง service เพื่อเป็นตัวอย่างค่า environment ที่ต้องตั้ง
- `.dockerignore` พบในบาง service เพื่อคุม Docker build context
- `Dockerfile` ใช้ build image ของ service
- `package.json` ระบุ dependency และ npm scripts ของ service
- `package-lock.json` lock dependency ของ service
- `tsconfig.json` ตั้งค่า TypeScript
- `webpack.config.js` ตั้งค่า bundle backend ในบาง service
- `karma.conf.js` ตั้งค่า test runner

### `ServerService/Service_Login/`

Service สำหรับ authentication และ user management

| Path | หน้าที่ |
| --- | --- |
| `src/index.ts` | Express server หลัก เชื่อม MongoDB, สร้าง default admin และ mount user routes |
| `src/routes/user.routes.ts` | route สำหรับ health, login/logout, refresh token, CRUD user และเปลี่ยนรหัสผ่าน |
| `src/controllers/user.controller.ts` | controller รับ request ของ user/auth แล้วเรียก service |
| `src/services/user.service.ts` | business logic ของ user เช่น login, CRUD user และเปลี่ยนรหัสผ่าน |
| `src/services/token.service.ts` | logic สร้างและตรวจ token/refresh token |
| `src/repositories/user.repo.ts` | data access layer ของ user/profile |
| `src/models/` | Mongoose model/interface ของ profile |
| `src/middlewares/auth.ts` | middleware ตรวจ JWT access token |
| `src/database/mongo.ts` | logic เชื่อม MongoDB |
| `src/config.ts` | อ่านค่าคอนฟิกจาก environment |
| `src/type.ts` | type ของ request/response/token/user |
| `src/enum.ts` | enum เช่น role และ error code |

### `ServerService/Service_Account/`

Service สำหรับบัญชี รายรับรายจ่าย contact และ wallet

| Path | หน้าที่ |
| --- | --- |
| `src/index.ts` | Express server หลักของ account เชื่อม MongoDB/MinIO และ mount endpoint contact, transaction, wallet |
| `src/auth.ts` | middleware ตรวจ JWT access token |
| `src/middlewares/auth.ts` | middleware ตรวจ JWT รุ่นที่ใช้กับ route แบบแยกชั้น |
| `src/config.ts` | อ่านค่าคอนฟิกจาก environment |
| `src/models.ts` | Mongoose model ของ contact, transaction และ wallet |
| `src/models/` | schema/interface แยกไฟล์ของ contact, transaction และ wallet |
| `src/routes/` | route แยกตาม domain ได้แก่ contact, transaction และ wallet |
| `src/controllers/` | controller รับ request แล้วเรียก service ของแต่ละ domain |
| `src/services/` | business logic สำหรับ contact, transaction และ wallet |
| `src/repositories/` | data access layer สำหรับ contact, transaction และ wallet |
| `src/database/mongo.ts` | logic เชื่อม MongoDB |
| `src/utils/` | enum/response helper สำหรับโครงสร้าง service แบบใหม่ |
| `src/response.ts` | helper สร้าง response success/error |
| `src/storage.ts` | logic อัปโหลด/ลบรูปบิลผ่าน MinIO |
| `src/wallet.ts` | logic คำนวณและอัปเดตยอด wallet หลัก |
| `src/type.ts` | type ของ form, transaction, statement และ response |
| `src/enum.ts` | enum ของ role, error และ transaction type |

### `ServerService/Service_Storage/`

Service สำหรับจัดการ MinIO และรูปภาพทั่วไป

| Path | หน้าที่ |
| --- | --- |
| `src/index.ts` | Express server หลัก เชื่อม MinIO, สร้าง bucket และ mount storage routes |
| `src/routes/storage.routes.ts` | route สำหรับ presigned URL, bucket management และ upload/delete image |
| `src/controllers/storage.controller.ts` | controller รับ request งาน storage แล้วเรียก service |
| `src/services/storage.service.ts` | business logic สำหรับ MinIO bucket/image |
| `src/middlewares/auth.ts` | middleware ตรวจ JWT |
| `src/middlewares/upload.ts` | middleware รับไฟล์ upload |
| `src/config.ts` | อ่านค่าคอนฟิกจาก environment |
| `src/utils/` | enum/response helper |
| `src/type.ts` | type ของ endpoint, bucket, image และ response |
| `src/enum.ts` | enum ของ role, error และ transaction type ที่เกี่ยวข้อง |

### `ServerService/Service_Stock/`

Service สำหรับสินค้า วัตถุดิบ สต็อก และ stock log

| Path | หน้าที่ |
| --- | --- |
| `src/index.ts` | Express server หลัก เชื่อม MongoDB/MinIO และ mount product/stock routes |
| `src/routes/product.routes.ts` | route สำหรับ CRUD product พร้อม upload รูป |
| `src/routes/stock.routes.ts` | route สำหรับ stock in/out, log, status และ stock summary |
| `src/controllers/` | controller ของ product และ stock |
| `src/services/stock.service.ts` | business logic ของ stock in/out, status และ log |
| `src/services/storage.service.ts` | logic ติดต่อ MinIO สำหรับรูปสินค้า/หลักฐาน |
| `src/services/transaction.service.ts` | logic ติดต่อ Account service เพื่อบันทึก transaction ที่เกี่ยวข้อง |
| `src/repositories/` | data access layer ของ product และ log |
| `src/models/` | schema/interface ของ product และ stock log |
| `src/database/mongo.ts` | logic เชื่อม MongoDB |
| `src/middlewares/` | middleware auth และ upload |
| `src/config.ts` | อ่านค่าคอนฟิกจาก environment |
| `src/type.ts` | type ของ product, stock form, stock log, status และ response |
| `src/enum.ts` | enum ของ product type, stock status, stock log type, transaction type, role และ error |

### `ServerService/Service_Bill/`

Service สำหรับบิล/order และส่วนลดรายลูกค้า มีโครงสร้างแยกชั้นชัดเจนกว่า service อื่น

| Path | หน้าที่ |
| --- | --- |
| `Report.md` | เอกสาร API guide ของ Service_Bill |
| `tsconfig.spec.json` | TypeScript config สำหรับ test spec |
| `src/index.ts` | entrypoint Express เชื่อม database Account/Bill, สร้าง model และ mount routes `/bill`, `/discount` พร้อม auth |
| `src/database/mongo.ts` | logic เชื่อม MongoDB หลายฐานข้อมูล |
| `src/middlewares/auth.ts` | middleware ตรวจ JWT |
| `src/utils/enum.ts` | enum กลางของ service เช่น error code |
| `src/utils/response.ts` | helper response format ของ service |
| `src/type.ts` | type รวมของ service |
| `src/models/` | schema/interface/enum ของ order, discount และ contact reference |
| `src/repositories/` | data access layer สำหรับ bill, discount และ contact |
| `src/services/` | business logic ของ bill และ discount เช่น validate customer/total/status |
| `src/controllers/` | controller รับ request แล้วเรียก service |
| `src/routes/` | กำหนด route path ของ bill และ discount |
| `tests/` | unit test ของ bill service และ discount service |

Endpoint หลักของ Service_Bill:

- `GET /bill/search`
- `GET /bill/status/count`
- `GET /bill/product/:productID/usage`
- `GET /bill/status/:status`
- `POST /bill`
- `PUT /bill/:orderID`
- `DELETE /bill/:orderID`
- `PATCH /bill/:orderID/next`
- `PATCH /bill/:orderID/billing/income`
- `PATCH /bill/:orderID/billing/debt`
- `GET /bill/:orderID/status`
- `GET /discount/:customerID`
- `PUT /discount/:customerID`

## Deployment และ Infrastructure

| Path | หน้าที่ |
| --- | --- |
| `docker-compose.yml` | รวม container หลักของระบบ: `mongo`, `mongo-express`, `minio`, `service_account`, `service_login`, `service_stock`, `service_bill`, `service_storage`, `web` |
| `Dockerfile` | build frontend image จาก Node แล้วคัดลอกผลลัพธ์ไป Nginx |
| `nginx.conf` | Nginx global config |
| `templates/default.conf.template` | config สำหรับ serve React SPA และ redirect 404 กลับ `index.html` |
| `cert/cert.pem`, `cert/key.pem` | certificate/key สำหรับ local HTTPS หากเปิดใช้ |

หมายเหตุ: `docker-compose.yml` ปัจจุบันประกาศ `service_bill` แล้ว โดยใช้ image `nuttascholar/smartbiz_bill:1.2`, port ภายใน `3004`, และ env `VITE_PORT_BILL` สำหรับ expose ไปยัง frontend

## ความสัมพันธ์ของระบบ

- Frontend เรียก API ผ่านไฟล์ใน `src/API/*`
- `src/lib/axios.ts` สร้าง axios instance สำหรับ login, user, account, storage, stock, bill และ storefront จากค่า `VITE_WEB_BACKEND`/`VITE_PORT_*`
- `Service_Login` ออก access token และ refresh token
- Service อื่นตรวจสิทธิ์ผ่าน JWT `Authorization: Bearer <token>`
- `Service_Account` ใช้ MongoDB สำหรับ contact/transaction/wallet และ MinIO สำหรับรูปบิล
- `Service_Stock` ใช้ MongoDB สำหรับสินค้า/log, MinIO สำหรับรูปสินค้า/บิล stock in และเรียก `Service_Account` เพื่อบันทึก transaction ค่าใช้จ่ายเมื่อรับสินค้าเข้า
- `Service_Bill` ใช้ฐาน `Bill` สำหรับ order/discount, อ้างอิง contact จากฐาน `Account`, อ้างอิง product จากฐาน `Stock` และเปิด API สำหรับนับสถานะ/ตรวจ product usage
- `Service_Storage` เป็น API กลางสำหรับจัดการ bucket/image บน MinIO
- `src/page/*/lib/*WithRetry.ts` เป็น wrapper ที่ช่วย refresh token แล้ว retry เมื่อ access token หมดอายุ

## คำสั่งที่เกี่ยวข้อง

Frontend root:

```bash
npm run dev
npm run dev:storefront
npm run build
npm run build:storefront
npm run lint
npm run preview
npm run preview:storefront
```

Service ย่อย:

```bash
npm install
npm run build
npm test
```

ทั้งระบบผ่าน Docker:

```bash
docker compose up
```

## ตรวจสอบตาม Workflow

คำสั่งหลักที่ใช้เป็นแนวทางสำรวจ:

```powershell
Get-ChildItem -Force
Get-Content .gitignore
git ls-files --cached --others --exclude-standard
Get-Content src\App.tsx
Get-Content src\lib\axios.ts
Get-Content docker-compose.yml
Get-ChildItem ServerService -Directory | Select-Object -ExpandProperty Name
```

ผลลัพธ์รายงานนี้อัปเดตจากโครงสร้างปัจจุบัน รวมถึง `service_bill` ใน Docker Compose, Storefront Vite config, route/frontend page ของ Bill และโครงสร้าง backend service ที่แยกชั้นชัดเจนขึ้น
