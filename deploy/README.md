# SmartBiz Docker Deploy

โฟลเดอร์นี้เป็นชุด Docker Compose สำหรับ deploy SmartBiz โดยแยกจาก `docker-compose.yml` เดิมที่ root project เพื่อไม่ให้กระทบไฟล์ compose หลัก

## ไฟล์สำคัญ

- `compose.yml` - Docker Compose สำหรับ MongoDB, Mongo Express, MinIO, backend services และ frontend
- `.env.example` - ไฟล์ตัวอย่างค่าคอนฟิก
- `.env` - ไฟล์ค่าคอนฟิกจริงสำหรับ deploy ในเครื่องนี้

## Images ที่ใช้

ค่า image ถูกตั้งใน `.env` เพื่อให้เปลี่ยน tag ได้ง่าย:

```env
WEB_IMAGE=nuttascholar/smartbiz_web:1.0
ACCOUNT_IMAGE=nuttascholar/smartbiz_account:2.3
LOGIN_IMAGE=nuttascholar/smartbiz_login:1.1
STOCK_IMAGE=nuttascholar/smartbiz_stock:1.3
BILL_IMAGE=nuttascholar/smartbiz_bill:1.2
STORAGE_IMAGE=nuttascholar/smartbiz_storage:1.1
```

ถ้ามี frontend image version ใหม่ ให้แก้ `WEB_IMAGE` ใน `deploy/.env` แล้วสั่ง pull/up ใหม่

## เริ่ม Deploy

ถ้ายังไม่มี `deploy/.env` ให้สร้างจาก template:

```powershell
Copy-Item deploy\.env.example deploy\.env
notepad deploy\.env
```

เริ่มระบบ:

```powershell
docker compose --env-file deploy\.env -f deploy\compose.yml up -d
```

ตรวจสถานะ:

```powershell
docker compose --env-file deploy\.env -f deploy\compose.yml ps
```

ดู log:

```powershell
docker compose --env-file deploy\.env -f deploy\compose.yml logs -f
```

ดู log เฉพาะ frontend:

```powershell
docker compose --env-file deploy\.env -f deploy\compose.yml logs -f web
```

## URL หลัง Deploy

ค่าปัจจุบันใน `.env.example` เปิด service ตามนี้:

- Frontend: `http://localhost:3030`
- Mongo Express: `http://localhost:8082`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`
- Account Service: `http://localhost:3000`
- Login Service: `http://localhost:3001`
- Storage Service: `http://localhost:3002`
- Stock Service: `http://localhost:3003`
- Bill Service: `http://localhost:3004`

## อัปเดต Image

หลังแก้ tag ใน `deploy/.env` แล้วรัน:

```powershell
docker compose --env-file deploy\.env -f deploy\compose.yml pull
docker compose --env-file deploy\.env -f deploy\compose.yml up -d
```

ถ้าต้องการอัปเดตเฉพาะ frontend:

```powershell
docker compose --env-file deploy\.env -f deploy\compose.yml pull web
docker compose --env-file deploy\.env -f deploy\compose.yml up -d web
```

## หยุดระบบ

หยุด container แต่ยังเก็บ volume ข้อมูลไว้:

```powershell
docker compose --env-file deploy\.env -f deploy\compose.yml down
```

ลบ volume ข้อมูลด้วย ใช้เฉพาะตอนต้องการล้าง database และไฟล์ storage:

```powershell
docker compose --env-file deploy\.env -f deploy\compose.yml down -v
```

## หมายเหตุสำคัญ

- ค่า `VITE_HOST` และ `VITE_PORT_*` ต้องตรงกับค่าที่ใช้ตอน build frontend image เพราะ Vite compile ค่าเหล่านี้เข้า static files แล้ว
- `MINIO_ENDPOINT` ใน container ควรใช้ `minio` ถ้า backend จะเชื่อม MinIO ผ่าน Docker network เดียวกัน
- `MONGO_EXPRESS_PORT` ตั้งเป็น `8082` เพื่อเลี่ยงชนกับ port `8081` ที่อาจถูกใช้อยู่
- เปลี่ยน `SECRET`, `MONGO_PASSWORD`, และ `MINIO_PASSWORD` ก่อนใช้งาน production จริง
- Compose ชุดนี้ใช้ Docker volumes `mongo-data` และ `minio-data` สำหรับเก็บข้อมูลถาวร
