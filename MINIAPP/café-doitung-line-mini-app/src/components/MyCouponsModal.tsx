import React, { useState } from 'react';
import { UserCoupon } from '../types';
import { X, Tag, Ticket, CheckCircle2, Clock, Sparkles } from 'lucide-react';


interface MyCouponsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCoupons: UserCoupon[];
  onSelectCoupon?: (coupon: UserCoupon) => void;
  onOpenRedeemModal?: () => void;
}

export const MyCouponsModal: React.FC<MyCouponsModalProps> = ({
  isOpen,
  onClose,
  userCoupons,
  onSelectCoupon,
  onOpenRedeemModal
}) => {
  const [activeTab, setActiveTab] = useState<'available' | 'used'>('available');

  if (!isOpen) return null;

  const availableCoupons = userCoupons.filter((c) => !c.isUsed);
  const usedCoupons = userCoupons.filter((c) => c.isUsed);

  const displayedCoupons = activeTab === 'available' ? availableCoupons : usedCoupons;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-[#0F1B12] border border-[#1E3A24] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-white">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950 via-[#132218] to-stone-900 border-b border-[#1E3A24] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#06C755]/20 border border-[#06C755]/40 flex items-center justify-center text-[#06C755]">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center space-x-1.5">
                <span>กระเป๋าคูปองของฉัน</span>
              </h3>
              <p className="text-[11px] text-stone-400">
                คุณมีคูปองพร้อมใช้ <strong className="text-[#06C755] font-bold">{availableCoupons.length}</strong> ใบ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-800/80 text-stone-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-3 bg-[#132218] border-b border-[#1E3A24] grid grid-cols-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('available')}
            className={`py-2 rounded-xl transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'available'
                ? 'bg-[#06C755] text-stone-950 shadow-md font-black'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>พร้อมใช้งาน ({availableCoupons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('used')}
            className={`py-2 rounded-xl transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'used'
                ? 'bg-stone-700 text-white font-black shadow-md'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>ใช้แล้ว / ประวัติ ({usedCoupons.length})</span>
          </button>
        </div>

        {/* Coupon List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {displayedCoupons.length > 0 ? (
            displayedCoupons.map((c) => (
              <div
                key={c.id}
                className={`relative rounded-2xl border overflow-hidden p-3.5 transition flex items-center justify-between ${
                  !c.isUsed
                    ? 'bg-gradient-to-r from-[#142B1B] to-[#1A3823] border-[#06C755]/40 shadow-lg'
                    : 'bg-stone-900/60 border-stone-800 opacity-60 grayscale'
                }`}
              >
                {/* Coupon Design Side Cutouts */}
                <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#0F1B12] border border-[#1E3A24]"></div>
                <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#0F1B12] border border-[#1E3A24]"></div>

                <div className="pl-3 pr-2 space-y-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#06C755]/20 text-[#06C755] text-[10px] font-black tracking-wider uppercase border border-[#06C755]/30">
                      -{c.discountAmount} THB
                    </span>
                    <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
                      {c.code}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-stone-100 truncate">{c.thTitle || c.title}</h4>

                  <p className="text-[10px] text-stone-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-stone-500" />
                    <span>แลกเมื่อ: {new Date(c.redeemedAt).toLocaleDateString('th-TH')}</span>
                  </p>
                </div>

                {/* Right Action / Status */}
                <div className="pl-2 flex-shrink-0">
                  {!c.isUsed ? (
                    <button
                      onClick={() => {
                        if (onSelectCoupon) onSelectCoupon(c);
                        onClose();
                      }}
                      className="px-3 py-2 bg-[#06C755] hover:bg-[#05b34c] text-stone-950 font-black text-xs rounded-xl shadow-md transition flex items-center space-x-1"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span>ใช้เลย</span>
                    </button>
                  ) : (
                    <div className="px-3 py-1.5 bg-stone-800 text-stone-400 font-bold text-[11px] rounded-xl flex items-center space-x-1 border border-stone-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-stone-500" />
                      <span>ใช้แล้ว</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto text-stone-500">
                <Ticket className="w-7 h-7" />
              </div>
              <p className="text-xs text-stone-400 font-medium">
                {activeTab === 'available' ? 'ไม่มีคูปองที่พร้อมใช้งานในขณะนี้' : 'ยังไม่มีประวัติการใช้คูปอง'}
              </p>
              {activeTab === 'available' && onOpenRedeemModal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenRedeemModal();
                  }}
                  className="px-4 py-2 bg-[#06C755] text-stone-950 font-black text-xs rounded-xl shadow-md"
                >
                  กดแลกคูปองด้วยแต้มสะสม
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#132218] border-t border-[#1E3A24] text-center">
          <button
            onClick={() => {
              onClose();
              if (onOpenRedeemModal) onOpenRedeemModal();
            }}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4 text-stone-950 animate-pulse" />
            <span>ไปที่หน้าแลกคูปองเพิ่มด้วยแต้มสะสม</span>
          </button>
        </div>
      </div>
    </div>
  );
};
