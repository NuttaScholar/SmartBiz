# คู่มืออัปเดต SmartBiz จาก V0.3

คู่มือนี้อธิบายการอัปเดตระบบ SmartBiz จาก `V0.3` มาใช้ `docker-compose.yml` รุ่นปัจจุบัน โดยเก็บข้อมูล MongoDB และไฟล์ใน MinIO เดิมไว้

> ควรทดลองขั้นตอนทั้งหมดกับข้อมูลสำรองก่อนดำเนินการบนระบบจริง และห้ามใช้ `docker compose down -v` เพราะตัวเลือก `-v` จะลบ named volumes

## ความแตกต่างที่มีผลต่อการอัปเดต

`docker-compose.yml` ใน `V0.3` มีลักษณะสำคัญดังนี้:

- MongoDB ใช้บัญชีผู้ดูแล `root` และรหัสผ่านเริ่มต้น `example`
- MongoDB ทำงานแบบ standalone และยังไม่ได้เปิด replica set
- MongoDB image ไม่ได้ระบุเวอร์ชันตายตัว
- Backend ทุก service ใช้บัญชี MongoDB ผู้ดูแลร่วมกัน
- มี named volumes ชื่อ `mongo-data` และ `minio-data`

Compose รุ่นปัจจุบันเปลี่ยนเป็น:

- MongoDB `8.0.5` ตามค่าเริ่มต้น
- MongoDB replica set ชื่อ `rs0`
- ใช้ keyfile สำหรับยืนยันตัวตนภายใน replica set
- สร้างผู้ใช้ MongoDB และรหัสผ่านแยกสำหรับแต่ละ service
- เพิ่ม Caddy, Storefront และ named volumes สำหรับ Caddy
- Backend images ใช้ `pull_policy: missing` จึงใช้ image ในเครื่องก่อน และดึง tag ที่ขาดจาก Docker Hub ได้

## 1. ตรวจชื่อ Compose project เดิม

ทำขั้นตอนนี้ขณะที่ระบบ V0.3 ยังอยู่:

```powershell
docker inspect database --format '{{ index .Config.Labels "com.docker.compose.project" }}'
```

สมมติว่าคำสั่งแสดงค่า:

```text
app
```

named volumes เดิมจะมีชื่อคล้าย:

```text
app_mongo-data
app_minio-data
```

ตรวจสอบได้ด้วย:

```powershell
docker volume ls
```

ตัวอย่างทั้งหมดในคู่มือนี้ใช้ Compose project ชื่อ `app` หากระบบเดิมแสดงชื่ออื่น ให้แทน `app` ด้วยชื่อนั้นทุกจุด

ต้องระบุชื่อเดิมในทุกคำสั่งของ Compose รุ่นใหม่:

```powershell
docker compose -p app --env-file .env.vps <COMMAND>
```

หากใช้ชื่อ project ไม่ตรงกับระบบเดิม Compose จะสร้าง volumes ชุดใหม่ ทำให้ระบบเปิดขึ้นมาโดยไม่พบข้อมูลเดิม

## 2. ตรวจเวอร์ชัน MongoDB เดิม

```powershell
docker exec database mongod --version
```

บันทึกเวอร์ชันและเก็บผลลัพธ์ไว้กับข้อมูลสำรอง เนื่องจาก V0.3 ใช้ image `mongo` โดยไม่ล็อก tag แต่ Compose รุ่นปัจจุบันใช้ MongoDB `8.0.5`

ห้ามนำ volume จาก MongoDB รุ่นเก่ามากไปเปิดด้วย MongoDB 8 โดยตรง ลำดับการอัปเกรด major version ต้องเป็นไปตามข้อกำหนดของ MongoDB ตัวอย่างเช่น:

```text
MongoDB 6.x → MongoDB 7.x → ตั้ง FCV 7.0 → MongoDB 8.0
MongoDB 7.x → ตั้ง FCV 7.0 → MongoDB 8.0
MongoDB 8.x → ใช้ Compose รุ่นปัจจุบันต่อได้
```

