'use client';

import React from 'react';
import { Coffee } from 'lucide-react';
import { Branch } from '../types';

interface LineHeaderProps {
  selectedBranch: Branch;
  onSelectBranch: (branch: Branch) => void;
  activeView: 'customer' | 'barista';
  onToggleView: (view: 'customer' | 'barista') => void;
  activeOrderCount: number;
  onInviteFriends?: () => void;
}

export const LineHeader: React.FC<LineHeaderProps> = () => {
  return (
    <header className="sticky top-0 z-30 bg-[#1E4D2B] text-white shadow-md">
      {/* Brand Header with Hero Image Banner */}
      <div className="relative overflow-hidden bg-[#1E4D2B] text-white">
        {/* Background Hero Image with Dark Gradient Overlay */}
        <div className="absolute inset-0 z-0 opacity-30 mix-blend-overlay">
          <img
            src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80"
            alt="DoiTung Coffee Plantation"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="relative z-10 px-4 py-3 max-w-md mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#FDFBF7] p-0.5 flex items-center justify-center shadow-lg border-2 border-[#C5A059] flex-shrink-0">
              <div className="w-full h-full rounded-full bg-[#1E4D2B] flex items-center justify-center text-[#C5A059]">
                <Coffee className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-stone-50 font-serif drop-shadow-xs">
                  Café DoiTung
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C5A059] text-stone-900 font-extrabold shadow-xs">
                  คาเฟ่ดอยตุง
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/90 font-light mt-0.5 drop-shadow-xs">
                Pre-Order & Pickup • สั่งกาแฟล่วงหน้าแล้วมารับที่ร้าน
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
