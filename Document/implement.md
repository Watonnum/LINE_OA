# implement.md: DoiTung Smart Order & Barista AI

## 1. Project Overview
ระบบ LINE Official Account สำหรับร้าน Café DoiTung ที่ผสานระบบสั่งอาหารล่วงหน้า (Self-Ordering) และแชทบอท AI เพื่อยกระดับประสบการณ์ลูกค้าและตอบสนองเกณฑ์การประเมินโปรเจกต์รายวิชา

## 2. Tech Stack
- **Frontend (LIFF):** Next.js (React)
- **Backend/Webhook:** Node.js หรือ Firebase Cloud Functions
- **Database:** Google Firebase (Cloud Firestore)
- **AI & Automation:** n8n, Dialogflow
- **LINE API:** Messaging API, LIFF, LINE MINI App

## 3. Database Schema (Firestore)
This section implements data structures on Firestore to ensure efficient real-time updates and seamless integration with the Next.js frontend.

### 3.1 Collection: `users`
- **Document ID:** `{lineUid}`
- **Fields:**
  - `displayName` (String)
  - `pictureUrl` (String)
  - `rewardPoints` (Number) - Default: 0
  - `createdAt` (Timestamp)

### 3.2 Collection: `products`
- **Document ID:** Auto-generated
- **Fields:**
  - `name` (String)
  - `description` (String)
  - `price` (Number)
  - `category` (String) - e.g., 'Coffee', 'Bakery'
  - `imageUrl` (String)
  - `isAvailable` (Boolean)

### 3.3 Collection: `orders`
- **Document ID:** Auto-generated
- **Fields:**
  - `orderNumber` (String)
  - `userId` (String) - Reference to `users` Document ID
  - `items` (Array of Objects) - `{ productId, quantity, options }`
  - `totalAmount` (Number)
  - `status` (String) - 'Pending', 'Preparing', 'Completed'
  - `orderedAt` (Timestamp)

## 4. Implementation Phases & Tasks

### Phase 1: Setup & Data Structure
- [x] Initialize Next.js project.
- [x] Initialize Firebase project (Firestore, Storage).
- [x] Create mock data in `products` collection for Café DoiTung.

### Phase 2: LINE API & Webhook Configuration
- [ ] Register LINE OA & create Provider/Channel in LINE Developers.
- [ ] Setup Webhook URL via Node.js/Firebase Functions to receive LINE events.
- [ ] Implement `Auto response` logic for basic fallback keywords (e.g., "ติดต่อพนักงาน").

### Phase 3: LIFF App Development (Frontend)
- [ ] Register LIFF URL in LINE Developers.
- [ ] Implement `liff.init()` and `liff.getProfile()` to authenticate users.
- [ ] Create UI: Product Listing, Cart, and Checkout pages.
- [ ] Ensure UI design uses appropriate colors (earth tones) and font sizes for DoiTung brand, fulfilling the evaluation criteria for design suitability[cite: 1].

### Phase 4: AI Integration & Workflow (n8n + Dialogflow)
- [ ] Setup Dialogflow agent with intents: `Menu Recommendation`, `Store Hours`.
- [ ] Configure n8n workflow: Webhook (from LINE) -> Dialogflow (Intent Recognition) -> Firestore (Fetch Data) -> LINE (Reply Message).
- [ ] Ensure the AI chatbot correctly assists in answering customer inquiries[cite: 1].

### Phase 5: Rich Features & Notifications
- [ ] Design and setup `Richmenu with API` to switch menus dynamically (e.g., "Order Now" vs. "Check Status")[cite: 1].
- [ ] Implement `Rich messages` for broadcasting promotions or new coffee beans.
- [ ] Implement `Flex message` generation in Backend to send a digital receipt when an order is created.
- [ ] Setup Firestore `onSnapshot` listener to trigger a push message when order `status` changes to 'Completed'.

## 5. Evaluation Form Alignment Checklist
- **เนื้อหาและฟังก์ชัน:** Includes AI chatbot for answering questions[cite: 1], implements diverse media like Flex and Rich Messages[cite: 1], and functions perfectly for cafe ordering[cite: 1].
- **การออกแบบ:** Dynamic Rich Menu matches user state[cite: 1], clear UI/UX for easy understanding[cite: 1], appropriate brand colors/fonts[cite: 1].