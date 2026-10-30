# SmartBiz

SmartBiz เป็นเว็บแอปจัดการธุรกิจขนาดเล็ก มีหน้า Back Office และ Storefront พัฒนาด้วย React, TypeScript, Vite และ Material UI ส่วน backend แยกตามงานบัญชี ผู้ใช้ ไฟล์ สต็อก บิล และร้านค้า

## ความสามารถหลัก

- จัดการรายรับ รายจ่าย ผู้ติดต่อ และลูกค้า
- จัดการสินค้าและสต็อก ทำรายการขาย ออกบิล และจัดการส่วนลด
- เปิดหน้าร้าน Storefront และรับหลักฐานการชำระเงิน
- จัดเก็บไฟล์ผ่าน MinIO และจัดการผู้ใช้ การเข้าสู่ระบบ และรหัสผ่าน

## เทคโนโลยีที่ใช้

- Frontend: React 18, TypeScript, Vite 6, Material UI 7 และ Axios
- Backend: Node.js services ที่รันเป็น Docker images
- Infrastructure: Docker Compose, MongoDB replica set, MinIO และ Nginx API gateway
- Production: Caddy สำหรับ HTTPS; ดู [คู่มือติดตั้งบน VPS](deploy/online/README.md)

## โครงสร้างบริการสำหรับพัฒนา

ไฟล์ [docker-compose.dev.yml](docker-compose.dev.yml) รัน backend และ infrastructure ส่วนหน้าเว็บรันด้วย Vite บนเครื่องพัฒนา พอร์ตของ backend และ MongoDB ใช้ภายใน Docker network ไม่ได้เปิดตรงสู่ host

| บริการ | พอร์ตภายใน | หน้าที่ |
| --- | ---: | --- |
| `service_account` | 3000 | บัญชี รายรับรายจ่าย และผู้ติดต่อ |
| `service_login` | 3001 | ผู้ใช้และการเข้าสู่ระบบ |
| `service_storage` | 3002 | จัดการไฟล์ผ่าน MinIO |
| `service_stock` | 3003 | สินค้าและสต็อก |
| `service_bill` | 3004 | บิลและรายการขาย |
| `service_storefront` | 3005 | ข้อมูลและคำสั่งซื้อของหน้าร้าน |
| `mongo` | 27017 | ฐานข้อมูลแบบ replica set |
| `minio` | 9000, 9001 | Object storage และ console |
| `api_gateway` | 80 | Nginx ส่งต่อ `/api/*` ไปยัง backend |
| `mongo-express` | 8081 | หน้าเว็บจัดการ MongoDB |

บนเครื่องพัฒนา API gateway เปิดที่ `127.0.0.1:8080`, MinIO API ที่ `127.0.0.1:19000`, MinIO console ที่ `127.0.0.1:19001` และ Mongo Express ที่ `127.0.0.1:18081` (เปลี่ยนพอร์ตหลังสุดได้ด้วย `MONGO_EXPRESS_PORT` ใน `.env.dev`)

## การติดตั้ง

### สิ่งที่ต้องมี

- Node.js 20 ขึ้นไป และ npm
- Docker Engine หรือ Docker Desktop พร้อม Compose v2
- Git สำหรับ clone โปรเจกต์

### ขั้นตอนสำหรับพัฒนา

1. Clone โปรเจกต์และติดตั้ง dependencies

   ```sh
   git clone https://github.com/NuttaScholar/SmartBiz.git
   cd SmartBiz
   npm ci
   ```

2. สร้าง `.env.dev` สำหรับ Compose จากสคริปต์ ซึ่งสุ่มรหัสผ่าน MongoDB แยกตาม service รวมถึง secrets ของแอปและ MinIO

   ```sh
   npm run setup:dev-env
   ```

   สคริปต์จะไม่เขียนทับ `.env.dev` ที่มีอยู่แล้ว เก็บไฟล์นี้ไว้ในเครื่องและอย่า commit หากต้องการเปลี่ยน credentials ของฐานข้อมูลที่มี volume เดิม ต้องเปลี่ยนรหัสผ่านใน MongoDB ให้ตรงกันด้วย