หากไม่ทราบประวัติการอัปเกรดหรือไม่แน่ใจเรื่อง Feature Compatibility Version (FCV) ให้สร้าง MongoDB 8 ชุดใหม่ใน project สำหรับทดสอบ แล้วนำข้อมูลกลับด้วย `mongorestore` แทนการเปิด volume เดิมด้วย MongoDB 8 ทันที

## 3. สำรอง MongoDB แบบ logical

V0.3 กำหนดบัญชีเริ่มต้นเป็น `root/example` หากเคยเปลี่ยนรหัสผ่านแล้ว ต้องใช้ค่าที่ใช้งานจริง

```powershell
docker exec database mongodump `
  --username root `
  --password example `
  --authenticationDatabase admin `
  --archive=/tmp/smartbiz-v03.archive `
  --gzip
```

คัดลอกไฟล์สำรองออกจาก container:

```powershell
docker cp database:/tmp/smartbiz-v03.archive .\smartbiz-v03.archive
```

ตรวจสอบไฟล์:

```powershell
Get-Item .\smartbiz-v03.archive
```

เก็บไฟล์นี้ไว้นอกเครื่อง VPS อีกหนึ่งชุดและทดลอง restore ก่อนอัปเดตระบบจริง

## 4. หยุด V0.3 และสำรอง named volumes

หยุดระบบโดยเก็บ volumes ไว้:

```powershell
docker compose -p app down
```

สำรอง MongoDB volume:

```powershell
docker run --rm `
  -v app_mongo-data:/source:ro `
  -v "${PWD}:/backup" `
  alpine:3.20 `
  tar czf /backup/mongo-data-v03.tgz -C /source .
```

สำรอง MinIO volume:

```powershell
docker run --rm `
  -v app_minio-data:/source:ro `
  -v "${PWD}:/backup" `
  alpine:3.20 `
  tar czf /backup/minio-data-v03.tgz -C /source .
```

ตรวจสอบไฟล์สำรอง:

```powershell
Get-Item .\mongo-data-v03.tgz, .\minio-data-v03.tgz
```

การสำรอง volume ต้องทำหลังหยุด MongoDB และ MinIO แล้ว เพื่อไม่ให้ไฟล์เปลี่ยนระหว่างการบีบอัด

## 5. เตรียมไฟล์สำหรับรุ่นใหม่

ชุดติดตั้งต้องมีไฟล์และโฟลเดอร์อย่างน้อยดังนี้:

```text
docker-compose.yml
.env.vps
nginx.conf
templates/
dist/
deploy/Caddyfile
deploy/mongo-health.js
deploy/mongo-replica-init.js
deploy/mongo-users.js
```

ไม่จำเป็นต้องคัดลอก source code ใน `ServerService` ไปยัง VPS

## 6. เตรียม `.env.vps`

ระหว่างเริ่ม migration ต้องกำหนด MongoDB administrator credentials ให้ตรงกับฐานข้อมูล V0.3 เดิม:

```env
MONGO_VERSION=8.0.5
MONGO_ROOT_USER=root
MONGO_ROOT_PASSWORD=example
```

หากเคยเปลี่ยนบัญชีหรือรหัสผ่านแล้ว ให้ใช้ค่าปัจจุบันแทนค่าตัวอย่าง

MinIO ต้องใช้ credentials เดิมจาก V0.3:

```env
MINIO_USER=<ชื่อผู้ใช้เดิม>
MINIO_PASSWORD=<รหัสผ่านเดิม>
```

สามารถสร้างรหัสผ่านใหม่สำหรับผู้ใช้ MongoDB ของแต่ละ service ได้:

```env
MONGO_ACCOUNT_PASSWORD=<รหัสผ่านใหม่>
MONGO_LOGIN_PASSWORD=<รหัสผ่านใหม่>
MONGO_STOCK_PASSWORD=<รหัสผ่านใหม่>
MONGO_BILL_PASSWORD=<รหัสผ่านใหม่>
MONGO_STOREFRONT_PASSWORD=<รหัสผ่านใหม่>
```

กำหนดค่าอื่นให้ครบตาม `deploy/vps.env.example` โดยเฉพาะโดเมน, `ACME_EMAIL`, `SECRET` และ `SERVICE_AUTH_SECRET`

การเปลี่ยน `MONGO_ROOT_PASSWORD` ใน `.env.vps` อย่างเดียวไม่ได้เปลี่ยนรหัสผ่านที่บันทึกอยู่ในฐานข้อมูลเดิม

## 7. ดึง Docker images

Compose รุ่นปัจจุบันกำหนด `pull_policy: missing` ให้ backend จึงใช้ image ที่มี tag ตรงกันในเครื่อง และดึงจาก Docker Hub เฉพาะ tag ที่ยังไม่มี

ตรวจสอบและดึงเฉพาะ images ที่ขาด:

```powershell
docker compose -p app --env-file .env.vps pull --policy missing
```

ตรวจสอบรายการ:

```powershell
docker image ls --format '{{.Repository}}:{{.Tag}}' |
  Select-String 'smartbiz_'
