# การติดตั้ง SmartBiz บน VPS

ไฟล์ `docker-compose.yml` ที่ root ของโปรเจกต์ออกแบบมาสำหรับติดตั้งบน VPS โดยใช้โดเมน HTTPS สาธารณะ และใช้แทน gateway แบบ HTTP โดยตรงชุดเดิม Caddy รับการเชื่อมต่อผ่านพอร์ต 80/443 จัดการออกและต่ออายุ certificate พร้อมรักษา Host header ขณะส่งคำขอไปยัง Nginx gateway ภายใน ส่วน Nginx จะเชื่อถือ IP ของผู้ใช้และ protocol ที่ส่งต่อมาเฉพาะจาก IP คงที่ของ Caddy เท่านั้น

ควรติดตั้งระบบหลัง Public DNS โดยตรง หากมี CDN หรือ load balancer อยู่ด้านหน้า ต้องตั้งค่า trusted proxy เพิ่มเติมให้เหมาะสม

## การติดตั้งใหม่

1. ตั้งค่า DNS A record ของ `example.com`, `app.example.com` และ `media.example.com` ให้ชี้ไปยัง VPS สร้าง AAAA record เฉพาะเมื่อ IPv6 ใช้งานได้จริง เปิดรับ TCP พอร์ต 80/443 และ UDP พอร์ต 443 หากต้องการใช้ HTTP/3 พร้อมตรวจสอบว่ายังเชื่อมต่อ SSH ได้ ไม่จำเป็นต้องเปิดพอร์ตอื่นของแอปสู่ภายนอก และต้องตรวจว่า Docker subnet `192.168.110.0/24` ไม่ทับซ้อนกับ network ของ VPS หรือ VPN

2. คัดลอกชุดไฟล์ deploy ไปยัง VPS โดยใช้เพียง `docker-compose.yml`, `.env.vps`, `nginx.conf`, `templates/`, `deploy/Caddyfile`, สคริปต์ `deploy/mongo-*.js` ทั้งสามไฟล์ และ `dist/` หากต้องติดตั้งแบบไม่เชื่อมต่อ Docker Hub ให้แนบ `smartbiz-images.tar` เพิ่มด้วย ไม่จำเป็นต้องมี source ในโฟลเดอร์ `ServerService` หรือ Node.js บน VPS ให้ติดตั้ง Docker Engine พร้อม Compose v2 และตรวจสอบว่าไม่มีโปรแกรมอื่นใช้พอร์ต 80/443

3. สร้าง credentials บน VPS หรือส่งไฟล์ที่สร้างไว้ไปยัง VPS ผ่านช่องทางที่ปลอดภัย:

   ```sh
   node deploy/create-env.mjs example.com admin@example.com
   chmod 600 .env.vps
   ```

   ตัวสร้างจะไม่เขียนทับ `.env.vps` ที่มีอยู่แล้ว โดยจะสร้าง secrets แบบสุ่มแยกจากกันและสร้างรหัสผ่านฐานข้อมูลของแต่ละ service ที่ใช้ใน URI ได้อย่างปลอดภัย หากต้องการใช้ volumes เดิม ให้กำหนด `COMPOSE_PROJECT_NAME` ให้ตรงกับชื่อโปรเจกต์เดิม ห้าม commit หรือเผยแพร่ไฟล์นี้ และไม่ควรบันทึก Compose config ที่ขยายค่าแล้วลงใน log ให้ใช้ `config --quiet`

4. ตั้งค่า `.env.production` ของ frontend ด้วยค่า public ต่อไปนี้ โดยเปลี่ยนโดเมนตัวอย่างเป็นโดเมนจริง:

   ```dotenv
   VITE_WEB_SHOP=https://example.com
   VITE_API_GATEWAY_URL=https://app.example.com
   ```

   โหลด backend images ที่แนบมาและเริ่มระบบจากโฟลเดอร์ deploy:

   ```sh
   # ทางเลือกสำหรับการติดตั้งแบบ offline หรือเมื่อต้องการใช้ images ที่แนบมากับ release
   docker load -i smartbiz-images.tar
   docker compose --env-file .env.vps config --quiet
   docker compose --env-file .env.vps up -d --wait --wait-timeout 300
   ```

   Compose ใช้ backend images ทั้งหกตัวในชื่อ `nuttascholar/smartbiz_*` และกำหนด `pull_policy: missing` จึงใช้ image ในเครื่องก่อน และดึง tag ที่ขาดจาก Docker Hub โดยอัตโนมัติ ไม่จำเป็นต้องมี source code ส่วน gateway จะ mount โฟลเดอร์ `dist` ที่แนบมาและไม่ได้ compile frontend ให้ การออก certificate ครั้งแรกต้องใช้ DNS ที่ถูกต้องและ VPS ต้องเข้าถึงได้จากอินเทอร์เน็ต โดย certificate อาจออกสำเร็จหลัง containers เปลี่ยนเป็น healthy แล้ว

