'use client';

import React, { useState, useEffect } from 'react';
import { X, Flame, Snowflake, Sparkles, Coffee, Leaf, Plus, Minus, LogIn } from 'lucide-react';
import { MenuItem, TemperatureType, SweetnessType, MilkType, ItemCustomization, CartItem } from '../types';

interface CustomizationModalProps {
  item: MenuItem | null;
  isLoggedIn: boolean;
  onLogin: () => void;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

export const CustomizationModal: React.FC<CustomizationModalProps> = ({
  item,
  isLoggedIn,
  onLogin,
  onClose,
  onAddToCart
}) => {
  if (!item) return null;

  // Defaults based on item capabilities
  const initialTemp: TemperatureType = item.allowTemp && item.allowTemp.includes('Iced')
    ? 'Iced'
    : item.allowTemp && item.allowTemp.includes('Hot')
    ? 'Hot'
    : 'Hot';

  const [temp, setTemp] = useState<TemperatureType>(initialTemp);
  const [sweetness, setSweetness] = useState<SweetnessType>('50%');
  const [milk, setMilk] = useState<MilkType>('Standard Dairy');
  const [extraShot, setExtraShot] = useState<boolean>(false);
  const [macadamiaDrizzle, setMacadamiaDrizzle] = useState<boolean>(false);
  const [ecoCup, setEcoCup] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (item) {
      setTemp(
        item.allowTemp && item.allowTemp.includes('Iced')
          ? 'Iced'
          : item.allowTemp && item.allowTemp.includes('Hot')
          ? 'Hot'
          : 'Hot'
      );
      setSweetness('50%');
      setMilk('Standard Dairy');
      setExtraShot(false);
      setMacadamiaDrizzle(false);
      setEcoCup(item.category === 'coffee' || item.category === 'non-coffee');
      setQuantity(1);
      setNotes('');
    }
  }, [item]);

  const isDrink = item.category === 'coffee' || item.category === 'non-coffee';
  let unitPrice = item.price;
  if (isDrink && extraShot) unitPrice += 15;
  if (isDrink && macadamiaDrizzle) unitPrice += 20;
  if (isDrink && milk === 'Oat Milk') unitPrice += 15;
  if (isDrink && milk === 'Soy Milk') unitPrice += 10;
  if (isDrink && milk === 'Almond Milk') unitPrice += 15;

  const rawTotal = unitPrice * quantity;
  const ecoDiscountTotal = isDrink && ecoCup ? 5 * quantity : 0;
  const finalTotalPrice = Math.max(0, rawTotal - ecoDiscountTotal);

  const handleAdd = () => {
    const customization: ItemCustomization = {
      temp,
      sweetness,
      milk,
      extraShot,
      macadamiaDrizzle,
      ecoCup,
      quantity,
      notes
    };

    const cartItem: CartItem = {
      cartItemId: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      menuItem: item,
      customization,
      calculatedPricePerUnit: unitPrice,
      totalPrice: finalTotalPrice
    };

    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-[#0F1812] text-stone-100 rounded-3xl shadow-2xl overflow-hidden border border-[#1E3A24] max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header Image */}
        <div className="relative h-44 sm:h-48 w-full bg-stone-900 overflow-hidden flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1812] via-[#0F1812]/30 to-transparent"></div>

          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-xs transition z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-3 left-4 right-4 text-white">
            <h2 className="text-lg font-bold leading-tight">{item.thName || item.name}</h2>
            <p className="text-xs text-stone-300 font-medium">{item.name}</p>
          </div>
        </div>

        {/* Customization Body Options */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Temperature Options */}
          {isDrink && item.allowTemp && item.allowTemp.length > 0 && (
            <div className="space-y-2">
              <label className="font-bold text-stone-200 text-xs tracking-wide block">
                ระดับความร้อน / เย็น
              </label>
              <div className="grid grid-cols-3 gap-2">
                {item.allowTemp.map((t) => {
                  const isSelected = temp === t;
                  const thLabel = t === 'Hot' ? 'ร้อน' : t === 'Iced' ? 'เย็น' : 'ปั่น';
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTemp(t)}
                      className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                        isSelected
                          ? 'border-[#06C755] bg-[#06C755] text-stone-950 shadow-md'
                          : 'border-[#1E3A24] bg-[#132218] text-stone-300 hover:border-emerald-600'
                      }`}
                    >
                      {t === 'Hot' && <Flame className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                      {t === 'Iced' && <Snowflake className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />}
                      {t === 'Frappe' && <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                      <span>{thLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sweetness Options */}
          {isDrink && item.allowSweetness && (
            <div className="space-y-2">
              <label className="font-bold text-stone-200 text-xs tracking-wide block">
                ระดับความหวาน
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(
                  [
                    { val: '0%', label: 'ไม่หวาน' },
                    { val: '25%', label: 'หวานน้อย' },
                    { val: '50%', label: 'ปกติ' },
                    { val: '100%', label: 'หวานมาก' }
                  ] as { val: SweetnessType; label: string }[]
                ).map((sw) => {
                  const isSelected = sweetness === sw.val;
                  return (
                    <button
                      key={sw.val}
                      type="button"
                      onClick={() => setSweetness(sw.val)}
                      className={`py-2 px-1 rounded-xl border text-xs font-medium text-center transition ${
                        isSelected
                          ? 'border-[#06C755] bg-[#06C755] text-stone-950 font-black shadow-md'
                          : 'border-[#1E3A24] bg-[#132218] text-stone-300 hover:border-emerald-600'
                      }`}
                    >
                      <div className="font-bold">{sw.val}</div>
                      <div className={`text-[9px] ${isSelected ? 'text-stone-900 font-bold' : 'text-stone-400'}`}>
                        {sw.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Milk Options */}
          {isDrink && item.allowMilk && (
            <div className="space-y-2">
              <label className="font-bold text-stone-200 text-xs tracking-wide block">
                ประเภทนม
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { name: 'Standard Dairy', extra: 0, label: 'นมสดปกติ' },
                    { name: 'Oat Milk', extra: 15, label: 'นมอ๊อต (+15.-)' },
                    { name: 'Soy Milk', extra: 10, label: 'นมถั่วเหลือง (+10.-)' },
                    { name: 'Almond Milk', extra: 15, label: 'นมอัลมอนด์ (+15.-)' }
                  ] as { name: MilkType; extra: number; label: string }[]
                ).map((m) => {
                  const isSelected = milk === m.name;
                  return (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => setMilk(m.name)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition flex items-center justify-between ${
                        isSelected
                          ? 'border-[#06C755] bg-[#06C755] text-stone-950 font-black shadow-md'
                          : 'border-[#1E3A24] bg-[#132218] text-stone-200 hover:border-emerald-600'
                      }`}
                    >
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-on Extras */}
          {isDrink && (
            <div className="space-y-2">
              <label className="font-bold text-stone-200 text-xs tracking-wide block">
                ท็อปปิ้งเพิ่มเติม
              </label>
              <div className="space-y-2">
                <label className="p-2.5 rounded-xl bg-[#132218] border border-[#1E3A24] flex items-center justify-between cursor-pointer hover:border-emerald-600 transition">
                  <div className="flex items-center space-x-2">
                    <Coffee className="w-4 h-4 text-[#C5A059]" />
                    <span className="font-semibold text-stone-200">เพิ่มช็อตเอสเปรสโซ่ดอยตุง (+15.-)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={extraShot}
                    onChange={(e) => setExtraShot(e.target.checked)}
                    className="w-4 h-4 accent-[#06C755] rounded"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Eco-Friendly Cup Discount Toggle */}
          {isDrink && (
            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-700/50">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#06C755] text-stone-950 flex items-center justify-center flex-shrink-0 font-bold">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-100 flex items-center space-x-1.5">
                      <span>นำแก้วมาเอง (ส่วนลด 5 บาท)</span>
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={ecoCup}
                  onChange={(e) => setEcoCup(e.target.checked)}
                  className="w-5 h-5 accent-[#06C755] rounded cursor-pointer"
                />
              </label>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="pt-2 flex items-center justify-between border-t border-stone-800">
            <span className="font-bold text-stone-200 text-xs">
              จำนวน
            </span>
            <div className="flex items-center space-x-3 bg-[#132218] p-1 rounded-xl border border-[#1E3A24]">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-stone-800 text-stone-200 flex items-center justify-center hover:bg-stone-700 font-bold"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-bold text-white px-2 text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg bg-[#06C755] text-stone-950 flex items-center justify-center hover:bg-[#05b34c] font-black"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Action Button */}
        <div className="p-3.5 sm:p-4 bg-[#132218] border-t border-[#1E3A24]">
          {isLoggedIn ? (
            <button
              onClick={handleAdd}
              className="w-full py-3.5 px-4 bg-[#06C755] hover:bg-[#05b34c] active:scale-98 text-stone-950 font-black rounded-2xl shadow-lg transition flex items-center justify-center space-x-2 text-sm whitespace-nowrap"
            >
              <span>เพิ่มลงในรายการสั่งซื้อ</span>
              <span>•</span>
              <span className="text-base font-black">฿{finalTotalPrice.toLocaleString()}</span>
            </button>
          ) : (
            <button
              onClick={onLogin}
              className="w-full py-3.5 px-4 bg-[#06C755] hover:bg-[#05b34c] active:scale-98 text-stone-950 font-black rounded-2xl shadow-lg transition flex items-center justify-center space-x-2 text-sm whitespace-nowrap"
            >
              <LogIn className="w-4 h-4 text-stone-950" />
              <span>เข้าสู่ระบบ LINE เพื่อสั่งซื้อ • ฿{finalTotalPrice.toLocaleString()}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
