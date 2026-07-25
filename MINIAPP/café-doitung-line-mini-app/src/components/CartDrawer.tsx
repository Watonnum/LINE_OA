'use client';

import React, { useState, useEffect } from 'react';
import { X, Trash2, Clock, User, Phone, MessageSquare, ShoppingBag, Leaf, ChevronRight, Loader2, AlertCircle, Sparkles, LogIn, Gift, Tag } from 'lucide-react';
import { CartItem, LineUserProfile, UserCoupon } from '../types';
import { PICKUP_TIMES } from '../data/menuData';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  lineUserProfile?: LineUserProfile | null;
  userBeans?: number;
  onOpenRedeemModal?: () => void;
  appliedCoupon?: UserCoupon | null;
  onSelectCoupon?: (coupon: UserCoupon | null) => void;
  userCoupons?: UserCoupon[];
  onOpenMyCoupons?: () => void;
  onSubmitOrder: (orderPayload: {
    pickupTime: string;
    customerName: string;
    customerPhone: string;
    note: string;
    appliedCouponCode?: string;
    discountAmount?: number;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onClearCart,
  isLoggedIn,
  onLogin,
  lineUserProfile,
  userBeans = 0,
  onOpenRedeemModal,
  appliedCoupon,
  onSelectCoupon,
  userCoupons = [],
  onOpenMyCoupons,
  onSubmitOrder,
  isSubmitting
}) => {

  if (!isOpen) return null;

  const [pickupTimeOption, setPickupTimeOption] = useState<string>('ASAP (10-15 mins)');
  const [customTime, setCustomTime] = useState<string>('15:30');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('0812345678');
  const [baristaNote, setBaristaNote] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Sync customer name from LINE profile when opened or when profile loads
  useEffect(() => {
    if (lineUserProfile?.displayName && (!customerName || customerName === 'Guest')) {
      setCustomerName(lineUserProfile.displayName);
    }
  }, [lineUserProfile, isOpen]);

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalEcoCount = cartItems.reduce(
    (count, item) => count + (item.customization.ecoCup ? item.customization.quantity : 0),
    0
  );
  const totalEcoDiscount = totalEcoCount * 5;

  const isFreeDrinkCoupon =
    appliedCoupon &&
    (appliedCoupon.couponId === 'c3' ||
      appliedCoupon.thTitle?.includes('ฟรี') ||
      appliedCoupon.title?.toLowerCase().includes('free'));

  const coffeeItems = cartItems.filter(
    (i) => i.menuItem.category === 'coffee' || Boolean(i.customization.temp)
  );

  let couponDiscount = 0;
  let freeDrinkWarning = false;

  if (appliedCoupon) {
    if (isFreeDrinkCoupon) {
      if (coffeeItems.length > 0) {
        const maxCoffeePrice = Math.max(
          ...coffeeItems.map((i) =>
            i.calculatedPricePerUnit
              ? i.calculatedPricePerUnit
              : Math.round(i.totalPrice / i.customization.quantity)
          )
        );
        couponDiscount = Math.min(maxCoffeePrice, appliedCoupon.discountAmount || 105);
      } else {
        freeDrinkWarning = true;
        couponDiscount = 0;
      }
    } else {
      couponDiscount = appliedCoupon.discountAmount || 0;
    }
  }

  const finalTotal = Math.max(0, subtotal - totalEcoDiscount - couponDiscount);
  const pointsEarned = Math.floor(finalTotal / 20);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    if (freeDrinkWarning) {
      setErrorMessage('คูปอง "ฟรี! กาแฟ 1 แก้ว" ต้องมีเมนูกาแฟในตะกร้าอย่างน้อย 1 รายการ');
      return;
    }


    if (!customerName.trim()) {
      setErrorMessage('Please enter customer name for pick-up counter call.');
      return;
    }

    if (!customerPhone.trim()) {
      setErrorMessage('Please enter mobile phone number.');
      return;
    }

    const finalPickupTime =
      pickupTimeOption === 'Specific Time (เวลาตามระบุ)'
        ? `Specific Time (${customTime})`
        : pickupTimeOption;

    try {
      await onSubmitOrder({
        pickupTime: finalPickupTime,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        note: baristaNote.trim(),
        appliedCouponCode: appliedCoupon?.code,
        discountAmount: couponDiscount
      });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to create order. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-[#0A110C] text-stone-100 h-full flex flex-col shadow-2xl overflow-hidden border-l border-[#1E3A24]">
        {/* Header */}
        <div className="p-4 bg-[#132218] border-b border-[#1E3A24] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1E4D2B] flex items-center justify-center text-[#06C755] border border-emerald-700/50">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Your Shopping Cart</h2>
              <p className="text-[11px] text-emerald-200/80">
                {cartItems.length} items • Pickup at Café DoiTung
              </p>

            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="m-3 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Content Scrollable */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto text-stone-500">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-stone-300">Your Cart is Currently Empty</h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Explore Café DoiTung specialty coffee and fresh bakery items to add to your order.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-stone-300">
                <span>Selected Items ({cartItems.length})</span>
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-stone-400 hover:text-rose-400 text-[11px] flex items-center space-x-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>

              {/* Cart Items List */}
              <div className="space-y-2">
                {cartItems.map((ci) => (
                  <div
                    key={ci.cartItemId}
                    className="p-3 rounded-xl bg-[#132218] border border-[#1E3A24] flex items-center justify-between space-x-3"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={ci.menuItem.image}
                        alt={ci.menuItem.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-stone-800 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{ci.menuItem.name}</h4>
                        <div className="text-[10px] text-stone-400 space-x-1.5 truncate mt-0.5">
                          <span>{ci.customization.temp}</span>
                          <span>•</span>
                          <span>{ci.customization.sweetness} Sweet</span>
                          {ci.customization.ecoCup && (
                            <>
                              <span>•</span>
                              <span className="text-[#06C755] font-semibold">Eco Cup</span>
                            </>
                          )}
                        </div>
                        <div className="text-xs font-bold text-[#C5A059] mt-0.5">
                          ฿{ci.totalPrice} <span className="text-[10px] text-stone-500 font-normal">({ci.customization.quantity}x)</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(ci.cartItemId)}
                      className="p-1 text-stone-500 hover:text-rose-400 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coupon & Rewards Section */}
          <div className="p-3.5 bg-[#132218] rounded-2xl border border-[#1E3A24] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Tag className="w-4 h-4 text-[#06C755]" />
                <span>คูปองส่วนลด</span>
              </span>
              <div className="flex items-center space-x-2">
                {onOpenMyCoupons && (
                  <button
                    type="button"
                    onClick={onOpenMyCoupons}
                    className="text-[11px] font-bold text-[#06C755] hover:underline flex items-center space-x-1 bg-[#06C755]/15 px-2 py-0.5 rounded-lg border border-[#06C755]/40"
                  >
                    <span>คูปองของฉัน ({userCoupons.filter((c) => !c.isUsed).length})</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onOpenRedeemModal}
                  className="text-[11px] font-bold text-[#C5A059] hover:underline flex items-center space-x-1"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>แลกแต้ม ({userBeans} แต้ม)</span>
                </button>
              </div>
            </div>


            {(() => {
              const availableCoupons = userCoupons.filter((c) => !c.isUsed);
              return availableCoupons.length > 0 ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] text-stone-400 block">เลือกคูปองที่ต้องการใช้:</label>
                  <select
                    value={appliedCoupon?.id || ''}
                    onChange={(e) => {
                      const found = availableCoupons.find((c) => c.id === e.target.value);
                      if (onSelectCoupon) onSelectCoupon(found || null);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white focus:outline-none focus:border-[#06C755]"
                  >
                    <option value="">-- ไม่ใช้คูปอง --</option>
                    {availableCoupons.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.thTitle} (-฿{c.discountAmount})
                      </option>
                    ))}
                  </select>
                  {freeDrinkWarning && (
                    <div className="p-2.5 bg-amber-950/80 border border-amber-800/60 rounded-xl text-[11px] text-amber-200 space-y-1">
                      <p className="font-bold text-amber-400">
                        ⚠️ สิทธิ์คูปอง "ฟรี! กาแฟ 1 แก้ว" (ลดสูงสุด 105.-)
                      </p>
                      <p className="text-[10px] text-amber-200/90">
                        ต้องมีเมนูกาแฟในตะกร้าอย่างน้อย 1 รายการเพื่อใช้สิทธิ์ฟรีแก้วนี้
                      </p>
                    </div>
                  )}
                </div>

              ) : (
                <p className="text-[11px] text-stone-400">
                  คุณยังไม่มีคูปองส่วนลดพร้อมใช้ สามารถกดปุ่ม <strong className="text-[#C5A059]">"แลกคูปองด้วยแต้ม"</strong> เพื่อแลกรับส่วนลดได้เลย!
                </p>
              );
            })()}

          </div>

          {/* Pickup Details & Customer Form */}
          <div className="space-y-3 pt-1">
            <h3 className="text-xs font-bold text-[#06C755] uppercase tracking-wider">
              Pickup Information & Customer Detail
            </h3>

            <div className="p-3 bg-[#132218] rounded-xl border border-[#1E3A24] space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-stone-300 block mb-1">
                  Estimated Pickup Time
                </label>
                <select
                  value={pickupTimeOption}
                  onChange={(e) => setPickupTimeOption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#1E3A24] bg-stone-900 text-white text-xs focus:ring-2 focus:ring-[#06C755] focus:outline-none"
                >
                  {PICKUP_TIMES.map((t) => (
                    <option key={t.id} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>

              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-300 block mb-1">
                  Customer Name for Counter Call <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Narin S. / คุณนรินทร์"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#1E3A24] bg-stone-900 text-white text-xs focus:ring-2 focus:ring-[#06C755] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-300 block mb-1">
                  Mobile Phone Number <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0812345678"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#1E3A24] bg-stone-900 text-white text-xs focus:ring-2 focus:ring-[#06C755] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-300 block mb-1">
                  Note to Barista (Optional)
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                  <textarea
                    rows={2}
                    placeholder="e.g. Extra hot drip, light ice on latte"
                    value={baristaNote}
                    onChange={(e) => setBaristaNote(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#1E3A24] bg-stone-900 text-white text-xs focus:ring-2 focus:ring-[#06C755] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="p-3.5 bg-[#132218] rounded-2xl space-y-1.5 text-xs text-stone-300 border border-[#1E3A24]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-white">฿{subtotal.toLocaleString()}</span>
            </div>

            {totalEcoDiscount > 0 && (
              <div className="flex justify-between text-[#06C755] font-medium">
                <span className="flex items-center space-x-1">
                  <Leaf className="w-3 h-3 text-[#06C755]" />
                  <span>Eco-Cup Discount ({totalEcoCount} drinks)</span>
                </span>
                <span>-฿{totalEcoDiscount}</span>
              </div>
            )}

            {couponDiscount > 0 && (
              <div className="flex justify-between text-amber-400 font-bold">
                <span>คูปองส่วนลด ({appliedCoupon?.title})</span>
                <span>-฿{couponDiscount}</span>
              </div>
            )}

            <div className="flex justify-between text-stone-400 text-[11px]">
              <span>VAT (7% Included)</span>
              <span>฿{Math.round(finalTotal * 0.07)}</span>
            </div>

            <div className="pt-2 border-t border-[#1E3A24] flex justify-between items-center font-extrabold text-white text-sm">
              <div>
                <span>Total Amount</span>
                <span className="text-[10px] text-[#06C755] font-bold block">
                  ได้รับแต้มสะสม +{pointsEarned} แต้ม
                </span>
              </div>
              <span className="text-amber-400 text-base">฿{finalTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Submit / Login Button */}
          {!isLoggedIn ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={onLogin}
                className="w-full py-3.5 px-4 bg-[#06C755] hover:bg-[#05b34c] active:bg-[#049a41] text-stone-950 font-black rounded-2xl shadow-md active:scale-98 transition flex items-center justify-center space-x-2 text-sm"
              >
                <LogIn className="w-5 h-5 text-stone-950" />
                <span>Login with LINE (เข้าสู่ระบบด้วย LINE)</span>
              </button>
            </div>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || cartItems.length === 0}
              className="w-full py-3.5 px-4 bg-[#06C755] hover:bg-[#05b34c] text-stone-950 font-black rounded-2xl shadow-md active:scale-98 transition flex items-center justify-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Pre-Order...</span>
                </>
              ) : (
                <>
                  <span>Place Pre-Order (สั่งสินค้า)</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