5. ตรวจสอบโดเมน HTTPS ทั้งสาม รวมถึงขั้นตอนเข้าสู่ระบบ สั่งซื้อ อัปโหลด และดาวน์โหลด หากระบบเริ่มไม่สำเร็จ ให้ตรวจด้วย `docker compose --env-file .env.vps ps -a` และดู logs เส้นทาง `/gateway/health` ตรวจเฉพาะ Nginx ส่วน `/readyz` ของ backend ตรวจสถานะการเชื่อมต่อฐานข้อมูล และ Storage ตรวจการเชื่อมต่อ MinIO การตรวจเหล่านี้ไม่สามารถทดแทน smoke test ของธุรกรรมจริงได้

   Container ที่ healthcheck ไม่ผ่านจะมีสถานะ unhealthy แต่ Compose จะไม่ restart process ที่ยังทำงานอยู่โดยอัตโนมัติ ส่วน process ที่เริ่มระบบล้มเหลวจะ exit และถูกเริ่มใหม่ตาม restart policy

## พื้นที่จัดเก็บไฟล์

การเชื่อมต่อจาก SDK ทั้งหมดใช้ `minio:9000` ภายใน Docker ส่วน URL สำหรับ browser ใช้ `https://media.example.com` ระบบจะลงลายเซ็น presigned URL ด้วย public hostname และ region คงที่ `us-east-1` โดยไม่ต้องส่งคำขอผ่าน Caddy ขณะสร้างลายเซ็น ห้ามเปลี่ยน hostname หรือ path ของ URL หลังจากลงลายเซ็นแล้ว

MinIO API ไม่มีการ map พอร์ตออกมายัง host ส่วน MinIO Console เปิดเฉพาะ loopback หากจำเป็นต้องใช้งานจากเครื่องอื่น ให้เชื่อมต่อผ่าน SSH tunnel

การ deploy นี้จะไม่แก้ absolute URL เดิมที่บันทึก IP address เก่าไว้ใน MongoDB ต้องสำรองข้อมูลและย้ายค่าเหล่านี้แยกต่างหาก หลังตรวจสอบแล้วว่าฟิลด์ใดเก็บ storage URL ส่วน path แบบสัมพัทธ์ในรูป `bucket/object` จะยังใช้ public origin ที่กำหนดไว้ ให้ทดสอบ URL หลักฐานแบบ private การอ่านรูป และ presigned PUT จาก browser ก่อนเปิดใช้งานจริง

## การย้ายระบบเมื่อมี MongoDB volumes เดิม

การเปลี่ยน `MONGO_ROOT_PASSWORD` ในไฟล์ env **ไม่ได้เปลี่ยนรหัสผ่านภายในฐานข้อมูลเดิม** ห้ามลบ volumes เพื่อแก้ปัญหา authentication

1. สำรอง MongoDB และ MinIO แล้วทดลอง restore ลง volume แยก ตรวจสอบให้แน่ใจว่าสามารถกู้คืนได้จริง ต้องคงชื่อ Compose project, MongoDB major version/FCV, ชื่อ replica set, keyfile และ volumes เดิม สคริปต์ init ที่ให้มาต้องใช้ MongoDB 8 และ `mongo` ห้ามเลือก MongoDB 4.4

2. หยุด application containers ระหว่าง maintenance สร้าง `.env.vps` แล้วแก้ `MONGO_ROOT_USER` และ `MONGO_ROOT_PASSWORD` ให้เป็น credentials ของผู้ดูแลฐานข้อมูล **ที่ใช้อยู่ในปัจจุบัน** ส่วนรหัสผ่านใหม่ของแต่ละ service ให้เก็บค่าที่ตัวสร้างสร้างไว้

3. รันคำสั่งต่อไปนี้:

   ```sh
   docker compose --env-file .env.vps config --quiet
   docker compose --env-file .env.vps up -d --wait --wait-timeout 180 mongo
   docker compose --env-file .env.vps run --rm --no-deps mongo-replica-init
   docker compose --env-file .env.vps run --rm --no-deps mongo-users-init
   ```

   ระบบจะรอให้ replica set พร้อม แล้วสร้างหรืออัปเดตบัญชีของ application คำสั่งนี้รันซ้ำได้โดยให้ผลลัพธ์เดิม แต่เมื่อใช้รหัสผ่าน application ค่าใหม่ credentials เดิมจะใช้ไม่ได้ จึงต้องปิด applications ไว้จนกว่าจะอัปเดตเสร็จ

