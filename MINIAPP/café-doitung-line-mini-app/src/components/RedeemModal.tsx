'use client';

import React, { useState } from 'react';
import { Gift, Sparkles, CheckCircle2, X, Tag, Coffee } from 'lucide-react';
import { CouponReward, UserCoupon } from '../types';
import { redeemUserCoupon } from '../services/userService';

interface RedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  userBeans: number;
  onPointsUpdated: (newPoints: number) => void;
  onCouponRedeemed?: (coupon: UserCoupon) => void;
}

export const REWARDS_CATALOG: CouponReward[] = [
  {
    id: 'rew_disc_20',
    title: 'THB 20 Discount Voucher',
    thTitle: 'คูปองส่วนลด 20 บาท',
    description: 'ใช้เป็นส่วนลดสำหรับการสั่งซื้อกาแฟและเครื่องดื่มทุกชนิด',
    pointsRequired: 40,
    discountAmount: 20,
    type: 'discount',
    code: 'DT-DISC20'
  },
  {
    id: 'rew_disc_50',
    title: 'THB 50 Discount Voucher',
    thTitle: 'คูปองส่วนลด 50 บาท',
    description: 'ใช้เป็นส่วนลดสำหรับการสั่งซื้อครบ 150 บาทขึ้นไป',
    pointsRequired: 80,
    discountAmount: 50,
    type: 'discount',
    code: 'DT-DISC50'
  },
  {
    id: 'rew_free_coffee',
    title: 'Free Coffee Voucher',
    thTitle: 'ฟรี! กาแฟดอยตุง 1 แก้ว (มูลค่าสูงสุด 105.-)',
    description: 'แลกรับฟรี DoiTung Signature Drip Coffee หรือเมนูกาแฟสดร้อน/เย็น 1 แก้ว',
    pointsRequired: 120,
    discountAmount: 105,
    type: 'free_drink',
    code: 'DT-FREECOFFEE'
  }
];

export const RedeemModal: React.FC<RedeemModalProps> = ({
  isOpen,
  onClose,
  userId,
  userBeans,
  onPointsUpdated,
  onCouponRedeemed
}) => {
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRedeem = async (reward: CouponReward) => {
    if (redeemingId !== null) return;

    const activeUserId = userId || 'guest_user';

    if (userBeans < reward.pointsRequired) {
      alert(`แต้มไม่พอ คุณมี ${userBeans} แต้ม ต้องการ ${reward.pointsRequired} แต้ม`);
      return;
    }

    setRedeemingId(reward.id);
    try {
      const res = await redeemUserCoupon(activeUserId, reward, userBeans);
      if (res.success && res.coupon) {
        onPointsUpdated(res.newPoints);
        if (onCouponRedeemed) onCouponRedeemed(res.coupon);
        setSuccessMessage(`แลกสำเร็จ! ได้รับ "${reward.thTitle}" เรียบร้อยแล้ว`);
        setTimeout(() => setSuccessMessage(null), 3500);
      } else {
        alert('เกิดข้อผิดพลาดในการแลกคูปอง กรุณาลองใหม่อีกครั้ง');
      }
    } catch (err) {
      console.error('Redeem error:', err);
    } finally {
      setRedeemingId(null);
    }
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-[#132218] border border-[#1E3A24] rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#1E4D2B] to-emerald-950 flex items-center justify-between border-b border-emerald-800/40">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-[#C5A059]/20 border border-[#C5A059]/50 flex items-center justify-center text-[#C5A059]">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">แลกคูปองส่วนลด</h3>
              <p className="text-[11px] text-stone-300">ใช้แต้มแลกส่วนลดและกาแฟฟรี</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="px-2.5 py-1 rounded-full bg-stone-950/80 border border-[#C5A059]/40 text-xs font-black text-[#C5A059]">
              +{userBeans} แต้ม
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Toast Banner */}
        {successMessage && (
          <div className="bg-emerald-900/90 border-b border-emerald-600 px-4 py-2 text-xs font-bold text-emerald-200 flex items-center space-x-2 animate-in slide-in-from-top">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Rewards List */}
        <div className="p-4 overflow-y-auto space-y-3">
          {REWARDS_CATALOG.map((reward) => {
            const canRedeem = userBeans >= reward.pointsRequired;
            const isRedeeming = redeemingId === reward.id;

            return (
              <div
                key={reward.id}
                className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800 flex items-center justify-between space-x-3 transition hover:border-emerald-800/60"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-[#06C755] flex-shrink-0">
                    {reward.type === 'free_drink' ? (
                      <Coffee className="w-5 h-5 text-[#C5A059]" />
                    ) : (
                      <Tag className="w-5 h-5 text-[#06C755]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {reward.thTitle}
                    </h4>
                    <p className="text-[10px] text-stone-400 leading-normal mt-0.5">
                      {reward.description}
                    </p>
                    <span className="text-[10px] text-[#C5A059] font-extrabold mt-1 block">
                      ใช้ {reward.pointsRequired} แต้ม
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRedeem(reward)}
                  disabled={!canRedeem || isRedeeming}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition flex-shrink-0 ${
                    canRedeem
                      ? 'bg-[#06C755] hover:bg-[#05b34c] text-stone-950 shadow-md active:scale-95'
                      : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                  }`}
                >
                  {isRedeeming ? 'กำลังแลก...' : canRedeem ? 'แลกคูปอง' : 'แต้มไม่พอ'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
