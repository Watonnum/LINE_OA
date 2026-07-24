'use client';

import React, { useState, useEffect } from 'react';
import { Coffee, Clock, CheckCircle2, RefreshCw, Phone, User, MapPin, AlertCircle, Sparkles, Filter, Leaf } from 'lucide-react';
import { fetchOrders, updateOrderStatus, OrderResponse } from '../api/orderService';

export const BaristaQueueView: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('active');

  const loadOrders = async () => {
    setIsLoading(true);
    const data = await fetchOrders();
    setOrders(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadOrders();
    // Auto refresh every 8 seconds for live counter feel
    const timer = setInterval(loadOrders, 8000);
    return () => clearInterval(timer);
  }, []);

  const handleStatusChange = async (
    orderId: string,
    newStatus: 'received' | 'preparing' | 'ready_for_pickup' | 'completed'
  ) => {
    const updated = await updateOrderStatus(orderId, newStatus);
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.orderId === orderId ? updated : o)));
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'active') return o.status === 'received' || o.status === 'preparing';
    if (filterStatus === 'ready') return o.status === 'ready_for_pickup';
    if (filterStatus === 'completed') return o.status === 'completed';
    return true;
  });

  const activeCount = orders.filter((o) => o.status === 'received' || o.status === 'preparing').length;
  const readyCount = orders.filter((o) => o.status === 'ready_for_pickup').length;
  const ecoCupsCount = orders.reduce(
    (acc, o) => acc + o.items.reduce((sum, i) => sum + (i.ecoCup ? i.quantity : 0), 0),
    0
  );

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto pb-24">
      {/* Barista Header Banner */}
      <div className="p-4 rounded-2xl bg-stone-900 text-white shadow-md flex items-center justify-between border border-stone-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <h2 className="text-base font-bold text-stone-100 flex items-center space-x-1.5">
              <Coffee className="w-5 h-5 text-amber-400 inline" />
              <span>Barista Pickup Queue Dashboard</span>
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            Real-Time Express Server Orders Feed • Café DoiTung
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-emerald-400 text-xs font-semibold flex items-center space-x-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 bg-white rounded-2xl border border-stone-200 text-center shadow-xs">
          <div className="text-[10px] text-stone-500 font-semibold uppercase">Brewing Queue</div>
          <div className="text-xl font-extrabold text-amber-600 mt-0.5">{activeCount}</div>
        </div>

        <div className="p-3 bg-white rounded-2xl border border-stone-200 text-center shadow-xs">
          <div className="text-[10px] text-stone-500 font-semibold uppercase">Ready at Counter</div>
          <div className="text-xl font-extrabold text-emerald-600 mt-0.5">{readyCount}</div>
        </div>

        <div className="p-3 bg-emerald-900 text-emerald-100 rounded-2xl text-center shadow-xs">
          <div className="text-[10px] text-emerald-300 font-semibold uppercase flex items-center justify-center space-x-1">
            <Leaf className="w-3 h-3 text-emerald-400" />
            <span>Eco Cups Saved</span>
          </div>
          <div className="text-xl font-extrabold text-amber-300 mt-0.5">{ecoCupsCount}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1.5 bg-stone-200/70 p-1 rounded-xl text-xs font-semibold">
        {[
          { id: 'active', label: `In Progress (${activeCount})` },
          { id: 'ready', label: `Ready (${readyCount})` },
          { id: 'completed', label: 'Completed' },
          { id: 'all', label: `All Orders (${orders.length})` }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterStatus(f.id)}
            className={`flex-1 py-1.5 rounded-lg transition text-center ${
              filterStatus === f.id
                ? 'bg-[#1E4D2B] text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-2xl border border-stone-200 space-y-2">
          <Coffee className="w-8 h-8 text-stone-300 mx-auto" />
          <p className="text-stone-500 text-xs font-medium">No orders in this queue filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((o) => (
            <div
              key={o.orderId}
              className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between border-b border-stone-100 pb-2.5">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-black font-mono text-[#1E4D2B]">
                      {o.orderId}
                    </span>
                    <span className="text-xs font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-full">
                      {o.customerName}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500 flex items-center space-x-2 mt-0.5">
                    <span className="flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-stone-400" />
                      <span>{o.customerPhone}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>{o.pickupTime}</span>
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                    o.status === 'received'
                      ? 'bg-amber-100 text-amber-900'
                      : o.status === 'preparing'
                      ? 'bg-emerald-100 text-emerald-900'
                      : o.status === 'ready_for_pickup'
                      ? 'bg-green-600 text-white'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {o.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-1 text-xs">
                {o.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-stone-800">
                    <div>
                      <span className="font-bold text-[#1E4D2B]">{item.quantity}x</span>{' '}
                      <span className="font-semibold">{item.itemName}</span>{' '}
                      <span className="text-stone-500 text-[11px]">
                        ({item.temp}, Sugar: {item.sweetness}
                        {item.milk && item.milk !== 'Standard Dairy' ? `, ${item.milk}` : ''})
                      </span>
                      {item.ecoCup && (
                        <span className="ml-1.5 inline-flex items-center text-[10px] text-emerald-800 bg-emerald-50 px-1 py-0.2 rounded font-semibold">
                          <Leaf className="w-2.5 h-2.5 mr-0.5" /> Eco Cup
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-stone-900">฿{item.price}</span>
                  </div>
                ))}
              </div>

              {o.note && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-medium">
                  <strong>Barista Note:</strong> "{o.note}"
                </div>
              )}

              {/* Action Buttons to update status */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-end space-x-2">
                {o.status === 'received' && (
                  <button
                    onClick={() => handleStatusChange(o.orderId, 'preparing')}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Start Brewing ☕
                  </button>
                )}

                {o.status === 'preparing' && (
                  <button
                    onClick={() => handleStatusChange(o.orderId, 'ready_for_pickup')}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Mark Ready for Counter 🎉
                  </button>
                )}

                {o.status === 'ready_for_pickup' && (
                  <button
                    onClick={() => handleStatusChange(o.orderId, 'completed')}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Complete Pickup ✓
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
