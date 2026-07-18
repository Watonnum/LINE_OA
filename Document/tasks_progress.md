# Cafe DoiTung LINE OA - Roadmap & Task Progress

เอกสารนี้ระบุรายการงาน (Tasks) ทั้งหมดและสถานะความคืบหน้าของโครงการ **Café DoiTung Smart Order & Barista AI** สำหรับการพัฒนา LINE Official Account ร่วมกับระบบสั่งอาหารล่วงหน้าและ AI Chatbot

---

## 📊 สรุปความคืบหน้าภาพรวม (Overall Progress)
* **สถานะปัจจุบัน:** Phase 1 และ Phase 2 เสร็จสมบูรณ์แล้ว
* **จำนวน Phase ทั้งหมด:** 5 Phases
* **Phase ที่เหลือ:** 3 Phases (Phase 3 - 5)
* **เปอร์เซ็นต์ความคืบหน้า:** 40% (2/5 Phases)

---

## 🛠️ รายละเอียดของแต่ละ Phase และงานที่ต้องทำ

### ✅ Phase 1: Setup & Data Structure (เสร็จสิ้น)
เตรียมโครงสร้างพื้นฐาน ระบบฐานข้อมูล และข้อมูลตัวอย่าง
* [x] **Initialize Next.js project:** สร้างโปรเจกต์ Next.js ในโฟลเดอร์ `liff/` (เสร็จแล้ว)
* [x] **Initialize Firebase project:** ทำการเชื่อมต่อแอปเข้ากับ Cloud Firestore ด้วย Credentials ที่กำหนด (เสร็จแล้ว)
* [x] **Create mock data:** ออกแบบและนำเข้าข้อมูลสินค้าของร้าน Café DoiTung (เช่น DoiTung Macadamia Latte, เบเกอรี่) รวม 9 รายการเข้าสู่ฐานข้อมูล Firestore (เสร็จแล้ว)

---

### ✅ Phase 2: LINE API & Webhook Configuration (เสร็จสิ้น)
**เป้าหมาย:** เชื่อมต่อแอปพลิเคชันกับระบบ LINE OA และสร้างระบบตอบกลับอัตโนมัติเบื้องต้น (Backend/Webhook)
* [x] **Register LINE OA:** สมัครและสร้าง Channel บน [LINE Developers Console](https://developers.line.biz/) (เสร็จแล้ว)
* [x] **Setup Webhook URL:** ตั้งค่าระบบ Webhook (ด้วย Node.js/Express หรือ Firebase Cloud Functions) เพื่อคอยรับ Events ต่างๆ ส่งมาจาก LINE (เชื่อมต่อผ่าน ngrok ไปที่ Next.js API Route `/api/webhook` สำเร็จ)
* [x] **Implement Auto response:** ทำระบบตอบกลับอัตโนมัติพื้นฐานสำหรับคำสำคัญ เช่น ข้อความตอบกลับเมื่อพิมพ์คำว่า "ติดต่อพนักงาน" (รหัสผ่าน Next.js API Route พร้อมใช้งานแล้ว)

---

### ⏳ Phase 3: LIFF App Development (Frontend)
**เป้าหมาย:** พัฒนาระบบสั่งอาหาร (Self-Ordering) ด้วยเทคโนโลยี LIFF ที่จะเปิดขึ้นมาใน LINE
* [ ] **Register LIFF URL:** ลงทะเบียน LIFF App ใน LINE Developers Console
* [ ] **LIFF Authentication:** พัฒนาฟังก์ชัน `liff.init()` และ `liff.getProfile()` ในระบบ Next.js เพื่อระบุตัวตนผู้ใช้ LINE
* [ ] **Develop UI & Pages:**
  * หน้าหลักแสดงรายการสินค้า (Product Listing) พร้อมปุ่มเลือกใส่ตะกร้า
  * หน้าตะกร้าสินค้า (Cart) สำหรับทบทวนรายการและยอดเงิน
  * หน้าชำระเงิน/ส่งคำสั่งซื้อ (Checkout)
* [ ] **Brand Identity Design:** ออกแบบหน้าตาให้สวยงาม พรีเมียม ใช้โทนสีอบอุ่น (Earth Tones) และรูปแบบฟอนต์ที่ตรงตาม CI ของแบรนด์ DoiTung

---

### ⏳ Phase 4: AI Integration & Workflow (n8n + Dialogflow)
**เป้าหมาย:** ผสานบอท AI เพื่อช่วยตอบคำถามลูกค้าเกี่ยวกับการแนะนำเมนูและข้อมูลทั่วไปของร้าน
* [ ] **Dialogflow Intent Setup:** ตั้งค่า Dialogflow Agent และออกแบบ Intent ต่างๆ เช่น:
  * `Menu Recommendation` (การแนะนำเมนูเครื่องดื่มและอาหาร)
  * `Store Hours` (สอบถามเวลาเปิด-ปิดร้าน)
* [ ] **n8n Workflow Automation:** ออกแบบ Workflow บน n8n เพื่อรับข้อความจาก LINE -> ส่งไปแปลเจตนาที่ Dialogflow -> ดึงข้อมูลสินค้าจาก Firestore -> จัดทำข้อความเป็น Flex Message ส่งกลับหาลูกค้า
* [ ] **AI Chatbot Verification:** ทดสอบการทำงานของแชทบอทให้สามารถช่วยเหลือตอบคำถามได้อย่างราบรื่น

---

### ⏳ Phase 5: Rich Features & Notifications
**เป้าหมาย:** เพิ่มประสบการณ์การใช้งานที่หรูหราผ่านเครื่องมือพิเศษของ LINE และระบบแจ้งเตือนแบบ Real-time
* [ ] **Dynamic Richmenu:** ออกแบบเมนูด้านล่างห้องแชท (Rich Menu) และควบคุมให้สลับรูปแบบอัตโนมัติตามสถานะการใช้งาน (เช่น เมนู "สั่งกาแฟเลย" สำหรับลูกค้าทั่วไป และ เมนู "เช็กสถานะการสั่ง" เมื่อมีรายการค้างอยู่)
* [ ] **Rich Messages:** จัดทำรูปแบบการส่งข้อความโปรโมท เมนูเมล็ดกาแฟใหม่ หรือข่าวสารต่างๆ ของร้าน
* [ ] **Flex Message Receipt:** พัฒนาระบบส่งใบเสร็จดิจิทัลแบบสวยงาม (Flex Message) ให้ลูกค้าหลังจากสั่งสินค้าเสร็จ
* [ ] **Order Status Notification:** ตั้งค่า Firestore Listener (`onSnapshot`) ในระบบหลังบ้าน เพื่อจับการเปลี่ยนแปลงของสถานะคำสั่งซื้อ และยิง Push Message ไปบอกลูกค้าทันทีเมื่อบาริสต้าทำกาแฟเสร็จ (`status` เปลี่ยนเป็น 'Completed')

---

## 📈 แผนการดำเนินการขั้นถัดไป (Next Steps)
1. **เริ่มดำเนินการ Phase 2:** ตั้งค่า LINE OA ใน LINE Developers และเขียนระบบ Webhook เพื่อรับส่งข้อมูลกับ LINE
2. **ออกแบบ Rich Menu:** จัดทำ Assets และโครงสร้าง Rich Menu สำหรับเตรียมนำไปใช้ใน Phase 5
