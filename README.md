# SmartBiz

SmartBiz เป็นเว็บแอปสำหรับทดลองพัฒนาระบบจัดการธุรกิจขนาดเล็กด้วย React, TypeScript, Vite และ Material UI โดยฝั่ง backend แยก service ตามโดเมนงาน เช่น บัญชี ผู้ใช้ สต็อก บิล และพื้นที่จัดเก็บไฟล์ ระบบโดยรวมรันร่วมกันผ่าน Docker Compose

## ความสามารถหลัก

- ระบบบัญชีรายรับ-รายจ่าย
- ระบบจัดการข้อมูลผู้ติดต่อและลูกค้า
- ระบบจัดการสต็อกสินค้า
- ระบบทำรายการซื้อขายและออกบิล
- ระบบจัดเก็บไฟล์ผ่าน MinIO
- ระบบผู้ใช้ เข้าสู่ระบบ และเปลี่ยนรหัสผ่าน

## เทคโนโลยีที่ใช้

- React 18
- TypeScript
- Vite
- Material UI
- Axios
- Docker Compose
- MongoDB
- MinIO
- Nginx

## โครงสร้าง Service

| Service | Port | หน้าที่ |
| --- | ---: | --- |
| `web` | 3030 | เสิร์ฟ frontend จากโฟลเดอร์ `dist` ผ่าน Nginx |
| `service_account` | 3000 | ข้อมูลบัญชี รายรับ-รายจ่าย และผู้ติดต่อ |
| `service_login` | 3001 | เข้าสู่ระบบ จัดการ token และผู้ใช้ |
| `service_storage` | 3002 | จัดการไฟล์ผ่าน MinIO |
| `service_stock` | 3003 | จัดการสินค้าและสต็อก |
| `service_bill` | 3004 | จัดการบิล รายการขาย และส่วนลด |
| `mongo` | 27017 | ฐานข้อมูล MongoDB ภายใน Docker network |
| `mongo-express` | 8081 | หน้าเว็บจัดการ MongoDB |
| `minio` | 9000, 9001 | Object storage และหน้า console |

## การติดตั้ง

### สิ่งที่ต้องมี

- Node.js 20 ขึ้นไป
- Docker Desktop
- Git

### ขั้นตอนสำหรับพัฒนา

1. Clone โปรเจค

```bash
git clone https://github.com/NuttaScholar/SmartBiz.git
cd SmartBiz
```

2. ติดตั้ง dependency

```bash
npm install
```

3. ตรวจสอบหรือสร้างไฟล์ `.env`

```env
SECRET="NuttaScholar"
SERVICE_AUTH_SECRET="<random-secret-at-least-32-characters>"

VITE_HOST=localhost
VITE_PORT=3030
VITE_PORT_ACCESS=3000
VITE_PORT_LOGIN=3001
VITE_PORT_STORE=3002
VITE_PORT_STOCK=3003
VITE_PORT_BILL=3004
VITE_PORT_STOREFRONT=3005
VITE_PORT_MINIO=9000

MINIO_ENDPOINT=localhost
MINIO_USER=admin
MINIO_PASSWORD=StrongPass123!
```

ถ้ารันให้เครื่องอื่นในวง LAN ใช้งาน ให้เปลี่ยน `VITE_HOST` และ `MINIO_ENDPOINT` เป็น IP ของเครื่องที่รัน service

4. เปิด backend และ infrastructure

```bash
docker compose up -d
```

5. รัน frontend สำหรับพัฒนา

```bash
npm run dev
```

เปิดเว็บที่ `http://localhost:3030`

## การรันแบบ Production ด้วย Docker

Production deploy ใช้ชุดไฟล์ Release asset `SmartBizV0_3` ที่จะแนบไว้ในหน้า GitHub Releases เมื่อแตกไฟล์แล้วจะได้โครงสร้างหลักดังนี้:

```text
SmartBizV0_3/
  App/
    docker-compose.yml
    .env
    nginx.conf
    templates/
    dist/
  CreateWeb/
    .env.production
    package.json
    package-lock.json
    src/
    public/
    Dockerfile
    nginx.conf
    templates/
```

โฟลเดอร์ `App` คือชุดสำหรับรันระบบจริงด้วย Docker Compose ส่วน `CreateWeb` คือชุด source frontend สำหรับ build `dist` ใหม่เมื่อเปลี่ยนค่า endpoint เช่น `VITE_HOST`

1. ดาวน์โหลด Release asset จากหน้า GitHub Releases แล้วแตกไฟล์ เช่น:

```text
E:\Releases\SmartBiz\ReleaseVersion\SmartBizV0_3
```

2. แก้ค่า config ใน `App\.env` ให้ตรงกับเครื่องหรือ server ที่ deploy

```powershell
notepad ./App/.env
```

ค่าที่ควรตรวจเป็นพิเศษ:

- `VITE_HOST` - host หรือ IP ที่ browser ของผู้ใช้จะเรียก backend services
- `VITE_PORT` - port ของ frontend web เช่น `3030`
- `VITE_PORT_ACCESS`, `VITE_PORT_LOGIN`, `VITE_PORT_STORE`, `VITE_PORT_STOCK`, `VITE_PORT_BILL`, `VITE_PORT_STOREFRONT`, `VITE_PORT_MINIO`, `MONGO_EXPRESS_PORT`, `MINIO_CONSOLE_PORT` - port ที่เปิดออกจาก Docker Compose
- `MINIO_ENDPOINT` - IP  ที่ backend ใช้ติดต่อ MinIO
- `SECRET`, `MINIO_USER`, `MINIO_PASSWORD`, `MONGO_EXPRESS_USERNAME`, `MONGO_EXPRESS_PASSWORD` - ควรเปลี่ยนก่อนใช้งาน production จริง

