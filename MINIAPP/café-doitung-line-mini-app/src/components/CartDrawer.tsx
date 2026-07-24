'use client';

import React, { useState, useEffect } from 'react';
import { X, Trash2, Clock, User, Phone, MessageSquare, ShoppingBag, Leaf, ChevronRight, Loader2, AlertCircle, Sparkles, LogIn, Lock } from 'lucide-react';
import { CartItem, Branch, LineUserProfile } from '../types';

import { PICKUP_TIMES } from '../data/menuData';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  selectedBranch: Branch;
  isLoggedIn: boolean;
  onLogin: () => void;
  lineUserProfile?: LineUserProfile | null;
  onSubmitOrder: (orderPayload: {
    pickupTime: string;
    customerName: string;
    customerPhone: string;
    note: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onClearCart,
  selectedBranch,
  isLoggedIn,
  onLogin,
  lineUserProfile,
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

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Please enter your name for counter pickup verification.');
      return;
    }

    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      setErrorMessage('Please enter a valid mobile phone number.');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    const finalPickupTime =
      pickupTimeOption === 'Custom Time'
        ? `Custom (${customTime})`
        : pickupTimeOption;

    try {
      await onSubmitOrder({
        pickupTime: finalPickupTime,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        note: baristaNote.trim()
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place pre-order. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-[#0F1812] text-stone-100 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-[#1E3A24] max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-[#132218] border-b border-[#1E3A24] text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-bold text-base text-white">
                Pre-Order Summary
              </h2>
              <p className="text-xs text-emerald-400">{selectedBranch.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto p-4 space-y-5 text-sm">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Cart Item List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-200 text-xs uppercase tracking-wide">
                1. Order Items ({cartItems.reduce((acc, i) => acc + i.customization.quantity, 0)})
              </h3>
              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-xs text-rose-400 hover:underline flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {cartItems.length === 0 ? (
              <div className="p-8 text-center bg-[#132218] rounded-2xl border border-dashed border-[#1E3A24] space-y-2">
                <ShoppingBag className="w-8 h-8 text-stone-600 mx-auto" />
                <p className="text-stone-400 font-medium text-xs">Your cart is currently empty.</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-[#06C755] text-stone-950 text-xs rounded-xl font-black"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {cartItems.map((ci) => {
                  const cust = ci.customization;
                  return (
                    <div
                      key={ci.cartItemId}
                      className="p-3 bg-[#132218] rounded-xl border border-[#1E3A24] shadow-xs flex items-start justify-between space-x-2"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-sm">
                            {ci.menuItem.name}
                          </span>
                          <span className="text-xs font-black text-stone-950 bg-[#06C755] px-1.5 py-0.2 rounded-full">
                            x{cust.quantity}
                          </span>
                        </div>

                        {/* Customization Badges */}
                        <div className="flex flex-wrap gap-1 text-[10px] text-stone-300 pt-0.5">
                          {cust.temp && (
                            <span className="bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800">
                              {cust.temp}
                            </span>
                          )}
                          {cust.sweetness && (
                            <span className="bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800">
                              Sugar: {cust.sweetness}
                            </span>
                          )}
                          {cust.milk && cust.milk !== 'Standard Dairy' && (
                            <span className="bg-amber-950/60 text-amber-300 px-1.5 py-0.5 rounded border border-amber-800/80 font-medium">
                              {cust.milk}
                            </span>
                          )}
                          {cust.extraShot && (
                            <span className="bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800">
                              +Extra Shot
                            </span>
                          )}
                          {cust.macadamiaDrizzle && (
                            <span className="bg-amber-950/60 text-amber-300 px-1.5 py-0.5 rounded border border-amber-800/80">
                              +Macadamia Drizzle
                            </span>
                          )}
                          {cust.ecoCup && (
                            <span className="bg-emerald-950 text-emerald-300 font-semibold px-1.5 py-0.5 rounded border border-emerald-800 flex items-center space-x-0.5">
                              <Leaf className="w-2.5 h-2.5 inline text-[#06C755]" />
                              <span>Eco Cup (-฿5)</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end justify-between self-stretch">
                        <span className="font-black text-sm text-amber-400">
                          ฿{ci.totalPrice.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(ci.cartItemId)}
                          className="text-stone-500 hover:text-rose-400 p-1 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pickup Time Selector */}
          <div className="space-y-2">
            <label className="font-bold text-stone-200 text-xs uppercase tracking-wide flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-[#06C755]" />
              <span>2. Estimated Pickup Time</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PICKUP_TIMES.map((t) => {
                const isSelected = pickupTimeOption === t.value;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setPickupTimeOption(t.value)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                      isSelected
                        ? 'border-[#06C755] bg-[#06C755] text-stone-950 font-black shadow-md'
                        : 'border-[#1E3A24] bg-[#132218] text-stone-300 hover:border-emerald-600'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {pickupTimeOption === 'Custom Time' && (
              <div className="mt-2 p-2.5 bg-[#132218] rounded-xl border border-[#1E3A24] flex items-center justify-between">
                <span className="text-xs text-stone-300 font-medium">Select pickup time:</span>
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-stone-700 bg-stone-900 text-xs font-bold text-emerald-400"
                />
              </div>
            )}
          </div>

          {/* Customer Details */}
          <div className="space-y-3">
            <label className="font-bold text-stone-200 text-xs uppercase tracking-wide flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-[#06C755]" />
              <span>3. Customer Details (ข้อมูลผู้สั่ง)</span>
            </label>

            <div className="space-y-2 bg-[#132218] p-3.5 rounded-2xl border border-[#1E3A24]">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-stone-300 block">
                    Name for Counter Call <span className="text-rose-400">*</span>
                  </label>
                  {lineUserProfile?.displayName && (
                    <span className="text-[10px] text-[#06C755] font-bold flex items-center space-x-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>LINE Profile Auto-filled</span>
                    </span>
                  )}
                </div>
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

            <div className="flex justify-between text-stone-400 text-[11px]">
              <span>VAT (7% Included)</span>
              <span>฿{Math.round(subtotal * 0.07)}</span>
            </div>

            <div className="pt-2 border-t border-[#1E3A24] flex justify-between font-extrabold text-white text-sm">
              <span>Total Amount</span>
              <span className="text-amber-400 text-base">฿{subtotal.toLocaleString()}</span>
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
                  <span>Place Pre-Order</span>
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
