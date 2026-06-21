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

function DemoPage() {
  return (
    <main className="demo-page">
      <section className="demo-hero" aria-labelledby="demo-title">
        <div className="demo-copy">
          <p className="demo-kicker">SmartBiz / Demo Page</p>
          <h1 id="demo-title">หน้าทดลองสำหรับพัฒนาแยกจากแอปหลัก</h1>
          <p className="demo-description">
            หน้าใหม่นี้มี entry ของตัวเอง ใช้สำหรับลอง UI หรือ feature ใหม่โดยไม่กระทบหน้าเดิมของระบบ
          </p>
          <div className="demo-actions">
            <a href="/" className="demo-button demo-button-primary">
              กลับหน้าเดิม
            </a>
            <a href="/demo/" className="demo-button demo-button-secondary">
              รีโหลดหน้านี้
            </a>
          </div>
        </div>

        <div className="demo-panel" aria-label="ภาพรวมวันนี้">
          <div className="demo-panel-header">
            <span>ภาพรวมวันนี้</span>
            <strong>Live</strong>
          </div>
          <div className="demo-stats">
            {stats.map((item) => (
              <article className="demo-stat" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <small>{item.unit}</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="demo-workspace" aria-label="งานที่ควรทำต่อ">
        <h2>งานที่ควรทำต่อ</h2>
        <div className="demo-task-list">
          {tasks.map((task, index) => (
            <article className="demo-task" key={task}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{task}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("demo-root")!).render(<DemoPage />);