4. เปลี่ยนรหัสผ่านผู้ดูแลเดิมหรือรหัสเริ่มต้นผ่าน `mongo` ที่ยืนยันตัวตนแล้ว โดยใช้ `db.changeUserPassword` ร่วมกับ `passwordPrompt()` จากนั้นตั้ง `MONGO_ROOT_PASSWORD` ใน `.env.vps` ให้เป็นค่าเดียวกัน หลีกเลี่ยงการพิมพ์รหัสผ่านลงใน shell history แล้ว recreate MongoDB เพื่อให้ healthcheck ใช้รหัสใหม่ ห้ามเปลี่ยนรหัสด้วยการแก้ไฟล์ env เพียงอย่างเดียว

5. เริ่มระบบด้วยคำสั่งสำหรับการติดตั้งใหม่โดยไม่ใส่ `--build` แล้วตรวจสอบธุรกรรมและพื้นที่จัดเก็บ เก็บ release เดิมและข้อมูลสำรองไว้สำหรับ rollback หากเปลี่ยนรหัสผ่านของ application แล้ว images ที่ใช้ rollback ต้องรองรับ credentials ชุดใหม่ด้วย

บัญชีของ application จะยืนยันตัวตนกับฐานข้อมูล `admin` แต่ได้รับ role `readWrite` เฉพาะฐานข้อมูลที่จำเป็น:

- Account → Account
- Login → User
- Stock → Stock
- Bill → Account, Bill และ Stock
- Storefront → Account, Bill, Stock และ StoreFront

Services ที่เข้าถึงหลายฐานข้อมูลจะสร้าง models และ indexes ในฐานข้อมูลเหล่านั้น ดังนั้นสิทธิ์ที่ใช้เป็นระดับฐานข้อมูล ยังไม่ใช่สิทธิ์ขั้นต่ำระดับ collection ไม่มี application ใดได้รับ MongoDB root credentials ส่วน MinIO ยังใช้ storage credentials ร่วมกันระหว่าง services หากต้องการแยก credentials ของ MinIO ตาม service ต้องดำเนินการเพิ่มเติม

## การดูแลระบบและข้อจำกัด

- เก็บ `.env.vps`, ข้อมูลสำรองฐานข้อมูล และ certificate volume `caddy-data` เป็นความลับ Environment variables ของ Compose ยังสามารถมองเห็นได้โดยผู้ที่มีสิทธิ์ใช้ Docker จึงไม่ใช่ระบบ secrets vault ภายนอก
- ไฟล์ `.env` ที่ Git ติดตามอยู่เดิมยังใช้สำหรับขั้นตอนทำงานบนเครื่อง local ส่วน `.env.vps` และ `.env.vps.test` ที่สร้างใหม่จะถูก Git ignore ให้เปลี่ยน credentials ทุกค่าที่เคย commit หรือเผยแพร่ รวมถึง JWT secret และ service-auth secret โดย token เดิมจะหยุดทำงานหลังเปลี่ยน secret
- Mongo Express ถูกปิดตามค่าเริ่มต้น เปิดเฉพาะเมื่อจำเป็นด้วย `docker compose --env-file .env.vps --profile admin up -d mongo-express` แล้วเชื่อมต่อผ่าน SSH tunnel ไปยัง `localhost:8081`
- สำรอง `mongo-data`, `minio-data` และข้อมูล certificate ด้วยเครื่องมือที่รักษาความสอดคล้องของฐานข้อมูล ห้ามรัน `down -v` กับระบบที่ใช้งานจริง
- Restart policy ใช้กับ services ที่ทำงานระยะยาว ส่วนงาน initialization ที่ทำครั้งเดียวกำหนด `restart: no` ไว้โดยตั้งใจ Process ที่ใช้ฐานข้อมูลจะลองเริ่มใหม่ผ่าน container restart เมื่อเริ่มระบบล้มเหลว และ Mongoose จะเชื่อมต่อใหม่เมื่อการเชื่อมต่อขาดชั่วคราว ควรติดตาม health และพื้นที่ดิสก์อย่างสม่ำเสมอ
- การปรับปรุง deployment ชุดนี้ยังไม่แก้ผลตรวจสอบอื่น ได้แก่ บัญชี application เริ่มต้น การยกเลิก token หรือปิดผู้ใช้ และ dependency ที่มีช่องโหว่ ต้องแก้ประเด็นเหล่านี้ก่อนเปิด production สู่สาธารณะ

เอกสารอ้างอิง: [การจัดการ HTTPS อัตโนมัติของ Caddy](https://caddyserver.com/docs/automatic-https), [ลำดับการเริ่มระบบของ Compose](https://docs.docker.com/compose/how-tos/startup-order/), [MinIO JS API](https://github.com/minio/minio-js/blob/master/docs/API.md)
