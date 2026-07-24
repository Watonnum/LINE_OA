'use client';

import React from 'react';
import { LogIn, LogOut, ShieldCheck, CheckCircle, Loader2 } from 'lucide-react';
import { LineUserProfile } from '../types';

interface LineProfileCardProps {
  isLiffInitialized: boolean;
  isLoggedIn: boolean;
  isInClient: boolean;
  profile: LineUserProfile | null;
  liffError: string | null;
  isSharePickerAvailable: boolean;
  isAuthChecking?: boolean;
  isLoggingIn?: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onInviteFriends: () => void;
}

export const LineProfileCard: React.FC<LineProfileCardProps> = ({
  isLiffInitialized,
  isLoggedIn,
  isInClient,
  profile,
  liffError,
  isSharePickerAvailable,
  isAuthChecking = false,
  isLoggingIn = false,
  onLogin,
  onLogout,
  onInviteFriends
}) => {
  return (
    <div className="px-4 mt-3">
      <div className="bg-[#132218] rounded-2xl border border-[#1E3A24] p-3.5 shadow-md space-y-3">
        {/* Card Header Tag */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-800">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-[#06C755] flex items-center justify-center text-stone-950 font-black text-xs shadow-xs">
              LINE
            </div>
            <div>
              <span className="text-xs font-bold text-white block leading-tight">
                LINE Account
              </span>
              <span className="text-[10px] text-stone-400 font-medium">
                {isInClient ? 'LINE In-App Client' : 'Web Browser Preview'}
              </span>
            </div>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
              isAuthChecking
                ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                : isLoggedIn
                ? 'bg-emerald-950 text-[#06C755] border border-emerald-800'
                : 'bg-stone-800 text-stone-400 border border-stone-700'
            }`}
          >
            {isAuthChecking ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                <span>กำลังตรวจสอบ...</span>
              </>
            ) : (
              <>
                <span className={`w-1.5 h-1.5 rounded-full ${isLoggedIn ? 'bg-[#06C755] animate-pulse' : 'bg-stone-500'}`} />
                <span>{isLoggedIn ? 'LINE Connected' : 'Guest Mode'}</span>
              </>
            )}
          </span>
        </div>

        {/* State 1: Auth Checking Initializing */}
        {isAuthChecking ? (
          <div className="py-4 text-center space-y-2">
            <Loader2 className="w-6 h-6 text-[#06C755] animate-spin mx-auto" />
            <p className="text-xs text-stone-300 font-medium">กำลังตรวจสอบสิทธิ์บัญชี LINE...</p>
          </div>
        ) : isLoggedIn && profile ? (
          /* State 2: Logged In User Profile Card */
          <div className="space-y-3 pt-0.5">
            <div className="flex items-center space-x-3 bg-[#1A2D20] p-2.5 rounded-xl border border-[#23422C]">
              {/* Profile Avatar */}
              <div className="relative flex-shrink-0">
                {profile.pictureUrl ? (
                  <img
                    src={profile.pictureUrl}
                    alt={profile.displayName}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#06C755] shadow-xs"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-900 border-2 border-[#06C755] flex items-center justify-center text-white font-bold text-lg shadow-xs">
                    {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : 'L'}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#06C755] border-2 border-stone-900 flex items-center justify-center text-stone-950">
                  <CheckCircle className="w-3 h-3 text-stone-950" />
                </div>
              </div>

              {/* Profile Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-sm font-bold text-white truncate">
                    {profile.displayName}
                  </h3>
                  {profile.isGuest && (
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-semibold">
                      Demo User
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-stone-400 font-mono truncate">
                  ID: {profile.userId ? `${profile.userId.substring(0, 12)}...` : 'N/A'}
                </div>

                {profile.statusMessage && (
                  <p className="text-[11px] text-stone-300 italic truncate mt-0.5 bg-stone-900/60 px-2 py-0.5 rounded border border-stone-800">
                    "{profile.statusMessage}"
                  </p>
                )}
              </div>
            </div>

            {/* Profile Helper Info & Logout Action */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-1 text-[11px] text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 text-[#06C755]" />
                <span>Auto-filled in pre-order form</span>
              </div>

              <button
                onClick={onLogout}
                className="px-3 py-1 rounded-xl border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold flex items-center space-x-1 transition active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        ) : (
          /* State 3: Logged Out - Action Trigger to Login with LINE */
          <div className="space-y-2.5 pt-1">
            <div className="bg-amber-950/60 text-amber-200 border border-amber-800/80 rounded-xl p-2.5 text-xs flex items-center space-x-2 font-medium">
              <span className="text-base">🔒</span>
              <span>กรุณาเข้าสู่ระบบด้วย LINE เพื่อสั่งกาแฟและสะสมแต้ม</span>
            </div>

            <p className="text-xs text-stone-300 leading-snug">
              ล็อกอินด้วย LINE เพื่อดึงชื่อและรูปโปรไฟล์อัตโนมัติ พร้อมติดตามคิวชงหน้าร้าน
            </p>

            <div className="pt-0.5">
              <button
                onClick={onLogin}
                disabled={isLoggingIn || isAuthChecking}
                className={`w-full py-3 px-4 rounded-xl text-stone-950 text-sm font-extrabold shadow-md transition flex items-center justify-center space-x-2 ${
                  isLoggingIn || isAuthChecking
                    ? 'bg-emerald-700 text-stone-900 opacity-70 cursor-not-allowed'
                    : 'bg-[#06C755] hover:bg-[#05b34c] active:bg-[#049a41] active:scale-98'
                }`}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-stone-950" />
                    <span>กำลังเข้าสู่ระบบ...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 text-stone-950" />
                    <span>Login with LINE (เข้าสู่ระบบด้วย LINE)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