```

Backend images ที่ Compose ต้องตรวจสอบ ได้แก่:

```text
nuttascholar/smartbiz_account:2.4
nuttascholar/smartbiz_login:1.2
nuttascholar/smartbiz_stock:1.4
nuttascholar/smartbiz_bill:1.3
nuttascholar/smartbiz_storage:1.2
nuttascholar/smartbiz_storefront:1.1
```

## 8. ตรวจสอบ Compose configuration

```powershell
docker compose -p app --env-file .env.vps config --quiet
```

ถ้าไม่มีข้อความ error แสดงว่าตัวแปรที่ Compose ต้องใช้มีครบ

ตรวจสอบว่า Compose จะใช้ volumes เดิม:

```powershell
docker compose -p app --env-file .env.vps config --volumes
```

## 9. เปิด MongoDB

ขั้นตอนนี้ใช้ได้เมื่อยืนยันแล้วว่า MongoDB เดิมสามารถอัปเกรดเป็นเวอร์ชันที่กำหนดใน `.env.vps` ได้

```powershell
docker compose -p app --env-file .env.vps up -d mongo-keyfile-init mongo
```

ตรวจสอบสถานะและ log:

```powershell
docker compose -p app --env-file .env.vps ps
docker compose -p app --env-file .env.vps logs --tail 100 mongo
```

MongoDB ต้องเป็น `healthy` ก่อนดำเนินการต่อ หากเป็น `unhealthy` ห้ามลบ volume ให้ตรวจสอบเวอร์ชัน MongoDB และค่า `MONGO_ROOT_USER`/`MONGO_ROOT_PASSWORD` ก่อน

## 10. เริ่ม replica set

```powershell
docker compose -p app --env-file .env.vps up mongo-replica-init
```

งานนี้ควรจบด้วย exit code `0` ตรวจสอบด้วย:

```powershell
docker compose -p app --env-file .env.vps ps -a mongo-replica-init
docker compose -p app --env-file .env.vps logs mongo-replica-init
```

## 11. สร้างผู้ใช้ MongoDB สำหรับแต่ละ service

```powershell
docker compose -p app --env-file .env.vps run --rm mongo-users-init
```

สคริปต์จะสร้างหรืออัปเดตผู้ใช้ต่อไปนี้โดยไม่ลบข้อมูลในฐานข้อมูลเดิม:

```text
smartbiz_account
smartbiz_login
smartbiz_stock
smartbiz_bill
smartbiz_storefront
```

รหัสผ่านจะมาจาก `.env.vps` และต้องเก็บไฟล์นี้ไว้เพื่อใช้ในการอัปเดตครั้งถัดไป

## 12. เปิดระบบทั้งหมด

```powershell
docker compose -p app --env-file .env.vps up -d
```

ตรวจสอบทุก container:

```powershell
docker compose -p app --env-file .env.vps ps -a
```

สถานะที่คาดหวัง:

- `mongo`, `minio`, backend services และ `web_gateway` เป็น `Up` หรือ `healthy`
- `edge` เป็น `Up`
- `mongo-keyfile-init` เป็น `Exited (0)`
- `mongo-replica-init` เป็น `Exited (0)`
- `mongo-users-init` เป็น `Exited (0)`

Initialization containers ที่เป็น `Exited (0)` ถือว่าทำงานสำเร็จ ไม่ใช่ข้อผิดพลาด

## 13. ทดสอบหลังอัปเดต

ตรวจ HTTP redirect:

```powershell
curl.exe -I http://<STOREFRONT_DOMAIN>/
```

ควรได้รับ `308 Permanent Redirect` ไปยัง HTTPS

ตรวจ HTTPS:

```powershell
curl.exe -I https://<STOREFRONT_DOMAIN>/
curl.exe -I https://<ADMIN_DOMAIN>/
```

จากนั้นทดสอบธุรกรรมจริงอย่างน้อยดังนี้:

1. เข้าสู่ระบบด้วยผู้ใช้เดิม
2. เปิดข้อมูลบัญชี สต็อก และบิลเดิม
3. สร้างและแก้ไขข้อมูลทดสอบ
4. เปิดรูปเดิมจาก MinIO
5. อัปโหลดและดาวน์โหลดไฟล์ใหม่
6. ทดสอบ Storefront และสร้างคำสั่งซื้อ
7. ตรวจสอบ certificate ของทั้งสามโดเมน

ดู log เมื่อ service ไม่ healthy:

```powershell
docker compose -p app --env-file .env.vps logs --tail 100 mongo
docker compose -p app --env-file .env.vps logs --tail 100 mongo-replica-init
docker compose -p app --env-file .env.vps logs --tail 100 mongo-users-init
docker compose -p app --env-file .env.vps logs --tail 100 <SERVICE_NAME>
```

## ปัญหาที่พบจากการทดลองอัปเดตจริง

การทดลองใช้ข้อมูล V0.3 เดิมกับชุดไฟล์ปัจจุบันพบปัญหาต่อไปนี้

### 1. MongoDB เป็น `unhealthy` หลังเปลี่ยนมาใช้ Compose ใหม่

อาการ:

```text
database ... Up (unhealthy)
UserNotFound: Could not find user "smartbiz_root" for db "admin"
```

สาเหตุคือ `.env.vps` ที่สร้างใหม่กำหนดผู้ดูแลเป็น `smartbiz_root` และสร้างรหัสผ่านแบบสุ่ม แต่ volume ของ V0.3 มีบัญชีผู้ดูแลเดิมชื่อ `root` รหัสผ่านเริ่มต้น `example` การกำหนด environment variables ใหม่ไม่สร้างหรือเปลี่ยนผู้ใช้ใน volume ที่มีข้อมูลอยู่แล้ว

แนวทางแก้:

1. กำหนด `MONGO_ROOT_USER` และ `MONGO_ROOT_PASSWORD` ใน `.env.vps` ให้ตรงกับ credentials ที่มีอยู่จริงชั่วคราว
2. เริ่ม MongoDB และทำ replica/user initialization ให้เสร็จ
3. เปลี่ยนรหัสผ่านของผู้ใช้ `root` ภายใน MongoDB ผ่านการเชื่อมต่อที่ยืนยันตัวตนแล้ว
4. แก้ `.env.vps` ให้เป็นรหัสใหม่ค่าเดียวกัน
5. Recreate MongoDB เพื่อให้ healthcheck ใช้ credentials ใหม่

#### วิธีเปลี่ยนรหัสผ่าน `root` ผ่านการเชื่อมต่อที่ยืนยันตัวตน

เปิด `mongosh` ภายใน MongoDB container โดยระบุ `--password` แต่ไม่ใส่ค่ารหัสผ่านต่อท้าย เพื่อให้ระบบถามรหัสเดิมแบบ interactive และไม่บันทึกรหัสลงใน shell history:

```powershell
docker exec -it database mongosh `
  --host 127.0.0.1:27017 `
  --username root `
  --password `
  --authenticationDatabase admin
