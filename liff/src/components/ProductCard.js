"use client";

import React from "react";

export default function ProductCard({ product, onAddToCart, cartQuantity = 0 }) {
  const { name, description, price, imageUrl, isAvailable } = product;

  return (
    <div className="flex bg-white rounded-2xl p-4 shadow-sm border border-stone-100 hover:shadow-md transition-shadow duration-300 relative overflow-hidden animate-slide-up">
      {/* Product Image */}
      <div className="w-24 h-24 relative rounded-xl overflow-hidden bg-stone-100 shrink-0">
        <img
          src={imageUrl || "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=200"}
          alt={name}
          className="object-cover w-full h-full"
        />
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white text-xs font-semibold px-2 py-1 rounded bg-red-600/80">
              หมด
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-1 ml-4 justify-between">
        <div>
          <h3 className="font-semibold text-doitung-green-dark text-base line-clamp-1">
            {name}
          </h3>
          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex justify-between items-center mt-3">
          <span className="font-bold text-doitung-green text-lg">
            {price} <span className="text-xs font-normal text-stone-500">THB</span>
          </span>

          {isAvailable ? (
            <div className="flex items-center">
              {cartQuantity > 0 ? (
                <div className="flex items-center bg-doitung-green/10 rounded-full p-0.5 border border-doitung-green/20">
                  <button
                    onClick={() => onAddToCart(product, -1)}
                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-doitung-green font-bold shadow-sm active:scale-95 transition-transform"
                  >
                    -
                  </button>
                  <span className="px-3 text-sm font-semibold text-doitung-green-dark">
                    {cartQuantity}
                  </span>
                  <button
                    onClick={() => onAddToCart(product, 1)}
                    className="w-7 h-7 rounded-full bg-doitung-green flex items-center justify-center text-white font-bold shadow-sm active:scale-95 transition-transform"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onAddToCart(product, 1)}
                  className="px-4 py-1.5 bg-doitung-green hover:bg-doitung-green-light active:scale-95 transition-all text-white text-sm font-medium rounded-full shadow-sm"
                >
                  เพิ่ม
                </button>
              )}
            </div>
          ) : (
            <span className="text-stone-400 text-xs font-medium">ไม่พร้อมจำหน่าย</span>
          )}
        </div>
      </div>
    </div>
  );
}
