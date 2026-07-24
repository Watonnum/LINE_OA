'use client';

import React from 'react';
import { Coffee, Users, ClipboardList } from 'lucide-react';
import { MiniAppTab } from '../types';

interface BottomNavDockProps {
  activeTab: MiniAppTab;
  onSelectTab?: (tab: MiniAppTab) => void;
  onTabChange?: (tab: MiniAppTab) => void;
  cartCount: number;
  activeOrderCount?: number;
}

export const BottomNavDock: React.FC<BottomNavDockProps> = ({
  activeTab,
  onSelectTab,
  onTabChange,
  cartCount,
  activeOrderCount = 0
}) => {
  const handleSelectTab = (tab: MiniAppTab) => {
    if (onTabChange) onTabChange(tab);
    if (onSelectTab) onSelectTab(tab);
  };

  const tabs: { id: MiniAppTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'home',
      label: 'หน้าแรก',
      icon: <Coffee className="w-5 h-5" />,
      badge: cartCount > 0 ? cartCount : undefined
    },
    {
      id: 'friends',
      label: 'ชวนเพื่อน',
      icon: <Users className="w-5 h-5" />
    },
    {
      id: 'orders',
      label: 'ออเดอร์',
      icon: <ClipboardList className="w-5 h-5" />,
      badge: activeOrderCount > 0 ? activeOrderCount : undefined
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-1 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <nav className="bg-[#122216]/95 border border-[#1E3A24] rounded-2xl shadow-2xl backdrop-blur-md p-1.5 flex items-center justify-around">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={`relative flex-1 py-2 px-1 flex flex-col items-center justify-center rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-[#1E3E26] text-[#06C755] font-bold shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className="relative">
                  {tab.icon}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-stone-950 font-black text-[10px] flex items-center justify-center border border-stone-900 shadow-xs">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'text-[#06C755]' : 'text-stone-400'}`}>
                  {tab.label}
                </span>

                {isActive && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#06C755] shadow-[0_0_8px_#06C755]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
