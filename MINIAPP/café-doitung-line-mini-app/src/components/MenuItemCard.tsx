'use client';

import React from 'react';

import { Plus, Leaf, Sparkles } from 'lucide-react';
import { MenuItem } from '../types';

interface MenuItemCardProps {
  item: MenuItem;
  onSelectItem: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onSelectItem }) => {
  return (
    <div
      onClick={() => onSelectItem(item)}
      className="bg-[#132218] rounded-2xl border border-[#1E3A24] hover:border-[#06C755]/50 shadow-md hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between group cursor-pointer"
    >
      <div>
        {/* Item Image with Badges */}
        <div className="relative w-full h-36 bg-stone-900 overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
            onError={(e) => {
              (e.target as HTMLElement).setAttribute(
                'src',
                'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80'
              );
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A110C] via-transparent to-transparent"></div>

          {/* Badge */}
          {item.badge && (
            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#06C755] text-stone-950 shadow-xs border border-emerald-400/30 flex items-center space-x-1">
              <Sparkles className="w-2.5 h-2.5 text-stone-950 inline" />
              <span>{item.badge}</span>
            </span>
          )}

          {/* Eco Badge */}
          {item.isEcoRecommended && (
            <span className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded-md text-[9px] font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-700/50 backdrop-blur-xs flex items-center space-x-1">
              <Leaf className="w-2.5 h-2.5 text-[#06C755]" />
              <span>Eco Cup (-5 THB)</span>
            </span>
          )}
        </div>

        {/* Item Info */}
        <div className="p-3.5 space-y-1.5">
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-[#06C755] transition-colors">
              {item.name}
            </h3>
          </div>
          <p className="text-[11px] text-emerald-400 font-medium">{item.thName}</p>
          <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>

      {/* Footer Price & Add Button */}
      <div className="p-3.5 pt-0 flex items-center justify-between border-t border-[#1E3A24] mt-2">
        <div>
          <span className="text-[10px] text-stone-400 block font-light">Price</span>
          <span className="text-base font-black text-amber-400">
            ฿{item.price.toLocaleString()}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectItem(item);
          }}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#06C755] text-stone-950 hover:bg-[#05b34c] text-xs font-black shadow-xs active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Pre-Order</span>
        </button>
      </div>
    </div>
  );
};