```

เมื่อข้อความ `Enter password:` ปรากฏ ให้ป้อนรหัสผ่านเดิมของ `root` ตัวอักษรที่พิมพ์จะไม่แสดงบนหน้าจอ เมื่อเข้าสู่ `mongosh` สำเร็จ ให้เลือกฐานข้อมูล `admin`:

```javascript
use admin
```

สั่งเปลี่ยนรหัสผ่านโดยใช้ `passwordPrompt()`:

```javascript
db.changeUserPassword("root", passwordPrompt())
```

เมื่อข้อความ `Enter password` ปรากฏอีกครั้ง ให้ป้อนรหัสผ่านใหม่ คำสั่งที่สำเร็จจะไม่แสดง error จากนั้นออกจาก `mongosh`:

```javascript
exit
```

ใช้รหัสผ่านที่ประกอบด้วย ASCII ซึ่งบันทึกในไฟล์ env ได้อย่างปลอดภัย เช่น ตัวอักษรอังกฤษและตัวเลข หลีกเลี่ยงช่องว่างพิเศษ, zero-width character, emoji และ Unicode ที่คัดลอกจากโปรแกรมจัดรูปแบบ เพราะ MongoDB อาจปฏิเสธด้วยข้อผิดพลาด:

```text
Error preflighting normalization: U_STRINGPREP_PROHIBITED_ERROR
```

แก้ `.env.vps` ให้ตรงกับบัญชีและรหัสผ่านใหม่ทันที:

```env
MONGO_ROOT_USER=root
MONGO_ROOT_PASSWORD=<รหัสผ่านใหม่>
```

อย่าใส่วงเล็บ `<` และ `>` ลงในค่าจริง และหากรหัสผ่านมี `$` ต้องระวังการแทนค่าของ Compose การใช้รหัสแบบ hexadecimal ช่วยหลีกเลี่ยงปัญหานี้ได้

Recreate MongoDB เพื่อให้ environment และ healthcheck โหลดค่าใหม่:

```powershell
docker compose -p app --env-file .env.vps up -d --force-recreate mongo
```

รอจน MongoDB เป็น `healthy`:

```powershell
docker compose -p app --env-file .env.vps ps mongo
```

ยืนยันว่ารหัสใหม่ใช้เข้าสู่ระบบได้ โดยคำสั่งจะถามรหัสผ่านแบบ interactive:

```powershell
docker exec -it database mongosh `
  --host 127.0.0.1:27017 `
  --username root `
  --password `
  --authenticationDatabase admin `
  --eval "db.adminCommand({ping: 1})"
```

