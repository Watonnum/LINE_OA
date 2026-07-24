'use client';

import React, { useState } from 'react';
import { Coffee, LogIn, Loader2, LogOut, Award } from 'lucide-react';
import { LineUserProfile } from '../types';

interface LineHeaderProps {
  isLoggedIn?: boolean;
  profile?: LineUserProfile | null;
  userBeans?: number;
  isAuthChecking?: boolean;
  isLoggingIn?: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
}

export const LineHeader: React.FC<LineHeaderProps> = ({
  isLoggedIn,
  profile,
  userBeans = 0,
  isAuthChecking,
  isLoggingIn,
  onLogin,
  onLogout
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#1E4D2B] text-white shadow-md border-b border-[#2a6239]">
      {/* Brand Header Banner */}
      <div className="relative bg-[#1E4D2B] text-white">
        {/* Background Hero Overlay */}
        <div className="absolute inset-0 z-0 opacity-25 mix-blend-overlay overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80"
            alt="DoiTung Coffee"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
        </div>


        <div className="relative z-10 px-4 py-3 max-w-md mx-auto flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-full bg-[#FDFBF7] p-0.5 flex items-center justify-center shadow-lg border-2 border-[#C5A059] flex-shrink-0">
              <div className="w-full h-full rounded-full bg-[#1E4D2B] flex items-center justify-center text-[#C5A059]">
                <Coffee className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="text-base font-bold tracking-tight text-stone-50 font-serif leading-tight">
                  Café DoiTung
                </h1>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#C5A059] text-stone-950 font-black">
                  คาเฟ่ดอยตุง
                </span>
              </div>
              <p className="text-[10px] text-emerald-100/90 font-light mt-0.5">
                Pre-Order & Pickup • สั่งกาแฟล่วงหน้า
              </p>
            </div>
          </div>

          {/* Right Header: User Profile Avatar & Points / Login Button */}
          <div className="relative">
            {isAuthChecking ? (
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-[10px] text-stone-300">
                <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                <span>Checking...</span>
              </div>
            ) : isLoggedIn && profile ? (
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-1.5 p-1 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-[#C5A059]/40 transition text-left"
              >
                <img
                  src={profile.pictureUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                  alt={profile.displayName}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-[#C5A059]"
                />
                <div className="pr-1.5 hidden sm:block">
                  <span className="text-[11px] font-bold text-stone-100 block leading-none truncate max-w-[80px]">
                    {profile.displayName}
                  </span>
                  <span className="text-[9px] font-extrabold text-[#C5A059] block mt-0.5">
                    +{userBeans} แต้ม
                  </span>
                </div>
                <span className="sm:hidden text-[10px] font-bold text-[#C5A059] px-1.5 py-0.5 rounded-full bg-stone-900">
                  +{userBeans}
                </span>
              </button>
            ) : (
              <button
                onClick={onLogin}
                disabled={isLoggingIn}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-[#06C755] hover:bg-[#05b34c] text-stone-950 font-black text-xs shadow-md transition disabled:opacity-75"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Login LINE</span>
                  </>
                )}
              </button>
            )}

            {/* Profile Dropdown Popup */}
            {showProfileMenu && profile && (
              <div className="absolute right-0 top-10 z-50 w-48 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl p-2 text-xs text-stone-200 animate-in fade-in space-y-2">
                <div className="flex items-center space-x-2 p-1.5 bg-stone-800/80 rounded-lg">
                  <img
                    src={profile.pictureUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                    alt={profile.displayName}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border border-[#C5A059]"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-white truncate">{profile.displayName}</h4>
                    <span className="text-[10px] text-[#C5A059] font-bold block">
                      +{userBeans} แต้มสะสม
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-rose-300 flex items-center space-x-2 text-xs font-semibold transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>ออกจากระบบ (Logout)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
