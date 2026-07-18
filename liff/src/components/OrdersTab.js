"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";

export default function OrdersTab({ userProfile }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;

    console.log("Listening to orders for user:", userProfile.userId);
    const ordersCollection = collection(db, "orders");
    const ordersQuery = query(
      ordersCollection,
      where("userId", "==", userProfile.userId)
    );

    const unsubscribe = onSnapshot(ordersQuery, (querySnapshot) => {
      const ordersList = [];
      querySnapshot.forEach((doc) => {
        ordersList.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      
      // Sort client-side by orderedAt timestamp (descending)
      ordersList.sort((a, b) => {
        const timeA = a.orderedAt?.seconds || 0;
        const timeB = b.orderedAt?.seconds || 0;
        return timeB - timeA;
      });

      console.log("Fetched orders:", ordersList);
      setOrders(ordersList);
      setIsLoading(false);
    }, (error) => {
      console.error("Failed to fetch orders:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
            รอรับออเดอร์
          </span>
        );
      case "Preparing":
        return (
          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
            กำลังจัดทำ ☕️
          </span>
        );
      case "Completed":
        return (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
            เสร็จสิ้น เรียบร้อย
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-stone-100 text-stone-800 text-xs font-semibold rounded-full">
            {status}
          </span>
        );
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) + " น.";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-8 h-8 border-2 border-doitung-green border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-stone-400 mt-3">กำลังโหลดประวัติการสั่งซื้อ...</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-slide-up">
        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center text-3xl mb-4">
          📋
        </div>
        <h3 className="font-semibold text-stone-800 text-lg">ยังไม่มีประวัติการสั่งซื้อ</h3>
        <p className="text-sm text-stone-400 mt-2 max-w-xs">
          เมื่อคุณสั่งเครื่องดื่มหรือของหวานผ่านระบบ รายการคำสั่งซื้อของคุณจะปรากฏที่นี่แบบ Real-time ครับ
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 p-4 pb-24 animate-slide-up">
      <h2 className="font-bold text-doitung-green-dark text-lg mb-4">ประวัติการสั่งซื้อของคุณ</h2>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs font-semibold text-stone-400 block">หมายเลขออเดอร์</span>
                <span className="font-bold text-doitung-green-dark text-sm">{order.orderNumber}</span>
              </div>
              <div>{getStatusBadge(order.status)}</div>
            </div>

            <hr className="border-stone-50 mb-3" />

            {/* Items */}
            <div className="space-y-2 mb-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-stone-600">
                    {item.name} <span className="text-xs font-semibold text-stone-400">x{item.quantity}</span>
                  </span>
                  <span className="font-medium text-stone-800">{item.price * item.quantity} THB</span>
                </div>
              ))}
            </div>

            <hr className="border-stone-50 mb-3" />

            {/* Footer */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-400">เวลาสั่ง: {formatDate(order.orderedAt)}</span>
              <div className="text-right">
                <span className="text-stone-400 mr-2">ราคาสุทธิ:</span>
                <span className="font-bold text-doitung-green text-sm">{order.totalAmount} THB</span>
              </div>
            </div>
            
            {order.notes && (
              <div className="bg-stone-50 rounded-xl p-2.5 mt-3 text-xs text-stone-500 border border-stone-100/50">
                📝 <strong>หมายเหตุ:</strong> {order.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
