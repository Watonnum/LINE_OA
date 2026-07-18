"use client";

import React, { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function CartTab({ cart, onUpdateQuantity, onClearCart, userProfile, onOrderSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState("");

  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const generateOrderNumber = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let orderId = "DT-";
    for (let i = 0; i < 5; i++) {
      orderId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return orderId;
  };

  const handleCheckout = async () => {
    if (!userProfile) {
      alert("กรุณาเข้าสู่ระบบ LINE ก่อนสั่งซื้อ");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderNumber = generateOrderNumber();

      // Format items for Firestore
      const items = cart.map((item) => ({
        productId: item.product.id || item.product.name,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      }));

      // Create Order Document in Firestore
      const orderData = {
        orderNumber,
        userId: userProfile.userId,
        displayName: userProfile.displayName || "LINE User",
        pictureUrl: userProfile.pictureUrl || "",
        items,
        totalAmount,
        notes,
        status: "Pending", // Pending, Preparing, Completed
        orderedAt: serverTimestamp(),
      };

      console.log("Submitting order to Firestore:", orderData);
      const orderRef = await addDoc(collection(db, "orders"), orderData);

      // Create or update user profile document in Firestore, add reward points (e.g., 10 points per 100 THB spent)
      const earnedPoints = Math.floor(totalAmount / 10);
      const userRef = doc(db, "users", userProfile.userId);
      await setDoc(userRef, {
        displayName: userProfile.displayName || "LINE User",
        pictureUrl: userProfile.pictureUrl || "",
        lastOrderedAt: serverTimestamp(),
      }, { merge: true });

      console.log(`Order created successfully with ID: ${orderRef.id}`);
      
      // Clear Cart and trigger success callback
      onClearCart();
      onOrderSuccess({
        id: orderRef.id,
        orderNumber,
        totalAmount,
        earnedPoints,
      });

    } catch (error) {
      console.error("Failed to place order:", error);
      alert("เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-slide-up">
        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center text-3xl mb-4">
          🛒
        </div>
        <h3 className="font-semibold text-stone-800 text-lg">ตะกร้าของคุณยังว่างอยู่</h3>
        <p className="text-sm text-stone-400 mt-2 max-w-xs">
          กลับไปเลือกเมนูเครื่องดื่มและของหวานแสนอร่อยของ Café DoiTung แล้วเพิ่มลงตะกร้าได้เลยครับ!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 p-4 pb-24 animate-slide-up">
      <h2 className="font-bold text-doitung-green-dark text-lg mb-4 flex items-center justify-between">
        <span>รายการสินค้าในตะกร้า</span>
        <button 
          onClick={onClearCart} 
          className="text-xs font-normal text-stone-400 hover:text-red-500 transition-colors"
        >
          ล้างทั้งหมด
        </button>
      </h2>

      {/* Cart Items List */}
      <div className="space-y-3 mb-6">
        {cart.map((item) => (
          <div
            key={item.product.id || item.product.name}
            className="flex items-center bg-white rounded-2xl p-4 shadow-sm border border-stone-100"
          >
            <img
              src={item.product.imageUrl || "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=200"}
              alt={item.product.name}
              className="w-14 h-14 rounded-xl object-cover bg-stone-100 shrink-0"
            />
            <div className="flex-1 ml-4">
              <h4 className="font-semibold text-doitung-green-dark text-sm">{item.product.name}</h4>
              <p className="text-xs font-semibold text-doitung-green mt-1">
                {item.product.price} THB
              </p>
            </div>
            
            {/* Quantity Selector */}
            <div className="flex items-center bg-stone-50 rounded-full p-0.5 border border-stone-100">
              <button
                onClick={() => onUpdateQuantity(item.product, -1)}
                className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-doitung-green font-bold shadow-xs active:scale-95 transition-transform"
              >
                -
              </button>
              <span className="px-3 text-sm font-semibold text-stone-800">{item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item.product, 1)}
                className="w-7 h-7 rounded-full bg-doitung-green flex items-center justify-center text-white font-bold shadow-xs active:scale-95 transition-transform"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Special Notes */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 mb-6">
        <label className="block text-xs font-semibold text-stone-500 mb-2">
          หมายเหตุถึงบาริสต้า (เช่น หวานน้อย, เพิ่มช็อตกาแฟ)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="ระบุความต้องการพิเศษของคุณที่นี่..."
          rows="2"
          className="w-full text-sm p-3 border border-stone-200 rounded-xl focus:outline-none focus:border-doitung-green/30 focus:ring-1 focus:ring-doitung-green/10 resize-none bg-stone-50/50"
        />
      </div>

      {/* Pricing Summary */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 mb-6">
        <div className="flex justify-between text-sm text-stone-500 mb-2">
          <span>ยอดรวมสินค้า</span>
          <span>{totalAmount} THB</span>
        </div>
        <div className="flex justify-between text-sm text-stone-500 mb-3">
          <span>ค่าบริการจัดทำ/จัดส่ง</span>
          <span className="text-doitung-green font-medium">ฟรี</span>
        </div>
        <hr className="border-stone-100 mb-3" />
        <div className="flex justify-between items-center">
          <span className="font-bold text-doitung-green-dark text-base">ยอดรวมสุทธิ</span>
          <span className="font-bold text-doitung-green text-xl">{totalAmount} THB</span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={isSubmitting}
        className="w-full py-4 bg-doitung-green hover:bg-doitung-green-light disabled:bg-stone-300 text-white font-semibold rounded-2xl shadow-md active:scale-98 transition-all flex items-center justify-center"
      >
        {isSubmitting ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          `สั่งสินค้าตอนนี้ (${totalAmount} THB)`
        )}
      </button>
    </div>
  );
}
