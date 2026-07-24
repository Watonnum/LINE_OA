'use client';

import React, { useState, useEffect } from 'react';
import { X, Flame, Snowflake, Sparkles, Coffee, Leaf, Plus, Minus, LogIn, Lock } from 'lucide-react';
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
  const [ecoCup, setEcoCup] = useState<boolean>(true); // Default eco cup discount enabled
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    // Reset defaults when item changes
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

  // Price Calculation Logic
  const getTempPriceAdjustment = (t: TemperatureType) => {
    if (t === 'Iced') return 5;
    if (t === 'Frappe') return 15;
    return 0;
  };

  const getMilkPriceAdjustment = (m: MilkType) => {
    if (m === 'Oat Milk') return 15;
    if (m === 'Soy Milk') return 10;
    if (m === 'Almond Milk') return 15;
    return 0;
  };

  const isDrink = item.category === 'coffee' || item.category === 'non-coffee';

  const basePrice = item.price;
  const tempExtra = isDrink ? getTempPriceAdjustment(temp) : 0;
  const milkExtra = isDrink && item.allowMilk ? getMilkPriceAdjustment(milk) : 0;
  const shotExtra = isDrink && extraShot ? 20 : 0;
  const drizzleExtra = isDrink && macadamiaDrizzle ? 15 : 0;
  const ecoDiscount = isDrink && ecoCup ? -5 : 0;

  const unitPrice = basePrice + tempExtra + milkExtra + shotExtra + drizzleExtra + ecoDiscount;
  const finalTotalPrice = Math.max(0, unitPrice * quantity);

  const handleAdd = () => {
    const customization: ItemCustomization = {
      temp,
      sweetness,
      milk,
      extraShot,
      macadamiaDrizzle,
      ecoCup: isDrink ? ecoCup : false,
      quantity,
      notes
    };

    const cartItem: CartItem = {
      cartItemId: `${item.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      menuItem: item,
      customization,
      calculatedPricePerUnit: unitPrice,
      totalPrice: finalTotalPrice
    };

    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-[#0F1812] text-stone-100 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-[#1E3A24] max-h-[90vh] flex flex-col">
        {/* Header with image banner */}
        <div className="relative h-44 bg-stone-900 overflow-hidden flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1812] via-[#0F1812]/50 to-transparent"></div>
          
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-stone-900/80 text-white flex items-center justify-center hover:bg-stone-800 transition border border-stone-700"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-4 right-4 text-white">
            <span className="text-[10px] uppercase tracking-wider font-extrabold bg-[#06C755] text-stone-950 px-2 py-0.5 rounded-full">
              {item.category}
            </span>
            <h2 className="text-lg font-bold leading-tight mt-1 text-white">
              {item.name}
            </h2>
            <p className="text-xs text-emerald-400 font-medium">{item.thName}</p>
          </div>
        </div>

        {/* Customization Form Body */}
        <div className="p-4 space-y-5 overflow-y-auto flex-1 text-sm">
          {/* Temperature Choice */}
          {isDrink && item.allowTemp && item.allowTemp.length > 0 && (
            <div className="space-y-2">
              <label className="font-bold text-stone-200 text-xs uppercase tracking-wide flex items-center justify-between">
                <span>1. Temperature (อุณหภูมิ)</span>
                <span className="text-stone-400 text-[11px] font-normal">Select 1</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Hot', 'Iced', 'Frappe'] as TemperatureType[]).map((t) => {
                  const isAvailable = item.allowTemp?.includes(t);
                  if (!isAvailable) return null;
                  const isSelected = temp === t;
                  const extra = getTempPriceAdjustment(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTemp(t)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center transition ${
                        isSelected
                          ? 'border-[#06C755] bg-[#06C755] text-stone-950 font-black shadow-md'
                          : 'border-[#1E3A24] bg-[#132218] text-stone-300 hover:border-emerald-600'
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        {t === 'Hot' ? (
                          <Flame className={`w-3.5 h-3.5 ${isSelected ? 'text-stone-950' : 'text-amber-400'}`} />
                        ) : (
                          <Snowflake className={`w-3.5 h-3.5 ${isSelected ? 'text-stone-950' : 'text-sky-400'}`} />
                        )}
                        <span>{t}</span>
                      </div>
                      <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-stone-900 font-bold' : 'text-stone-400'}`}>
                        {extra > 0 ? `+฿${extra}` : 'Standard'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sweetness Level */}
          {isDrink && item.allowSweetness !== false && (
            <div className="space-y-2">
              <label className="font-bold text-stone-200 text-xs uppercase tracking-wide flex items-center justify-between">
                <span>2. Sweetness Level (ระดับความหวาน)</span>
                <span className="text-emerald-400 font-semibold text-[11px]">Selected: {sweetness}</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['0%', '25%', '50%', '100%'] as SweetnessType[]).map((sw) => {
                  const isSelected = sweetness === sw;
                  return (
                    <button
                      key={sw}
                      type="button"
                      onClick={() => setSweetness(sw)}
                      className={`py-2 px-2 rounded-xl border text-xs font-medium text-center transition ${
                        isSelected
                          ? 'border-[#06C755] bg-[#06C755] text-stone-950 font-black shadow-md'
                          : 'border-[#1E3A24] bg-[#132218] text-stone-300 hover:border-emerald-600'
                      }`}
                    >
                      <div>{sw}</div>
                      <div className={`text-[9px] ${isSelected ? 'text-stone-900 font-bold' : 'text-stone-400'}`}>
                        {sw === '50%' ? 'Standard' : sw === '0%' ? 'No Sugar' : sw === '25%' ? 'Less' : 'Sweet'}
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
              <label className="font-bold text-stone-200 text-xs uppercase tracking-wide flex items-center justify-between">
                <span>3. Milk Choice (ประเภทนม)</span>
                <span className="text-stone-400 text-[11px] font-normal">Plant-based choices</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { name: 'Standard Dairy', extra: 0, label: 'Standard Dairy' },
                    { name: 'Oat Milk', extra: 15, label: 'Oat Milk (+฿15)' },
                    { name: 'Soy Milk', extra: 10, label: 'Soy Milk (+฿10)' },
                    { name: 'Almond Milk', extra: 15, label: 'Almond Milk (+฿15)' }
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
                      <span>{m.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${isSelected ? 'bg-stone-950 text-amber-300 font-bold' : 'bg-stone-800 text-stone-400'}`}>
                        {m.extra > 0 ? `+฿${m.extra}` : 'Included'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Extra Add-ons */}
          {isDrink && (
            <div className="space-y-2">
              <label className="font-bold text-stone-200 text-xs uppercase tracking-wide">
                4. Extra Add-ons (ท็อปปิ้งเพิ่มเติม)
              </label>
              <div className="space-y-2">
                <label
                  onClick={() => setExtraShot(!extraShot)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition ${
                    extraShot ? 'border-[#06C755] bg-[#132218] text-white font-semibold' : 'border-[#1E3A24] bg-[#132218] text-stone-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Coffee className="w-4 h-4 text-[#06C755]" />
                    <span>Extra Espresso Shot (เอสเปรสโซ่ช็อตเพิ่ม)</span>
                  </div>
                  <span className="font-bold text-amber-400">+฿20</span>
                </label>

                <label
                  onClick={() => setMacadamiaDrizzle(!macadamiaDrizzle)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition ${
                    macadamiaDrizzle ? 'border-[#06C755] bg-[#132218] text-white font-semibold' : 'border-[#1E3A24] bg-[#132218] text-stone-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>DoiTung Macadamia Drizzle (ซอสแมคคาเดเมีย)</span>
                  </div>
                  <span className="font-bold text-amber-400">+฿15</span>
                </label>
              </div>
            </div>
          )}

          {/* Eco Cup Option Discount */}
          {isDrink && (
            <div className="p-3.5 rounded-2xl bg-[#132218] text-white shadow-xs border border-[#1E3A24] space-y-2">
              <label
                onClick={() => setEcoCup(!ecoCup)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#06C755] text-stone-950 flex items-center justify-center flex-shrink-0 font-bold">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-100 flex items-center space-x-1.5">
                      <span>Bring My Own Cup</span>
                      <span className="bg-amber-400 text-stone-950 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                        SAVE -฿5
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400">
                      นำแก้วมาเองเมื่อรับหน้าร้าน
                    </p>
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
            <span className="font-bold text-stone-200 text-xs uppercase tracking-wide">
              Quantity (จำนวน)
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

        {/* Modal Footer with Add / Login Button */}
        <div className="p-4 bg-[#132218] border-t border-[#1E3A24] flex items-center justify-between space-x-3">
          <div>
            <span className="text-xs text-stone-400 block">Total Price</span>
            <span className="text-xl font-black text-amber-400">
              ฿{finalTotalPrice.toLocaleString()}
            </span>
          </div>

          {isLoggedIn ? (
            <button
              onClick={handleAdd}
              className="flex-1 py-3 px-4 bg-[#06C755] hover:bg-[#05b34c] text-stone-950 font-black rounded-2xl shadow-md active:scale-98 transition flex items-center justify-center space-x-2 text-sm"
            >
              <span>Add to Pre-Order</span>
              <span>•</span>
              <span>฿{finalTotalPrice.toLocaleString()}</span>
            </button>
          ) : (
            <button
              onClick={onLogin}
              className="flex-1 py-3 px-4 bg-[#06C755] hover:bg-[#05b34c] text-stone-950 font-black rounded-2xl shadow-md active:scale-98 transition flex items-center justify-center space-x-2 text-sm"
            >
              <LogIn className="w-4 h-4 text-stone-950" />
              <span>Login with LINE เพื่อสั่งซื้อ</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
