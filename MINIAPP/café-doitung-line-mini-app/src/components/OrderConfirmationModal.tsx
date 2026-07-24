'use client';

import React from 'react';

import { CheckCircle2, Clock, MapPin, QrCode, Phone, Sparkles, X, Coffee, Copy, RefreshCw, ChevronRight } from 'lucide-react';
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
  if (!order) return null;

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.orderId);
    alert(`Order ID ${order.orderId} copied to clipboard!`);
  };

  const getStatusBadge = (status: OrderResponse['status']) => {
    switch (status) {
      case 'received':
        return {
          label: 'Received - In Queue',
          color: 'bg-amber-100 text-amber-900 border-amber-300',
          dot: 'bg-amber-500'
        };
      case 'preparing':
        return {
          label: 'Barista Brewing Now ☕',
          color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          dot: 'bg-emerald-600 animate-pulse'
        };
      case 'ready_for_pickup':
        return {
          label: 'Ready for Counter Pickup! 🎉',
          color: 'bg-green-600 text-white border-green-700 font-bold',
          dot: 'bg-white'
        };
      case 'completed':
        return {
          label: 'Picked Up & Completed',
          color: 'bg-stone-200 text-stone-700 border-stone-300',
          dot: 'bg-stone-500'
        };
      default:
        return {
          label: 'Processing',
          color: 'bg-stone-100 text-stone-800',
          dot: 'bg-stone-400'
        };
    }
  };

  const statusBadge = getStatusBadge(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-[#0F1812] text-stone-100 rounded-3xl shadow-2xl overflow-hidden border border-[#1E3A24] max-h-[92vh] flex flex-col">
        {/* Success Header Banner */}
        <div className="p-5 bg-[#132218] border-b border-[#1E3A24] text-white text-center relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1 rounded-full bg-stone-900/80 text-stone-300 hover:text-white border border-stone-800"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-full bg-[#06C755] text-stone-950 flex items-center justify-center mx-auto mb-2 shadow-lg font-black">
            <CheckCircle2 className="w-8 h-8 text-stone-950" />
          </div>

          <h2 className="text-xl font-black tracking-tight text-white">
            Order Confirmed!
          </h2>
          <p className="text-xs text-emerald-400 mt-0.5">
            Thank you, {order.customerName}! Your coffee is being prepared.
          </p>
        </div>

        {/* Order Details Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Order Ticket Card */}
          <div className="p-4 bg-[#132218] rounded-2xl border-2 border-dashed border-[#06C755]/40 shadow-xs space-y-3 relative">
            <div className="flex items-center justify-between border-b border-[#1E3A24] pb-2.5">
              <div>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold block">
                  Pick-up Order ID
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-black font-mono text-amber-400">
                    {order.orderId}
                  </span>
                  <button
                    onClick={handleCopyOrderId}
                    className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300"
                    title="Copy Order ID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* QR Code / Barcode Simulation */}
              <div className="w-16 h-16 bg-white p-1 rounded-xl flex flex-col items-center justify-center">
                <QrCode className="w-10 h-10 text-stone-900" />
                <span className="text-[8px] font-mono text-stone-700 mt-0.5">SCAN</span>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="space-y-1">
              <div className="text-[10px] text-stone-400 uppercase font-semibold">Current Queue Status</div>
              <div className={`p-2.5 rounded-xl border flex items-center space-x-2 ${statusBadge.color}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${statusBadge.dot}`}></span>
                <span className="font-bold text-xs">{statusBadge.label}</span>
              </div>
            </div>

            {/* Branch & Time */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-stone-300">
              <div className="bg-stone-900/80 p-2.5 rounded-xl border border-stone-800">
                <div className="text-[10px] text-stone-400 font-semibold flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-[#06C755]" />
                  <span>Pick-up Store</span>
                </div>
                <div className="font-bold text-white truncate mt-0.5 text-xs">
                  {order.branch}
                </div>
              </div>

              <div className="bg-stone-900/80 p-2.5 rounded-xl border border-stone-800">
                <div className="text-[10px] text-stone-400 font-semibold flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Est. Time</span>
                </div>
                <div className="font-bold text-white truncate mt-0.5 text-xs">
                  {order.pickupTime}
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Receipt Summary */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-200 text-xs uppercase tracking-wide">
              Items Ordered ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
            </h4>
            <div className="space-y-1.5 bg-[#132218] p-3 rounded-2xl border border-[#1E3A24]">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-start border-b border-[#1E3A24] pb-1.5 last:border-0 last:pb-0"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white text-xs">
                      {item.itemName} <span className="text-[#06C755] font-black">x{item.quantity}</span>
                    </div>
                    <div className="text-[10px] text-stone-400 space-x-1.5">
                      <span>{item.temp}</span>
                      <span>•</span>
                      <span>Sweetness {item.sweetness}</span>
                      {item.milk && item.milk !== 'Standard Dairy' && (
                        <>
                          <span>•</span>
                          <span className="text-amber-300 font-medium">{item.milk}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-amber-400">฿{item.price.toLocaleString()}</span>
                </div>
              ))}

              <div className="pt-2 border-t border-[#1E3A24] flex justify-between font-extrabold text-sm text-white">
                <span>Total Amount</span>
                <span className="text-amber-400">฿{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Barista Counter Prompt Banner */}
          <div className="p-3 bg-amber-950/50 border border-amber-800/80 rounded-2xl text-amber-200 text-center space-y-1">
            <div className="font-bold text-xs flex items-center justify-center space-x-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Show this screen at the counter</span>
            </div>
            <p className="text-[11px] text-amber-300/80">
              Please present your Order ID <strong className="font-mono text-amber-300 font-black">{order.orderId}</strong> to the barista when picking up your beverage.
            </p>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-3.5 bg-[#132218] border-t border-[#1E3A24] flex items-center space-x-2">
          {onRefreshStatus && (
            <button
              onClick={onRefreshStatus}
              className="p-2.5 rounded-xl border border-stone-700 bg-stone-900 text-stone-200 hover:bg-stone-800 transition flex items-center space-x-1 text-xs font-semibold"
              title="Refresh Queue Status"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Status</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-[#06C755] hover:bg-[#05b34c] text-stone-950 font-black rounded-xl shadow-xs transition text-center text-xs"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};
