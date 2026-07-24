'use client';

import React from 'react';

import { Coffee, CupSoda, Cookie, ShoppingBag, Leaf, Sparkles } from 'lucide-react';
import { CategoryType } from '../types';

interface MenuCategoriesProps {
  activeCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
}

export const MenuCategories: React.FC<MenuCategoriesProps> = ({
  activeCategory,
  onSelectCategory
}) => {
  const categories: { id: CategoryType; label: string; thLabel: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Items', thLabel: 'ทั้งหมด', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'coffee', label: 'Coffee', thLabel: 'กาแฟสด', icon: <Coffee className="w-4 h-4" /> },
    { id: 'non-coffee', label: 'Non-Coffee', thLabel: 'เครื่องดื่ม', icon: <CupSoda className="w-4 h-4" /> },
    { id: 'bakery', label: 'Bakery', thLabel: 'เบเกอรี่', icon: <Cookie className="w-4 h-4" /> },
    { id: 'packaged', label: 'Beans & Drip', thLabel: 'เมล็ดกาแฟ', icon: <ShoppingBag className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-3">
      {/* Eco-Friendly Eco Discount Banner */}
      <div className="mx-4 mt-3 p-3 rounded-2xl bg-[#132218] border border-[#1E3A24] flex items-center justify-between text-stone-200 shadow-md">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-[#06C755] text-stone-950 flex items-center justify-center flex-shrink-0 shadow-xs font-bold">
            <Leaf className="w-4 h-4 text-stone-950" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center space-x-1.5">
              <span>Eco-Cup Bonus</span>
              <span className="text-[10px] bg-amber-400 text-stone-950 px-1.5 py-0.2 rounded-full font-black">
                -5 THB & +50 Beans
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              นำแก้วมาเองเมื่อรับหน้าร้าน รับส่วนลดทันที 🌱
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal Category Tab Chips */}
      <div className="px-4 overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex space-x-2 min-w-max pb-1">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shadow-xs ${
                  isActive
                    ? 'bg-[#06C755] text-stone-950 font-extrabold shadow-md'
                    : 'bg-[#132218] text-stone-300 hover:text-white border border-[#1E3A24]'
                }`}
              >
                <span className={isActive ? 'text-stone-950' : 'text-[#06C755]'}>
                  {cat.icon}
                </span>
                <div className="text-left leading-tight">
                  <div className="font-bold">{cat.label}</div>
                  <div className={`text-[9px] ${isActive ? 'text-stone-900 font-semibold' : 'text-stone-400'}`}>
                    {cat.thLabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
