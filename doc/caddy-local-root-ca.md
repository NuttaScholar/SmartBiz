# คู่มือใช้งาน Caddy Local Root CA บน Windows

คู่มือนี้ใช้สำหรับการทดสอบ SmartBiz ผ่าน HTTPS บนเครื่อง Windows ด้วยโดเมน local เช่น:

- `https://localhost`
- `https://app.localhost`
- `https://media.localhost`

Caddy จะสร้าง certificate สำหรับโดเมนเหล่านี้จาก Root Certificate Authority (Root CA) ภายในของตัวเอง Windows จะยังไม่เชื่อถือ certificate ดังกล่าวจนกว่าจะติดตั้ง Root CA ของ Caddy ลงใน Trusted Root Certificate Store

## Root CA คืออะไร

Root CA คือ certificate หลักที่ใช้ยืนยันความน่าเชื่อถือของ certificate อื่น ลำดับการตรวจสอบในระบบนี้เป็นดังนี้:

```text
Caddy Local Root CA
    ├── รับรอง certificate ของ localhost
    ├── รับรอง certificate ของ app.localhost
    └── รับรอง certificate ของ media.localhost
```

เมื่อ Windows เชื่อถือ Caddy Local Root CA แล้ว browser และโปรแกรมต่าง ๆ จึงสามารถตรวจสอบ HTTPS certificate ที่ Caddy ออกให้ได้

## ข้อกำหนดก่อนเริ่ม

- Docker Compose stack ต้องกำลังทำงาน
- Container ของ Caddy ต้องมีชื่อ `v04-edge-1`
- เปิด PowerShell ที่โฟลเดอร์ซึ่งต้องการเก็บไฟล์ certificate เช่น `E:\Playground\SmartBiz\V04`

ตรวจสอบสถานะ Caddy ด้วยคำสั่ง:

```powershell
docker compose --env-file .env.vps ps edge
```

สถานะของ container ควรเป็น `Up`

## 1. คัดลอก Root CA ออกจาก Caddy container

รันคำสั่ง:

```powershell
docker cp v04-edge-1:/data/caddy/pki/authorities/local/root.crt .\caddy-local-root.crt
```

ส่วนประกอบของคำสั่ง:

| ค่า | ความหมาย |
| --- | --- |
| `docker cp` | คัดลอกไฟล์ระหว่างเครื่องกับ container |
| `v04-edge-1` | ชื่อ Caddy container |
| `/data/caddy/pki/authorities/local/root.crt` | ตำแหน่ง Root CA ภายใน container |
| `.\caddy-local-root.crt` | ไฟล์ปลายทางในโฟลเดอร์ปัจจุบันของ PowerShell |

หากรันคำสั่งจาก `E:\Playground\SmartBiz\V04` จะได้ไฟล์ที่:

```text
E:\Playground\SmartBiz\V04\caddy-local-root.crt
```

## 2. ติดตั้ง Root CA ให้ผู้ใช้ Windows ปัจจุบัน

รันคำสั่ง:

```powershell
certutil -user -addstore Root .\caddy-local-root.crt
```

ส่วนประกอบของคำสั่ง:

| ค่า | ความหมาย |
| --- | --- |
| `certutil` | เครื่องมือจัดการ certificate ของ Windows |
| `-user` | ทำรายการกับ Certificate Store ของผู้ใช้ Windows ปัจจุบัน |
| `-addstore` | เพิ่ม certificate เข้าไปใน store |
| `Root` | Trusted Root Certification Authorities |
| `.\caddy-local-root.crt` | Root CA ที่คัดลอกมาจาก Caddy |

เมื่อคำสั่งสำเร็จ Windows จะเชื่อถือ certificate ที่ออกโดย Caddy Local Authority ของ container ชุดนี้

ปิด browser ทุกหน้าต่างแล้วเปิดใหม่ เพื่อให้ browser โหลดข้อมูล Certificate Store ล่าสุด

## 3. ทดสอบ HTTPS

ทดสอบหน้า Storefront:

```powershell
curl.exe --ssl-no-revoke -I https://localhost/
```