ผลลัพธ์ต้องมี `ok: 1` หากเปิด Mongo Express อยู่ ให้ recreate service เพื่อให้โหลด credentials ใหม่ด้วย:

```powershell
docker compose -p app --env-file .env.vps --profile admin up -d --force-recreate mongo-express
```

ไม่ควรแก้ collection `admin.system.users` โดยตรงผ่าน Mongo Express เพราะ MongoDB ต้องสร้าง SCRAM credentials ผ่านคำสั่งจัดการผู้ใช้

ห้ามแก้ปัญหานี้ด้วยการลบ `app_mongo-data`

### 2. MongoDB ไม่มี primary และ initialization containers เริ่มไม่ได้

อาการใน log:

```text
No primary exists currently
node is not in primary or recovering state
Collection [local.oplog.rs] not found
```

สาเหตุคือ V0.3 ทำงานแบบ standalone แต่ Compose ใหม่เริ่ม `mongod` ด้วย `--replSet rs0` ขณะที่ข้อมูลเดิมยังไม่มี replica set configuration จึงยังไม่สามารถเลือก primary ได้ Backend และ `mongo-users-init` ที่ต้องเชื่อมต่อผ่าน `replicaSet=rs0` จะยังเริ่มไม่ได้

หลังยืนยันว่า MongoDB รับ credentials เดิมได้ ให้ initialize replica set:

