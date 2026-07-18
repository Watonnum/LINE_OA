"use client";

import React, { useState, useEffect } from "react";
import { useLiff } from "@/context/LiffContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, onSnapshot } from "firebase/firestore";
import ProductCard from "@/components/ProductCard";
import CartTab from "@/components/CartTab";
import OrdersTab from "@/components/OrdersTab";

export default function Home() {
  const { userProfile, isLoading: isLiffLoading, error: liffError } = useLiff();
  const [activeTab, setActiveTab] = useState("menu"); // menu, cart, orders
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [cart, setCart] = useState([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [userDbProfile, setUserDbProfile] = useState(null);
  const [successOrder, setSuccessOrder] = useState(null);

  // 1. Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsList = [];
        querySnapshot.forEach((doc) => {
          productsList.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setProducts(productsList);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 2. Fetch User Profile & Reward Points from Firestore
  useEffect(() => {
    if (!userProfile?.userId) return;

    const userRef = doc(db, "users", userProfile.userId);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserDbProfile(docSnap.data());
      } else {
        // Fallback default points for new user
        setUserDbProfile({ rewardPoints: 120 });
      }
    }, (err) => {
      console.error("Failed to listen to user profile changes:", err);
    });

    return () => unsubscribe();
  }, [userProfile]);

  // 3. Filter products by category during render
  const filteredProducts = selectedCategory === "ทั้งหมด"
    ? products
    : products.filter((p) => p.category === selectedCategory);

  // 4. Cart logic
  const handleAddToCart = (product, change) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => (item.product.id || item.product.name) === (product.id || product.name));
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + change;
        if (newQuantity <= 0) {
          return prevCart.filter((item) => (item.product.id || item.product.name) !== (product.id || product.name));
        }
        return prevCart.map((item) =>
          (item.product.id || item.product.name) === (product.id || product.name)
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else if (change > 0) {
        return [...prevCart, { product, quantity: 1 }];
      }
      return prevCart;
    });
  };

  const handleClearCart = () => setCart([]);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Loading Screens
  if (isLiffLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF8F5]">
        <div className="w-12 h-12 border-4 border-doitung-green border-t-transparent rounded-full animate-spin" />
        <h2 className="text-[#2A4B35] font-semibold text-base mt-4 font-sans">กำลังเตรียมข้อมูลร้านอาหาร...</h2>
      </div>
    );
  }

  if (liffError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF8F5] p-6 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-red-700 font-semibold text-lg font-sans">เกิดข้อผิดพลาดในการโหลดระบบ</h2>
        <p className="text-sm text-stone-500 mt-2 max-w-sm">{liffError}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2.5 bg-doitung-green text-white text-sm font-semibold rounded-full shadow-md"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-[#FAF8F5] shadow-lg relative pb-16 font-sans">
      
      {/* 1. Header component */}
      <header className="sticky top-0 z-50 bg-[#2A4B35] text-white p-4 rounded-b-[2rem] shadow-md flex items-center justify-between">
        <div className="flex items-center">
          {userProfile?.pictureUrl ? (
            <img
              src={userProfile.pictureUrl}
              alt={userProfile.displayName}
              className="w-12 h-12 rounded-full border-2 border-white/20 object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-doitung-green-light border-2 border-white/20 flex items-center justify-center font-bold text-lg">
              {userProfile?.displayName?.charAt(0) || "U"}
            </div>
          )}
          <div className="ml-3">
            <h4 className="text-xs text-white/70">ยินดีต้อนรับ</h4>
            <h2 className="font-bold text-sm leading-tight text-white line-clamp-1">{userProfile?.displayName || "LINE Customer"}</h2>
          </div>
        </div>

        {/* Loyalty Points Badge */}
        <div className="bg-[#1A2E21] px-3 py-1.5 rounded-full flex items-center border border-white/10 shadow-inner">
          <span className="text-doitung-gold text-sm mr-1">⭐</span>
          <span className="text-xs font-bold text-white">
            {userDbProfile?.rewardPoints ?? 120} <span className="text-[10px] font-normal text-white/60">แต้ม</span>
          </span>
        </div>
      </header>

      {/* 2. Success Screen Overlay */}
      {successOrder && (
        <div className="absolute inset-0 bg-[#FAF8F5] z-50 flex flex-col items-center justify-center p-6 text-center animate-slide-up">
          <div className="w-24 h-24 bg-[#E8F5E9] rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner animate-bounce">
            🎉
          </div>
          <h2 className="text-[#2A4B35] font-bold text-2xl">สั่งอาหารสำเร็จแล้ว!</h2>
          <p className="text-sm text-stone-500 mt-2">ขอบคุณที่ร่วมสนับสนุนกาแฟและผลิตภัณฑ์จากดอยตุงครับ</p>
          
          <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm w-full my-6 max-w-xs text-left">
            <div className="flex justify-between text-xs text-stone-400 mb-2">
              <span>หมายเลขออเดอร์</span>
              <span className="font-bold text-stone-800">{successOrder.orderNumber}</span>
            </div>
            <div className="flex justify-between text-xs text-stone-400 mb-2">
              <span>ราคาสุทธิ</span>
              <span className="font-bold text-doitung-green">{successOrder.totalAmount} THB</span>
            </div>
            <div className="flex justify-between text-xs text-stone-400">
              <span>แต้มที่ได้รับเพิ่ม</span>
              <span className="font-bold text-doitung-gold">+{successOrder.earnedPoints} แต้ม</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={() => {
                setSuccessOrder(null);
                setActiveTab("orders");
              }}
              className="py-3 bg-doitung-green hover:bg-doitung-green-light text-white font-semibold rounded-2xl shadow-md transition-colors"
            >
              ติดตามสถานะคำสั่งซื้อ
            </button>
            <button
              onClick={() => setSuccessOrder(null)}
              className="py-3 border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-semibold rounded-2xl transition-colors"
            >
              สั่งเครื่องดื่มต่อ
            </button>
          </div>
        </div>
      )}

      {/* 3. Main content based on active tab */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === "menu" && (
          <div className="p-4 flex flex-col gap-4">
            
            {/* Promo Banner */}
            <div className="relative h-28 w-full bg-[#5D4037] rounded-3xl overflow-hidden p-5 flex flex-col justify-center text-white shadow-sm border border-[#3E2723]/10">
              <span className="text-[10px] uppercase font-bold tracking-wider text-doitung-gold">โปรโมชั่นพิเศษ</span>
              <h3 className="font-bold text-base mt-1">DoiTung Macadamia Latte</h3>
              <p className="text-xs text-white/80 mt-1">ลิ้มรสกาแฟซิกเนเจอร์ ผสานถั่วแมคคาเดเมียหอมมัน</p>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {["ทั้งหมด", "Coffee", "Non-Coffee", "Bakery"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-doitung-green text-white border-doitung-green shadow-xs"
                      : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  {cat === "ทั้งหมด" ? "ทั้งหมด" : cat}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            {isProductsLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-doitung-green border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-stone-400 mt-2">กำลังโหลดรายการอาหาร...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 text-stone-400 text-sm">
                ไม่พบสินค้าในหมวดหมู่นี้
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredProducts.map((product) => {
                  const cartItem = cart.find((item) => (item.product.id || item.product.name) === product.id);
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      cartQuantity={cartItem ? cartItem.quantity : 0}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "cart" && (
          <CartTab
            cart={cart}
            onUpdateQuantity={handleAddToCart}
            onClearCart={handleClearCart}
            userProfile={userProfile}
            onOrderSuccess={setSuccessOrder}
          />
        )}

        {activeTab === "orders" && (
          <OrdersTab userProfile={userProfile} />
        )}
      </main>

      {/* 4. Bottom Tab Bar Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-stone-100 flex py-2 px-6 justify-between items-center z-40 shadow-lg">
        <button
          onClick={() => setActiveTab("menu")}
          className={`flex flex-col items-center flex-1 cursor-pointer transition-colors ${
            activeTab === "menu" ? "text-doitung-green" : "text-stone-400 hover:text-stone-600"
          }`}
        >
          <span className="text-xl">☕</span>
          <span className="text-[10px] font-semibold mt-1">เมนูสั่งซื้อ</span>
        </button>

        <button
          onClick={() => setActiveTab("cart")}
          className={`flex flex-col items-center flex-1 relative cursor-pointer transition-colors ${
            activeTab === "cart" ? "text-doitung-green" : "text-stone-400 hover:text-stone-600"
          }`}
        >
          <span className="text-xl">🛒</span>
          <span className="text-[10px] font-semibold mt-1">ตะกร้า</span>
          {totalCartItems > 0 && (
            <span className="absolute top-0 right-7 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
              {totalCartItems}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`flex flex-col items-center flex-1 cursor-pointer transition-colors ${
            activeTab === "orders" ? "text-doitung-green" : "text-stone-400 hover:text-stone-600"
          }`}
        >
          <span className="text-xl">📋</span>
          <span className="text-[10px] font-semibold mt-1">ออเดอร์</span>
        </button>
      </nav>
    </div>
  );
}