ทดสอบหน้าระบบจัดการ:

```powershell
curl.exe --ssl-no-revoke -I https://app.localhost/
```

หาก certificate และระบบทำงานถูกต้อง ควรได้รับสถานะ `HTTP/1.1 200 OK` หรือ `HTTP/2 200`

ทดสอบการเปลี่ยนจาก HTTP ไป HTTPS:

```powershell
curl.exe -I http://localhost/
```

Caddy ควรตอบสถานะ `308 Permanent Redirect` และมี header `Location: https://localhost/`

สำหรับ `https://media.localhost/` การตอบ `403 Forbidden` ที่ path `/` อาจเป็นพฤติกรรมปกติของ MinIO เมื่อไม่อนุญาตให้แสดงรายการไฟล์ใน bucket จึงไม่ได้หมายความว่า Caddy เสีย

## 4. ตรวจสอบ Root CA ที่ติดตั้งแล้ว

แสดง Caddy Root CA ใน Certificate Store ของผู้ใช้ปัจจุบัน:

```powershell
Get-ChildItem Cert:\CurrentUser\Root |
    Where-Object { $_.Subject -like '*Caddy Local Authority*' } |
    Select-Object Subject, Thumbprint, NotBefore, NotAfter
```

ค่า `Thumbprint` ใช้ระบุ certificate แต่ละชุด หาก Caddy สร้าง Root CA ใหม่ ค่า Thumbprint จะเปลี่ยนไป

## เมื่อ HTTPS แจ้งว่า certificate ไม่น่าเชื่อถือ

สาเหตุที่พบบ่อยคือ Windows ไม่มี Root CA หรือมี Root CA เก่าคนละชุดกับที่ Caddy ใช้อยู่ ให้ทำตามขั้นตอนต่อไปนี้:

1. ตรวจสอบว่า `v04-edge-1` กำลังทำงาน
2. รัน `docker cp` อีกครั้งเพื่อคัดลอก Root CA ชุดปัจจุบัน
3. รัน `certutil -user -addstore Root` อีกครั้ง
4. ปิดและเปิด browser ใหม่
5. ทดสอบ HTTPS อีกครั้ง

Caddy อาจสร้าง Root CA ชุดใหม่เมื่อ Docker volume ที่เก็บ `/data` ถูกลบหรือเปลี่ยนไป เช่น หลังใช้ `docker compose down -v` เมื่อนั้นต้องติดตั้ง Root CA ชุดใหม่ใน Windows อีกครั้ง

สามารถทดสอบเฉพาะการเชื่อมต่อโดยข้ามการตรวจ certificate ชั่วคราวได้ด้วย:

```powershell
curl.exe -k -I https://localhost/
```

ตัวเลือก `-k` เหมาะสำหรับการวิเคราะห์ปัญหาชั่วคราวเท่านั้น เพราะคำสั่งจะไม่ตรวจสอบความน่าเชื่อถือของ certificate

## การลบ Root CA เก่า

ค้นหา Thumbprint ของ Caddy Root CA ก่อน:

```powershell
Get-ChildItem Cert:\CurrentUser\Root |
    Where-Object { $_.Subject -like '*Caddy Local Authority*' } |
    Select-Object Subject, Thumbprint
```

เมื่อตรวจสอบแล้วว่าเป็น certificate เก่าที่ไม่ใช้งาน สามารถลบด้วย Thumbprint ที่ต้องการ:

```powershell
certutil -user -delstore Root <THUMBPRINT>
```

แทน `<THUMBPRINT>` ด้วยค่าจริงที่ได้จากคำสั่งตรวจสอบ อย่าลบ Root CA อื่นที่ไม่เกี่ยวข้อง

## ข้อควรระวัง

ติดตั้งเฉพาะ Root CA ที่คัดลอกจาก Caddy container ของระบบที่ควบคุมและเชื่อถือได้ เนื่องจาก certificate ใน Trusted Root Certification Authorities สามารถใช้รับรอง certificate อื่นให้ Windows เชื่อถือได้

