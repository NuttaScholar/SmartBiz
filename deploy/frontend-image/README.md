# SmartBiz Compose With Frontend Image

ชุดนี้เป็น Docker Compose แยกจาก `docker-compose.yml` เดิมที่ root project โดยใช้ frontend image:

```text
nuttascholar/smartbiz_web
```

## วิธีใช้งาน

```powershell
Copy-Item deploy\frontend-image\.env.example deploy\frontend-image\.env
notepad deploy\frontend-image\.env
docker compose --env-file deploy\frontend-image\.env -f deploy\frontend-image\compose.yml up -d
```

ดูสถานะและ log:

```powershell
docker compose --env-file deploy\frontend-image\.env -f deploy\frontend-image\compose.yml ps
docker compose --env-file deploy\frontend-image\.env -f deploy\frontend-image\compose.yml logs -f
```

หยุดระบบ:

```powershell
docker compose --env-file deploy\frontend-image\.env -f deploy\frontend-image\compose.yml down
```

## หมายเหตุ

- ค่า `VITE_HOST` และ `VITE_PORT_*` ต้องตรงกับค่าที่ใช้ตอน build frontend image เพราะ Vite compile ค่าเหล่านี้เข้าไฟล์ static แล้ว
- Compose ชุดนี้ไม่แก้ไฟล์ `docker-compose.yml` เดิม