```powershell
docker compose -p app --env-file .env.vps up mongo-replica-init
```

หาก healthcheck ถูก credentials ใหม่ที่ยังไม่มีในฐานข้อมูลขวางอยู่ ให้แก้ `.env.vps` เป็น credentials เดิมก่อน หรือ initialize ผ่าน `mongosh` ภายใน container ด้วย credentials เดิม:

```powershell
docker exec database mongosh `
  --host 127.0.0.1:27017 `
  --username root `
  --password example `
  --authenticationDatabase admin `
  --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'mongo:27017'}]})"
```

ใช้รหัสจริงแทน `example` หากระบบเดิมเคยเปลี่ยนรหัสผ่านแล้ว จากนั้นตรวจสอบว่า node เป็น primary:

```powershell
docker exec database mongosh `
  --host 127.0.0.1:27017 `
  --username root `
  --password example `
  --authenticationDatabase admin `
  --eval "rs.status().myState"
```

ค่าที่คาดหวังคือ `1`

### 3. Compose สร้างกลุ่มและ volumes ใหม่เมื่อชื่อ project ไม่ตรง

อาการคือ containers เปิดได้แต่ฐานข้อมูลและไฟล์ MinIO ดูเหมือนหาย หรือพบ volumes หลายชุด เช่น:

```text
app_mongo-data
v04_mongo-data
smartbiz_mongo-data
```

ข้อมูลไม่ได้ถูกลบ แต่ Compose กำลัง mount volume ของ project คนละชื่อ การทดลองจริงพบว่า V0.3 ใช้ project ชื่อ `app` จึงต้องใช้ชื่อเดิมกับชุดไฟล์ในโฟลเดอร์ใหม่:

```powershell
docker compose -p app --env-file .env.vps up -d
```

สามารถกำหนดใน `.env.vps` แทนได้:

```env
COMPOSE_PROJECT_NAME=app
```

ตรวจสอบ volume ที่ MongoDB ใช้อยู่:

```powershell
docker inspect database --format '{{range .Mounts}}{{.Name}} -> {{.Destination}}{{println}}{{end}}'
```

ต้องพบ `app_mongo-data -> /data/db` ก่อนดำเนินการ migration

### 4. การอัปเดตค้างกลางทางทำให้บาง container เป็น `Created`

อาการคือ MongoDB และ MinIO ทำงาน แต่ backend, Nginx, Caddy และ initialization jobs อยู่สถานะ `Created` เพราะ Compose รอ dependency ที่ยังไม่ healthy หรือยังไม่มี primary

ให้แก้ MongoDB และ replica set ก่อน แล้วสั่ง Compose อีกครั้ง:

```powershell
docker compose -p app --env-file .env.vps up -d
```

เมื่อสำเร็จ backend และ `web_gateway` ต้องเป็น `healthy` ส่วน initialization jobs ต้องเป็น `Exited (0)`

### 5. Mongo Express ของ V0.3 ยังค้างอยู่

V0.3 เปิด Mongo Express ตามค่าเริ่มต้น แต่ Compose ใหม่กำหนดให้อยู่ใน profile `admin` หลัง migration จึงอาจพบ container เดิมชื่อ `web_database` อยู่ในสถานะ stopped หรือใช้ configuration เก่า

