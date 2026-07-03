import { createRoot } from "react-dom/client";
import "./style.css";

const stats = [
  { label: "ยอดขายวันนี้", value: "24,850", unit: "บาท" },
  { label: "รายการรอจัดส่ง", value: "18", unit: "ออเดอร์" },
  { label: "สินค้าใกล้หมด", value: "7", unit: "รายการ" },
];

const tasks = [
  "ตรวจสอบใบเสร็จที่รออนุมัติ",
  "เติมสต็อกสินค้าขายดี",
  "ติดต่อลูกค้าที่นัดรับสินค้า",
];

function StorefrontPage() {
  return (
    <main className="storefront-page">
      <section className="storefront-hero" aria-labelledby="storefront-title">
        <div className="storefront-copy">
          <p className="storefront-kicker">SmartBiz / Storefront</p>
          <h1 id="storefront-title">หน้าร้านแยกสำหรับพัฒนา Storefront</h1>
          <p className="storefront-description">
            app รองนี้มี entry ของตัวเอง ใช้สำหรับพัฒนาหน้าร้านหรือ feature ใหม่โดยไม่กระทบหน้าเดิมของระบบ
          </p>
          <div className="storefront-actions">
            <a href="/" className="storefront-button storefront-button-primary">
              กลับหน้าเดิม
            </a>
            <a href="/storefront/" className="storefront-button storefront-button-secondary">
              รีโหลดหน้านี้
            </a>
          </div>
        </div>

        <div className="storefront-panel" aria-label="ภาพรวมวันนี้">
          <div className="storefront-panel-header">
            <span>ภาพรวมวันนี้</span>
            <strong>Live</strong>
          </div>
          <div className="storefront-stats">
            {stats.map((item) => (
              <article className="storefront-stat" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <small>{item.unit}</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="storefront-workspace" aria-label="งานที่ควรทำต่อ">
        <h2>งานที่ควรทำต่อ</h2>
        <div className="storefront-task-list">
          {tasks.map((task, index) => (
            <article className="storefront-task" key={task}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{task}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("storefront-root")!).render(<StorefrontPage />);