3. สร้าง `.env` สำหรับ Vite โดยใช้ค่าต่อไปนี้ (ไฟล์นี้แยกจาก `.env.dev`)

   ```dotenv
   VITE_WEB_BACKEND=http://localhost:3030
   VITE_WEB_SHOP=http://localhost:4030
   ```

   คำขอ `/api/*` ใช้ origin ของหน้าเว็บและ Vite proxy ไปยัง gateway ที่ `127.0.0.1:8080` จึงไม่ต้องตั้ง `VITE_API_GATEWAY_URL` สำหรับการพัฒนาบนเครื่องเดียวกัน หากมีค่าเก่าค้างอยู่ใน `.env` ให้ลบหรือเว้นว่างค่านี้

4. เริ่ม backend และ infrastructure

   ```sh
   npm run dev:services
   ```

   คำสั่งนี้ใช้ `docker-compose.dev.yml` กับ `.env.dev` และรอ healthcheck หากต้องการตรวจสถานะหรือดู log:

   ```sh
   docker compose -p smartbiz-dev --env-file .env.dev -f docker-compose.dev.yml ps -a
   docker compose -p smartbiz-dev --env-file .env.dev -f docker-compose.dev.yml logs -f
   ```

5. รันหน้าเว็บใน terminal แยกกัน

   ```sh
   npm run dev
   npm run dev:storefront
   ```

   เปิด Back Office ที่ `http://localhost:3030` และ Storefront ที่ `http://localhost:4030` หรือ `http://localhost:3030/storefront` เมื่อเลิกใช้งาน หยุด Vite ด้วย Ctrl+C แล้วรัน `npm run dev:services:down` เพื่อหยุด containers โดยเก็บ volumes ข้อมูลไว้

## การรันแบบ Production

ดาวน์โหลดและแตกไฟล์แพ็กเกจจาก [Releases](https://github.com/NuttaScholar/SmartBiz/releases) แล้วเลือกรูปแบบการติดตั้ง:

- **Online (VPS):** ใช้โดเมนสาธารณะและ HTTPS ผ่าน Caddy เริ่มที่ `Online/README.md` ซึ่งอธิบายการตั้งค่า DNS, การ build หน้าเว็บใน `Online/CreateWeb/`, การเตรียมค่าระบบ และการรัน Docker Compose จาก `Online/App/`
- **Home (เครือข่ายภายใน):** ใช้ IP ของเครื่องใน LAN และ HTTP เริ่มที่ `Home/README.md` ซึ่งอธิบายการ build หน้าเว็บใน `Home/CreateWeb/` และการรัน Docker Compose จาก `Home/App/` โดยต้องเตรียม backend Docker images ตามที่คู่มือระบุ

ทั้งสองรูปแบบต้อง build หน้าเว็บและคัดลอกผลลัพธ์ไปยัง `App/dist/` ก่อนเริ่มระบบ อ่านข้อกำหนดและคำเตือนเรื่องไฟล์ `.env`, Docker volumes และการย้ายข้อมูลเดิมใน README ของรูปแบบที่เลือกก่อนติดตั้งหรืออัปเดต

## คำสั่งตรวจสอบ

```sh
npm run lint
npm run build
npm run build:storefront
docker compose -p smartbiz-dev --env-file .env.dev -f docker-compose.dev.yml config --quiet
```

`npm run build` ตรวจ TypeScript และ build หน้า Back Office พร้อม Storefront ส่วน `npm run build:storefront` build เฉพาะ Storefront คำสั่งตรวจ Compose ต้องมี `.env.dev` ก่อนและ `--quiet` ช่วยไม่แสดงค่า secrets ที่ถูกแทนลงใน config

## หมายเหตุการใช้งาน

- Backend ในชุด dev ใช้ images จาก Docker Hub ตาม tag ใน `docker-compose.dev.yml`; การแก้ source ใน `ServerService` ไม่ทำให้ containers ที่กำลังรัน rebuild อัตโนมัติ
- หากแก้ค่า `.env` ของ Vite ให้ restart dev server หากแก้ `.env.dev` ให้ recreate services ที่เกี่ยวข้อง
- พอร์ตที่ Compose เปิดบน host ผูกกับ loopback (`127.0.0.1`) จึงใช้จากเครื่องอื่นใน LAN โดยตรงไม่ได้
- ตรวจ gateway ได้ที่ `http://localhost:8080/gateway/health` และเปิด MinIO console ที่ `http://localhost:19001` หรือ Mongo Express ที่ `http://localhost:18081`
