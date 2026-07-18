import { validateSignature, messagingApi } from "@line/bot-sdk";
import { db } from "@/lib/firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";

const { MessagingApiClient } = messagingApi;

const channelSecret = process.env.LINE_CHANNEL_SECRET || "";
const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";

// Initialize LINE Messaging API Client
const client = new MessagingApiClient({
  channelAccessToken: channelAccessToken,
});

export async function POST(request) {
  try {
    const signature = request.headers.get("x-line-signature");
    if (!signature) {
      console.error("Missing x-line-signature header");
      return new Response("Missing signature", { status: 400 });
    }

    const body = await request.text();

    // Verify signature
    if (!validateSignature(body, channelSecret, signature)) {
      console.error("Invalid line signature");
      return new Response("Unauthorized", { status: 401 });
    }

    const data = JSON.parse(body);
    const events = data.events || [];

    // Process events asynchronously
    for (const event of events) {
      if (event.type === "message" && event.message.type === "text") {
        await handleTextMessage(event);
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error in webhook handler:", error);
    return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}

async function handleTextMessage(event) {
  const replyToken = event.replyToken;
  const userText = event.message.text.trim();

  let responseMessage = "";

  if (userText === "ติดต่อพนักงาน") {
    responseMessage = "รับทราบครับ! ระบบได้แจ้งพนักงานร้าน Café DoiTung เรียบร้อยแล้ว พนักงานจะเข้ามาดูแลคุณในสักครู่ครับ ☕️";
  } else if (userText.toLowerCase() === "เมนู" || userText.toLowerCase() === "menu") {
    try {
      // Query Firestore products database
      const productsCollection = collection(db, "products");
      const productsQuery = query(productsCollection, limit(5));
      const querySnapshot = await getDocs(productsQuery);
      
      if (querySnapshot.empty) {
        responseMessage = "ขออภัยครับ ขณะนี้ไม่มีข้อมูลสินค้าในระบบ";
      } else {
        let menuList = "☕️ เมนูแนะนำร้าน Café DoiTung:\n\n";
        querySnapshot.forEach((doc) => {
          const product = doc.data();
          menuList += `- ${product.name}: ${product.price} THB\n`;
        });
        menuList += "\nสั่งซื้อหรือดูเมนูเพิ่มเติมผ่าน LIFF App ได้เลยครับ! (ฟังก์ชันระบบสั่งอาหารจะพร้อมใช้งานใน Phase 3)";
        responseMessage = menuList;
      }
    } catch (dbError) {
      console.error("Database query failed:", dbError);
      responseMessage = "ขออภัยครับ ระบบไม่สามารถดึงข้อมูลเมนูได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง";
    }
  } else {
    responseMessage = `สวัสดีครับ ยินดีต้อนรับสู่ Café DoiTung ☕️🍃\n\nคุณส่งข้อความ: "${userText}"\n\nหากต้องการความช่วยเหลือพิมพ์:\n- "เมนู" เพื่อดูรายการแนะนำ\n- "ติดต่อพนักงาน" เพื่อติดต่อบาริสต้า`;
  }

  // Reply to the user
  await client.replyMessage({
    replyToken: replyToken,
    messages: [
      {
        type: "text",
        text: responseMessage,
      },
    ],
  });
}