หมายเหตุ: frontend ใน `App\dist` ถูก build มากับค่า `VITE_*` แล้ว ถ้าเปลี่ยน `VITE_HOST` หรือ `VITE_PORT_*` หลังแตกไฟล์ ควร build frontend ใหม่จาก `CreateWeb` แล้วคัดลอก `dist` กลับไปที่ `App`

3. เริ่มระบบจากโฟลเดอร์ `App`

```powershell
cd App
docker compose --env-file .env -f docker-compose.yml up -d
```

4. เปิดเว็บตามค่าใน `App\.env` ค่าเริ่มต้นคือ:

```text
http://localhost:3030
```
 
5. เข้าสู่ระบบด้วยบัญชีเริ่มต้น
```text
Username: admin@default.com 
Password: Default
```
Service อื่นที่เปิดตามค่าเริ่มต้น:

- Mongo Express: `http://localhost:8081`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`
- Account Service: `http://localhost:3000`
- Login Service: `http://localhost:3001`
- Storage Service: `http://localhost:3002`
- Stock Service: `http://localhost:3003`
- Bill Service: `http://localhost:3004`

ตรวจสถานะ container:

```powershell
docker compose --env-file .env -f docker-compose.yml ps
```

ดู log:

```powershell
docker compose --env-file .env -f docker-compose.yml logs -f
```

หยุดระบบโดยยังเก็บ volume ข้อมูลไว้:

```powershell
docker compose --env-file .env -f docker-compose.yml down
```

ถ้าต้องการลบ volume ฐานข้อมูลและไฟล์ storage ด้วย:

```powershell
docker compose --env-file .env -f docker-compose.yml down -v
```

### Build Frontend ใหม่จาก CreateWeb

ใช้ขั้นตอนนี้เมื่อมีการเปลี่ยนค่า endpoint ของ frontend เช่น `VITE_HOST` หรือ port ของ service ต่าง ๆ

1. แก้ค่าใน `CreateWeb\.env.production` ให้ตรงกับ `App\.env`

```powershell
cd CreateWeb
notepad .env.production
```

2. Build frontend ใหม่

```powershell
npm ci
npm run build
```

3. คัดลอกผลลัพธ์ `dist` ไปให้ `App` ใช้งาน

```powershell
Remove-Item "../App/dist" -Recurse -Force
Copy-Item "dist" "../App/dist" -Recurse
```

4. Restart web container

```powershell
cd ../App
docker compose --env-file .env -f docker-compose.yml up -d
```

## คำสั่งทดสอบ

ตรวจ lint:

```bash
npm run lint
```

ตรวจ TypeScript และ build frontend:

```bash
npm run build
```

preview ไฟล์หลัง build:

```bash
npm run preview -- --host 0.0.0.0
```

ตรวจ Docker Compose config:

```bash
docker compose config
```

## ผลการทดสอบล่าสุด

ทดสอบเมื่อวันที่ 2026-06-06 ใน workspace นี้

| รายการ | ผลลัพธ์ |
| --- | --- |
| `npm run lint` | ผ่าน ไม่มี error และไม่มี warning |
| `npm run build` | ผ่าน ตรวจ TypeScript และสร้างไฟล์ใน `dist` ได้ |
| `npm run preview -- --host 0.0.0.0` | ผ่าน หน้าเว็บตอบกลับ `HTTP 200`; ถ้า port `3030` ถูกใช้อยู่ Vite จะขยับไป port ถัดไป เช่น `3031` |
| `docker compose config` | ผ่าน อ่านค่า `.env` และ render compose config ได้ |
| `docker compose ps` | backend หลักทำงานอยู่ ได้แก่ MongoDB, MinIO, account, login, storage, stock และ bill |
| `docker compose ps -a` | พบว่า `web` และ `mongo-express` อยู่สถานะ exited ใน workspace ปัจจุบัน หากต้องการใช้สอง service นี้ให้สั่ง `docker compose up -d web mongo-express` |
| `npm ls @toolpad/core @mui/x-data-grid @mui/material` | ผ่าน ไม่พบ `@toolpad/core` และ `@mui/x-data-grid` แล้ว; ยังมี `@mui/material` เพราะ frontend ใช้งานจริง |
| `npm audit --audit-level=moderate` | พบ 14 vulnerabilities แบ่งเป็น 7 moderate และ 7 high; ยังไม่ได้รัน `npm audit fix` เพราะอาจอัปเดต dependency หลายตัว |

หมายเหตุ: ระหว่าง `npm run build` มี warning จาก dependency ใน `node_modules` เรื่อง directive `"use client"` ของ MUI แต่ build สำเร็จและไม่ใช่ warning จาก lint ของโค้ดใน `src`

## หมายเหตุการใช้งาน

- Frontend อ่าน endpoint จากตัวแปร `VITE_HOST` และ port ต่าง ๆ ใน `.env`
- ถ้าเปลี่ยนค่า `.env` ต้อง restart dev server หรือ build ใหม่
- `docker-compose.yml` ใช้ subnet `192.168.110.0/24` สำหรับ private network ของ service ภายใน
- MinIO console เปิดได้ที่ `http://localhost:9001`
- Mongo Express เปิดได้ที่ `http://localhost:8081` เมื่อ container `mongo-express` ถูกเปิดใช้งาน