ลบเฉพาะ container เก่าได้โดยไม่กระทบ MongoDB volume:

```powershell
docker rm web_database
```

เมื่อต้องการใช้งาน Mongo Express รุ่นปัจจุบัน ให้เปิดผ่าน profile:

```powershell
docker compose -p app --env-file .env.vps --profile admin up -d mongo-express
```

### 6. HTTPS ทำงานแต่ Windows ไม่เชื่อถือ certificate ของ Caddy

อาการ:

```text
The signature of the certificate cannot be verified
```

การทดสอบด้วย `curl.exe -k` อาจตอบ `200` ตามปกติ แสดงว่า Caddy, Nginx และ backend ทำงาน แต่ Root CA ที่ Caddy ใช้อยู่ยังไม่ได้ติดตั้งใน Windows หรือ Windows เชื่อถือ Root CA คนละชุด

คัดลอกและติดตั้ง Root CA ของ Compose project ปัจจุบัน:

```powershell
docker cp app-edge-1:/data/caddy/pki/authorities/local/root.crt .\caddy-local-root.crt
certutil -user -addstore Root .\caddy-local-root.crt
```

ปิดและเปิด browser ใหม่หลังติดตั้ง หากลบหรือเปลี่ยน `caddy-data` Caddy อาจสร้าง Root CA ชุดใหม่และต้องติดตั้งใหม่อีกครั้ง

### 7. `media.localhost` ตอบ `403 Forbidden` ที่ path `/`

ผลลัพธ์นี้ไม่จำเป็นต้องหมายความว่า Caddy หรือ MinIO เสีย MinIO สามารถปฏิเสธการแสดงรายการ bucket ที่ root path ได้ แม้เส้นทาง reverse proxy จะทำงานถูกต้อง

ให้ตรวจ MinIO health และทดสอบเปิด object จริงหรือ presigned URL เพิ่มเติม:

```powershell
docker compose -p app --env-file .env.vps ps minio
curl.exe -k -I https://media.localhost/
```

ในการทดลองจริง MinIO เป็น `healthy` และ request ผ่าน Caddy ไปถึง MinIO โดย root path ตอบ `403` ตามนโยบายการเข้าถึง

### ผลลัพธ์ของการทดลองจริง

หลังแก้ปัญหาข้างต้น ระบบมีสถานะดังนี้:

- MongoDB 8.0.5 เป็น primary ของ replica set `rs0`
- MongoDB, MinIO, backend ทั้งหก service และ Nginx เป็น `healthy`
- `mongo-keyfile-init`, `mongo-replica-init` และ `mongo-users-init` จบด้วย `Exited (0)`
- Caddyfile ผ่านการ validate
- `https://localhost/` และ `https://app.localhost/` ตอบ `200`
- ข้อมูลตัวอย่างเดิมใน `Account`, `Bill`, `Stock` และ `User` ยังอยู่หลัง migration

## การย้อนกลับ

หากการทดสอบไม่ผ่าน:

1. หยุด Compose รุ่นใหม่โดยไม่ใช้ `-v`
2. เก็บ log และสำเนา volumes ที่มีปัญหาไว้ตรวจสอบ
3. ใช้ Compose และ MongoDB image เวอร์ชันเดิมของ V0.3
4. กู้คืน `mongo-data-v03.tgz` และ `minio-data-v03.tgz` ลงใน volumes ที่ว่าง
5. หากต้องกู้คืน MongoDB แบบ logical ให้ใช้ `mongorestore` กับ `smartbiz-v03.archive`

อย่านำไฟล์ volume backup แตกทับ volume ที่มีข้อมูลอยู่ เพราะอาจทำให้ข้อมูลเสียหายหรือปะปนกัน ควรกู้คืนลง volume ใหม่ที่ว่างแล้วตรวจสอบก่อนสลับระบบ
