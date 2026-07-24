'use client';

import React, { useState, useEffect } from 'react';
import { Users, Share2, Copy, Check, Sparkles, UserCheck, UserPlus } from 'lucide-react';
import { InvitedFriend, LineUserProfile } from '../types';
import { fetchUserReferrals } from '../services/userService';

interface InviteFriendsTabProps {
  isSharePickerAvailable?: boolean;
  onInviteFriends?: () => void;
  userProfile?: LineUserProfile | null;
  userBeans: number;
  isLoggedIn?: boolean;
  onLogin?: () => void;
  onInvite?: () => void;
}

export const InviteFriendsTab: React.FC<InviteFriendsTabProps> = ({
  isSharePickerAvailable = true,
  onInviteFriends,
  userProfile,
  userBeans,
  isLoggedIn,
  onLogin,
  onInvite
}) => {
  const [copied, setCopied] = useState(false);
  const [friendsList, setFriendsList] = useState<InvitedFriend[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (userProfile?.userId) {
      setIsLoading(true);
      fetchUserReferrals(userProfile.userId)
        .then((list) => {
          setFriendsList(list || []);
        })
        .finally(() => setIsLoading(false));
    } else {
      setFriendsList([]);
    }
  }, [userProfile]);

  const handleCopyLink = () => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID || (import.meta as any).env?.VITE_LIFF_ID || '';
    const link = liffId ? `https://liff.line.me/${liffId}` : window.location.href;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = () => {
    if (onInvite) {
      onInvite();
    } else if (onInviteFriends) {
      onInviteFriends();
    } else {
      handleCopyLink();
    }
  };

  const totalPoints = friendsList.reduce((sum, f) => sum + (f.pointsEarned || 1), 0);

  return (
    <div className="px-4 py-3 space-y-4 max-w-md mx-auto text-white">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-[#06C755]" />
            <span>เชิญเพื่อนเข้าใช้งาน</span>
          </h2>
          <p className="text-xs text-stone-400">
            รับ +1 แต้มเมื่อเพื่อนกดลิงก์คำเชิญและเข้าสู่ระบบสำเร็จ
          </p>
        </div>
      </div>

      {/* Primary Reward Hero Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#132218] via-[#1A2F21] to-stone-900 border border-[#06C755]/40 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-[#06C755]/20 border border-[#06C755]/50 flex items-center justify-center text-[#06C755]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#06C755] tracking-wider block">
                ชวนเพื่อนสำเร็จ
              </span>
              <h3 className="text-base font-extrabold text-white">
                รับ +1 แต้ม / เพื่อน 1 คน
              </h3>
            </div>
          </div>

          <div className="text-right bg-stone-950/80 px-3 py-1.5 rounded-xl border border-stone-800">
            <span className="text-[10px] text-stone-400 block font-medium">แต้มจากเพื่อน</span>
            <span className="text-lg font-black text-[#06C755]">+{totalPoints} แต้ม</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleSendInvite}
            className="py-3 px-3 rounded-xl bg-[#06C755] hover:bg-[#05b34c] active:scale-98 text-stone-950 text-xs font-black shadow-md transition flex items-center justify-center space-x-1.5"
          >
            <Share2 className="w-4 h-4" />
            <span>ส่งลิงก์เชิญ (LINE)</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="py-3 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-98 text-stone-200 text-xs font-bold border border-stone-700 transition flex items-center justify-center space-x-1.5"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold">คัดลอกแล้ว!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-stone-400" />
                <span>คัดลอกลิงก์</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Friends List Section */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between text-xs font-bold text-stone-300">
          <span>รายชื่อเพื่อนที่เข้าร่วมแล้ว ({friendsList.length} คน)</span>
          <span className="text-[#06C755] font-semibold">รวม +{totalPoints} แต้ม</span>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-xs text-stone-400 bg-[#132218] rounded-xl border border-[#1E3A24]">
            กำลังโหลดข้อมูลเพื่อน...
          </div>
        ) : friendsList.length === 0 ? (
          /* Empty State when 0 friends invited */
          <div className="p-8 text-center bg-[#132218] rounded-2xl border border-[#1E3A24] space-y-2">
            <div className="w-12 h-12 rounded-full bg-stone-800/80 border border-stone-700 flex items-center justify-center mx-auto text-stone-400">
              <UserPlus className="w-6 h-6 text-[#06C755]" />
            </div>
            <h4 className="text-sm font-bold text-stone-200">ยังไม่มีเพื่อนที่กดเข้าร่วม</h4>
            <p className="text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
              คุณยังไม่ได้เชิญใคร หรือยังไม่มีเพื่อนกดเข้าใช้งานผ่านลิงก์ของคุณ <br />
              กดปุ่ม <strong className="text-[#06C755]">"ส่งลิงก์เชิญ (LINE)"</strong> เพื่อเริ่มชวนเพื่อนคนแรกได้เลย!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {friendsList.map((friend) => (
              <div
                key={friend.id}
                className="p-3 bg-[#132218] rounded-xl border border-[#1E3A24] flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={friend.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                    alt={friend.name}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover border border-[#06C755]/50"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {friend.name}
                    </h4>
                    <span className="text-[10px] text-stone-400 font-medium">
                      {friend.joinedDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-[#06C755] border border-emerald-800 text-[11px] font-black flex items-center space-x-1">
                    <UserCheck className="w-3 h-3" />
                    <span>+1 แต้ม</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
