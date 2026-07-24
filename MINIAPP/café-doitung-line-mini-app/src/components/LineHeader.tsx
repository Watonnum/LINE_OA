'use client';

import React, { useState } from 'react';

import { MapPin, Clock, Share2, MoreVertical, Coffee, Check, ChevronDown, RefreshCw, Layers } from 'lucide-react';
import { Branch } from '../types';
import { BRANCHES } from '../data/menuData';

interface LineHeaderProps {
  selectedBranch: Branch;
  onSelectBranch: (branch: Branch) => void;
  activeView: 'customer' | 'barista';
  onToggleView: (view: 'customer' | 'barista') => void;
  activeOrderCount: number;
  onInviteFriends?: () => void;
}

export const LineHeader: React.FC<LineHeaderProps> = ({
  selectedBranch,
  onSelectBranch,
  activeView,
  onToggleView,
  activeOrderCount,
  onInviteFriends
}) => {
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#1E4D2B] text-white shadow-md">
      {/* Brand Header with Hero Image Banner */}
      <div className="relative overflow-hidden bg-[#1E4D2B] text-white">
        {/* Background Hero Image with Dark Gradient Overlay */}
        <div className="absolute inset-0 z-0 opacity-35 mix-blend-overlay">
          <img
            src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80"
            alt="DoiTung Coffee Plantation"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="relative z-10 px-4 pt-3.5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-[#FDFBF7] p-0.5 flex items-center justify-center shadow-lg border-2 border-[#C5A059] flex-shrink-0">
                <div className="w-full h-full rounded-full bg-[#1E4D2B] flex items-center justify-center text-[#C5A059]">
                  <Coffee className="w-6 h-6" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold tracking-tight text-stone-50 font-serif drop-shadow-xs">
                    Café DoiTung
                  </h1>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#C5A059] text-stone-900 font-extrabold shadow-xs">
                    คาเฟ่ดอยตุง
                  </span>
                </div>
                <p className="text-xs text-emerald-100/90 font-light mt-0.5 drop-shadow-xs">
                  Sustainable Specialty Coffee from Chiang Rai • Pre-Order & Pickup
                </p>
              </div>
            </div>

            {/* Barista Mode Switch Button */}
            <button 
              onClick={() => onToggleView(activeView === 'customer' ? 'barista' : 'customer')}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-950/80 hover:bg-emerald-900 text-[#C5A059] border border-[#C5A059]/40 text-[11px] font-bold shadow-md transition flex-shrink-0"
              title="Toggle between Customer App and Barista Dashboard"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{activeView === 'customer' ? 'Barista' : 'App'}</span>
              {activeOrderCount > 0 && activeView === 'customer' && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              )}
            </button>
          </div>

          {/* Pickup Branch Selector Dropdown Trigger */}
          <div className="mt-3">
            <button
              onClick={() => setIsBranchModalOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-emerald-950/75 hover:bg-emerald-950/90 border border-emerald-500/40 text-left transition text-stone-100 shadow-md backdrop-blur-xs"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <MapPin className="w-4 h-4 text-[#C5A059] flex-shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] text-emerald-200/90 flex items-center space-x-1">
                    <span>Pickup Store</span>
                    <span className="text-[10px] text-emerald-300">({selectedBranch.distance})</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold truncate text-stone-50">
                    {selectedBranch.name}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 flex-shrink-0 pl-2">
                <span className="text-[11px] px-2 py-0.5 rounded-lg bg-amber-500/25 text-amber-200 border border-amber-400/30 flex items-center space-x-1 font-semibold">
                  <Clock className="w-3 h-3 text-amber-300" />
                  <span>~{selectedBranch.avgWaitMins}m wait</span>
                </span>
                <ChevronDown className="w-4 h-4 text-emerald-200" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Branch Selection Modal */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#FDFBF7] text-stone-900 rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden border border-stone-200 max-h-[85vh] flex flex-col">
            <div className="p-4 bg-[#1E4D2B] text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-100">Select Pick-up Branch</h3>
                <p className="text-xs text-emerald-200"> Choose your nearest Café DoiTung store</p>
              </div>
              <button
                onClick={() => setIsBranchModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-emerald-800 text-stone-200 text-xs px-2.5"
              >
                Close ✕
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto">
              {BRANCHES.map((b) => {
                const isSelected = b.id === selectedBranch.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => {
                      onSelectBranch(b);
                      setIsBranchModalOpen(false);
                    }}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'border-[#1E4D2B] bg-emerald-50/80 shadow-xs'
                        : 'border-stone-200 bg-white hover:border-emerald-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-stone-900 text-sm">{b.name}</h4>
                          {isSelected && (
                            <span className="flex items-center text-[10px] bg-[#1E4D2B] text-white px-2 py-0.5 rounded-full font-medium">
                              <Check className="w-3 h-3 mr-0.5" /> Selected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">{b.thName}</p>
                        <p className="text-xs text-stone-600 mt-1 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-[#1E4D2B] inline mr-1" />
                          <span>{b.location}</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-emerald-700" />
                        <span>Hours: {b.hours}</span>
                      </span>
                      <span className="font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        Est. queue: {b.avgWaitMins} mins
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
