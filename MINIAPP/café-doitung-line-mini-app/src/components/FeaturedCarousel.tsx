'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, Sparkles, Leaf, Flame, Coffee } from 'lucide-react';
import { MenuItem } from '../types';

interface FeaturedCarouselProps {
  featuredItems: MenuItem[];
  onSelectItem: (item: MenuItem) => void;
}

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  featuredItems,
  onSelectItem
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Auto slide every 5 seconds
  useEffect(() => {
    if (featuredItems.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredItems.length]);

  if (!featuredItems || featuredItems.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? featuredItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const item = featuredItems[currentIndex];

  return (
    <div className="px-4 mt-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1.5">
          <Sparkles className="w-4 h-4 text-[#C5A059]" />
          <h2 className="text-sm font-bold text-stone-100 font-serif">
            Chef & Barista Recommendations
          </h2>
        </div>
        <span className="text-[10px] bg-emerald-950/80 text-[#06C755] border border-emerald-800/80 px-2 py-0.5 rounded-full font-bold">
          Featured Specials
        </span>

      </div>

      {/* Carousel Card Container */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative bg-white rounded-3xl border border-stone-200/90 shadow-md overflow-hidden transition-all duration-500"
      >
        {/* Carousel Image Header */}
        <div className="relative h-48 w-full bg-stone-900 overflow-hidden group">
          <img
            src={item.image}
            alt={item.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={(e) => {
              (e.target as HTMLElement).setAttribute(
                'src',
                'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
              );
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent"></div>

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#1E4D2B] text-amber-300 border border-[#C5A059]/50 shadow-md flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{item.badge || 'DoiTung Special'}</span>
            </span>
          </div>

          {/* Controls: Prev & Next Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition shadow-md"
            aria-label="Previous featured item"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition shadow-md"
            aria-label="Next featured item"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Price Tag Overlay */}
          <div className="absolute bottom-3 right-3 bg-[#1E4D2B]/95 text-white backdrop-blur-md px-3 py-1 rounded-2xl border border-emerald-500/40 shadow-lg">
            <span className="text-[10px] text-emerald-200 block font-light leading-none">Price</span>
            <span className="text-base font-extrabold text-amber-300">฿{item.price.toLocaleString()}</span>
          </div>

          {/* Title on Image */}
          <div className="absolute bottom-3 left-3 right-20 text-white">
            <h3 className="text-base font-bold font-serif leading-tight drop-shadow-sm">
              {item.name}
            </h3>
            <p className="text-xs text-emerald-200 font-medium">{item.thName}</p>
          </div>
        </div>

        {/* Description & Action Footer */}
        <div className="p-3.5 space-y-3 bg-[#FDFBF7]">
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-stone-200/80">
            {/* Dots indicator */}
            <div className="flex items-center space-x-1.5">
              {featuredItems.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'w-6 bg-[#1E4D2B]'
                      : 'w-2 bg-stone-300 hover:bg-stone-400'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => onSelectItem(item)}
              className="py-2 px-4 rounded-xl bg-[#1E4D2B] hover:bg-emerald-900 text-white text-xs font-bold shadow-md active:scale-95 transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span>Customize & Order</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
