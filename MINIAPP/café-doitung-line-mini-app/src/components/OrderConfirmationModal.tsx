'use client';

import React, { useState } from 'react';
import { CheckCircle2, Clock, MapPin, QrCode, Sparkles, X, Coffee, Copy, RefreshCw, Check } from 'lucide-react';
import { OrderResponse } from '../api/orderService';

interface OrderConfirmationModalProps {
  order: OrderResponse | null;
  onClose: () => void;
  onRefreshStatus?: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onRefreshStatus
}) => {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: OrderResponse['status']) => {
    switch (status) {
      case 'received':
        return {
          label: 'รับออเดอร์แล้ว - กำลังรอคิว',
          color: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400 animate-pulse'
        };
      case 'preparing':
        return {
          label: 'บาริสต้ากำลังชงกาแฟ ☕',
          color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-400 animate-ping'
        };
      case 'ready_for_pickup':
        return {
          label: 'พร้อมรับสินค้าที่เคาน์เตอร์! 🎉',
          color: 'bg-emerald-500 text-stone-950 border-emerald-400 font-extrabold',
          dot: 'bg-stone-950 animate-bounce'
        };
      case 'completed':
        return {
          label: 'รับสินค้าเรียบร้อยแล้ว',
          color: 'bg-stone-800 text-stone-300 border-stone-700',
          dot: 'bg-stone-500'
        };
      default:
        return {
          label: 'กำลังดำเนินการ',
          color: 'bg-stone-800 text-stone-300 border-stone-700',
          dot: 'bg-stone-400'
        };
    }
  };

  const statusBadge = getStatusBadge(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0D1610] text-stone-100 rounded-3xl shadow-2xl overflow-hidden border border-[#23422A] max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-250">
        
        {/* Top Header Banner with Ambient Glow */}
        <div className="p-5 bg-gradient-to-b from-[#172D1E] to-[#0D1610] border-b border-[#1E3A24] text-center relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-700/50 transition"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Steaming Coffee Cup / Checkmark Animated Badge */}
          <div className="relative w-16 h-16 mx-auto mb-3 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[#06C755]/20 animate-ping duration-1000"></div>
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#1E4D2B] to-[#06C755] border-2 border-[#C5A059] flex items-center justify-center text-white shadow-xl relative z-10">
              <Coffee className="w-7 h-7 text-[#FDFBF7] animate-pulse" />
            </div>
          </div>

          <h2 className="text-xl font-serif font-bold tracking-tight text-stone-50">
            รับออเดอร์เรียบร้อยแล้ว!
          </h2>
          <p className="text-xs text-emerald-200/90 font-light mt-1">
            ขอบคุณคุณ <strong className="font-semibold text-white">{order.customerName}</strong> บาริสต้ากำลังเตรียมเครื่องดื่มให้คุณ
          </p>
        </div>

        {/* Order Ticket Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Digital Coffee Ticket Pass */}
          <div className="p-4 bg-gradient-to-b from-[#15261A] to-[#101D14] rounded-2xl border border-[#274830] shadow-lg space-y-3 relative overflow-hidden">
            {/* Ambient Corner Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#C5A059]/10 rounded-full blur-xl pointer-events-none"></div>

            <div className="flex items-center justify-between border-b border-[#203A27] pb-3">
              <div>
                <span className="text-[10px] text-emerald-300/80 uppercase tracking-widest font-semibold block">
                  หมายเลขออเดอร์ (Order ID)
                </span>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-2xl font-black font-mono tracking-tight text-[#C5A059]">
                    {order.orderId}
                  </span>
                  <button
                    onClick={handleCopyOrderId}
                    className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 text-stone-300 border border-stone-700/60 text-[10px] transition"
                    title="คัดลอกรหัสออเดอร์"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-[#06C755]" />
                        <span className="text-[#06C755]">คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-stone-400" />
                        <span>คัดลอก</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="w-16 h-16 bg-[#FDFBF7] p-1.5 rounded-xl shadow-md flex flex-col items-center justify-center border border-[#C5A059]/40">
                <QrCode className="w-10 h-10 text-stone-900" />
                <span className="text-[7px] font-mono font-bold text-stone-600 mt-0.5">SCAN TICKET</span>
              </div>
            </div>

            {/* Live Queue Status Badge */}
            <div className="space-y-1 pt-0.5">
              <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
                สถานะคิวปัจจุบัน (Queue Status)
              </div>
              <div className={`p-2.5 rounded-xl border flex items-center space-x-2.5 transition ${statusBadge.color}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${statusBadge.dot}`}></span>
                <span className="font-bold text-xs">{statusBadge.label}</span>
              </div>
            </div>

            {/* Store & Pickup Time Details */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-[#0A140D]/90 p-2.5 rounded-xl border border-[#1E3A24]">
                <div className="text-[10px] text-emerald-300/80 font-semibold flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-[#C5A059]" />
                  <span>สาขาที่มารับ (Pickup Store)</span>
                </div>
                <div className="font-bold text-stone-100 truncate mt-0.5 text-xs">
                  {order.branch || 'Café DoiTung'}
                </div>

              </div>

              <div className="bg-[#0A140D]/90 p-2.5 rounded-xl border border-[#1E3A24]">
                <div className="text-[10px] text-emerald-300/80 font-semibold flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>เวลานัดรับ (Est. Time)</span>
                </div>
                <div className="font-bold text-stone-100 truncate mt-0.5 text-xs">
                  {order.pickupTime}
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Order Summary */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-300 text-xs uppercase tracking-wider">
              รายการสินค้าทั้งหมด ({order.items.reduce((acc, i) => acc + i.quantity, 0)} รายการ)
            </h4>
            <div className="space-y-2.5 bg-[#142217] p-3 rounded-2xl border border-[#1E3A24]">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-start border-b border-[#1E3A24] pb-2.5 last:border-0 last:pb-0 gap-2"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <img
                      src={
                        item.image ||
                        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80'
                      }
                      alt={item.itemName}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-xl object-cover border border-stone-800 flex-shrink-0"
                    />
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-bold text-stone-100 text-xs truncate">
                        {item.itemName} <span className="text-[#06C755] font-extrabold">x{item.quantity}</span>
                      </div>
                      <div className="text-[10px] text-stone-400 space-x-1 truncate">
                        <span>{item.temp}</span>
                        <span>•</span>
                        <span>หวาน {item.sweetness}</span>
                        {item.milk && item.milk !== 'Standard Dairy' && (
                          <>
                            <span>•</span>
                            <span className="text-amber-300 font-medium">{item.milk}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="font-extrabold text-[#C5A059] flex-shrink-0 text-xs sm:text-sm">
                    ฿{item.price.toLocaleString()}
                  </span>
                </div>
              ))}

              {/* Discount Status & Total */}
              <div className="pt-2 border-t border-[#1E3A24] space-y-1 text-xs">
                {order.appliedCouponTitle || (order.discountAmount && order.discountAmount > 0) ? (
                  <div className="flex justify-between items-center text-emerald-400 font-semibold">
                    <span>🎟️ ส่วนลดคูปอง ({order.appliedCouponTitle || 'คูปองพิเศษ'})</span>
                    <span>-฿{order.discountAmount || 0}</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-stone-400 font-normal text-[11px]">
                    <span>🏷️ สิทธิ์ส่วนลด</span>
                    <span>ไม่ได้ใช้คูปองส่วนลด</span>
                  </div>
                )}

                <div className="flex justify-between items-center font-extrabold text-sm text-stone-50 pt-1 border-t border-[#1E3A24]/60">
                  <span>ยอดรวมทั้งหมด</span>
                  <span className="text-amber-400 text-base">฿{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>


          {/* Barista Counter Banner */}
          <div className="p-3 bg-gradient-to-r from-amber-950/40 to-stone-900 border border-amber-800/50 rounded-2xl text-amber-200 text-center space-y-1">
            <div className="font-bold text-xs flex items-center justify-center space-x-1.5 text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin duration-3000" />
              <span>แสดงหน้าจอนี้แก่พนักงานบาริสต้า</span>
            </div>
            <p className="text-[11px] text-amber-200/80 font-light">
              กรุณาแจ้งหมายเลขออเดอร์ <strong className="font-mono text-amber-300 font-black">{order.orderId}</strong> ที่เคาน์เตอร์เพื่อรับสินค้า
            </p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-3.5 bg-[#142217] border-t border-[#1E3A24] flex items-center space-x-2">
          {onRefreshStatus && (
            <button
              onClick={onRefreshStatus}
              className="p-2.5 rounded-xl border border-stone-700/80 bg-stone-900 text-stone-200 hover:bg-stone-800 transition flex items-center space-x-1.5 text-xs font-semibold"
              title="อัปเดตสถานะคิว"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>สถานะ</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-[#06C755] hover:bg-[#05b34c] active:scale-98 text-stone-950 font-black rounded-xl shadow-lg transition text-center text-xs"
          >
            กลับสู่หน้าหลัก (Back to Menu)
          </button>
        </div>
      </div>
    </div>
  );
};
