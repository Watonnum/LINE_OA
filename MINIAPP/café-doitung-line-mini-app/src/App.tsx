'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Leaf, Coffee, ChevronRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import liff from '@line/liff';
import { MenuItem, CategoryType, CartItem, LineUserProfile, MiniAppTab } from './types';
import { MENU_ITEMS } from './data/menuData';

import { LineHeader } from './components/LineHeader';
import { MenuCategories } from './components/MenuCategories';

import { MenuItemCard } from './components/MenuItemCard';
import { CustomizationModal } from './components/CustomizationModal';
import { CartDrawer } from './components/CartDrawer';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { BaristaQueueView } from './components/BaristaQueueView';
import { FeaturedCarousel } from './components/FeaturedCarousel';
import { BottomNavDock } from './components/BottomNavDock';
import { InviteFriendsTab } from './components/InviteFriendsTab';
import { createOrder, fetchOrderById, fetchOrders, OrderResponse } from './api/orderService';

import { syncUserProfile, processReferral, fetchUserCoupons, markCouponAsUsed, addPointsToUser, getUserPoints, saveUserPoints } from './services/userService';


import { fetchProducts } from './services/productService';
import { RedeemModal } from './components/RedeemModal';
import { UserCoupon } from './types';



export default function App() {
  const [productsList, setProductsList] = useState<MenuItem[]>(MENU_ITEMS);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [activeView, setActiveView] = useState<'customer' | 'barista'>('customer');

  const [activeTab, setActiveTab] = useState<MiniAppTab>('home');
  const [userBeans, setUserBeans] = useState<number>(380);

  // LIFF & LINE User Profile State
  const [isLiffInitialized, setIsLiffInitialized] = useState<boolean>(false);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isInClient, setIsInClient] = useState<boolean>(false);
  const [isSharePickerAvailable, setIsSharePickerAvailable] = useState<boolean>(false);
  const [lineProfile, setLineProfile] = useState<LineUserProfile | null>(null);
  const [liffError, setLiffError] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState<boolean>(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Initialize LIFF safely
  useEffect(() => {
    const initLiff = async () => {
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID || (import.meta as any).env?.VITE_LIFF_ID || '';
      const isPlaceholderId = !liffId || liffId.includes('xxxx') || liffId.includes('YOUR_LIFF_ID');

      if (isPlaceholderId) {
        setIsLiffInitialized(true);
        setIsSharePickerAvailable(true);
        setLiffError('LIFF ID is placeholder (Demo Mode)');
        setIsAuthChecking(false);
        return;
      }

      try {
        await liff.init({
          liffId,
          withLoginOnExternalBrowser: false // Set to false to prevent iframe redirect loops to access.line.me
        });
        setIsLiffInitialized(true);
        const inClient = liff.isInClient();
        setIsInClient(inClient);

        // Clean up stale OAuth query params (?code=...&state=...) from browser URL so refresh works cleanly
        if (typeof window !== 'undefined' && window.location.search.includes('code=')) {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }

        // Check if shareTargetPicker API is available
        if (liff.isApiAvailable('shareTargetPicker')) {
          setIsSharePickerAvailable(true);
        } else {
          // Fallback availability for web demonstration mode when user is logged in
          setIsSharePickerAvailable(true);
        }

        // Check if user is logged in via LIFF
        if (liff.isLoggedIn()) {
          setIsLoggedIn(true);
          const profile = await liff.getProfile();
          setLineProfile({
            userId: profile.userId,
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
            statusMessage: profile.statusMessage
          });
        }
      } catch (err: any) {
        console.warn('LIFF init warning:', err?.message || err);
        setIsLiffInitialized(true);
        setIsSharePickerAvailable(true);
        setLiffError(err?.message || 'LIFF Init Failed');
      } finally {
        setIsAuthChecking(false);
      }
    };

    initLiff();

  }, []);

  // Fetch real data from Firebase/Services
  useEffect(() => {
    async function loadInitialData() {
      const prods = await fetchProducts();
      if (prods && prods.length > 0) setProductsList(prods);
    }
    loadInitialData();
  }, []);


  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState<boolean>(false);
  const [userCoupons, setUserCoupons] = useState<UserCoupon[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<UserCoupon | null>(null);

  // Sync user profile & fetch user points/coupons when user logs in or on mount
  useEffect(() => {
    const activeUid = lineProfile?.userId || 'guest_user';

    if (lineProfile) {
      syncUserProfile(lineProfile).then((pts) => {
        if (pts !== undefined && pts > 0) setUserBeans(pts);
      });

      // Check if friend arrived via referral link (?ref=USER_ID)
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const referrerId = urlParams.get('ref');
        if (referrerId && referrerId !== lineProfile.userId) {
          processReferral(referrerId, lineProfile);
        }
      }
    }

    getUserPoints(activeUid).then((pts) => {
      if (pts !== undefined && pts > 0) setUserBeans(pts);
    });

    fetchUserCoupons(activeUid).then((coups) => {
      if (coups) setUserCoupons(coups);
    });
  }, [lineProfile]);






  const handleLineLogin = () => {
    setIsLoggingIn(true);
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID || (import.meta as any).env?.VITE_LIFF_ID || '';
    const isPlaceholderId = !liffId || liffId.includes('xxxx') || liffId.includes('YOUR_LIFF_ID');

    if (isLiffInitialized && !isPlaceholderId) {
      try {
        if (!liff.isLoggedIn()) {
          liff.login();
        } else {
          setIsLoggedIn(true);
          setIsLoggingIn(false);
        }
      } catch (e) {
        console.warn('liff.login failed:', e);
        setIsLoggingIn(false);
      }
    } else {
      // Demo Mode fallback with smooth UX delay
      setTimeout(() => {
        setIsLoggedIn(true);
        setLineProfile({
          userId: 'U' + Math.random().toString(36).substring(2, 10) + '94a',
          displayName: 'LINE Customer (สมชาย)',
          pictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          statusMessage: 'DoiTung Specialty Coffee Fan ☕️'
        });
        setIsLoggingIn(false);
      }, 400);
    }
  };



  const handleLineLogout = () => {
    try {
      if (liff.isLoggedIn()) {
        liff.logout();
      }
    } catch (e) {
      console.warn('liff.logout exception:', e);
    }
    setIsLoggedIn(false);
    setLineProfile(null);
  };

  // Invite Friends handler using LINE Share Target Picker Flex Message
  const handleInviteFriends = async () => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID || '2010828712-odH8ncn8';
    const refParam = lineProfile?.userId ? `?ref=${lineProfile.userId}` : '';
    const liffUrl = `https://liff.line.me/${liffId}${refParam}`;


    if (isLiffInitialized && liff.isApiAvailable('shareTargetPicker')) {
      try {
        const res = await liff.shareTargetPicker([
          {
            type: 'flex',
            altText: 'ชวนสั่งกาแฟ Café DoiTung (คาเฟ่ดอยตุง) สั่งล่วงหน้าแล้วมารับที่ร้าน',
            contents: {
              type: 'bubble',
              hero: {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
                size: 'full',
                aspectRatio: '20:13',
                aspectMode: 'cover'
              },
              body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'text',
                    text: 'Café DoiTung (คาเฟ่ดอยตุง)',
                    weight: 'bold',
                    size: 'xl',
                    color: '#1E4D2B'
                  },
                  {
                    type: 'text',
                    text: 'สั่งกาแฟล่วงหน้าแล้วมารับหน้าร้านด้วยกันที่ Café DoiTung!',
                    margin: 'md',
                    color: '#555555',
                    size: 'sm',
                    wrap: true
                  }
                ]
              },
              footer: {
                type: 'box',
                layout: 'vertical',
                spacing: 'sm',
                contents: [
                  {
                    type: 'button',
                    action: {
                      type: 'uri',
                      label: 'สั่งกาแฟเลย',
                      uri: liffUrl
                    },
                    style: 'primary',
                    color: '#1E4D2B'
                  }
                ]
              }
            }
          }
        ]);
        if (res) {
          alert('ส่งข้อความเชิญเพื่อนผ่าน LINE สำเร็จ! เมื่อเพื่อนกดลิงก์และเข้าสู่ระบบ คุณจะได้รับ +1 แต้ม');
          setUserBeans((prev) => prev + 1);
        }
      } catch (err) {
        console.error('liff.shareTargetPicker error:', err);
      }
    } else {
      alert('🟢 [LINE Share Target Picker Demo]\n\nส่งข้อความเชิญเพื่อนเรียบร้อยแล้ว!\nรับเพิ่ม +1 แต้ม 🌟');
      setUserBeans((prev) => prev + 1);
    }
  };


  // Customization modal state
  const [selectedItemForCustom, setSelectedItemForCustom] = useState<MenuItem | null>(null);

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Order submission & confirmation modal state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderResponse | null>(null);
  const [ordersHistory, setOrdersHistory] = useState<OrderResponse[]>([]);

  // Load orders history from localStorage and API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cafe_doitung_orders');
        if (saved) {
          setOrdersHistory(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Failed to parse saved orders:', err);
      }
    }

    fetchOrders().then((list) => {
      if (list && list.length > 0) {
        setOrdersHistory((prev) => {
          const merged = [...prev];
          for (const item of list) {
            if (!merged.some((o) => o.orderId === item.orderId)) {
              merged.push(item);
            }
          }
          return merged;
        });
      }
    });
  }, []);


  const isAnyModalOpen = Boolean(selectedItemForCustom || isCartOpen || isRedeemModalOpen || confirmedOrder);

  // Lock background body scroll when any modal/drawer is active

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isAnyModalOpen) {
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
      } else {
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
      }
    };
  }, [isAnyModalOpen]);



  // Filtered menu items
  const filteredMenuItems = productsList.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  // Featured recommendation items for carousel
  const featuredMenuItems = productsList.filter(
    (item) => item.badge || item.isPopular || item.category === 'coffee'
  ).slice(0, 5);


  // Cart totals
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.customization.quantity, 0);
  const totalCartPrice = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleAddToCart = (cartItem: CartItem) => {
    setCartItems((prev) => [...prev, cartItem]);
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleSubmitOrder = async (customerData: {
    pickupTime: string;
    customerName: string;
    customerPhone: string;
    note: string;
  }) => {
    setIsSubmitting(true);
    try {
      const rawSubtotal = cartItems.reduce((acc, i) => acc + i.totalPrice, 0);
      const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
      const finalTotal = Math.max(0, rawSubtotal - couponDiscount);

      const orderPayload = {
        lineUserId: lineProfile?.userId,
        branch: 'Café DoiTung',

        items: cartItems.map((ci) => ({
          itemName: ci.menuItem.name,
          temp: ci.customization.temp,
          sweetness: ci.customization.sweetness,
          milk: ci.customization.milk,
          price: ci.totalPrice,
          quantity: ci.customization.quantity,
          ecoCup: ci.customization.ecoCup,
          notes: ci.customization.notes,
          image: ci.menuItem.image
        })),
        subtotalAmount: rawSubtotal,
        discountAmount: couponDiscount,
        appliedCouponTitle: appliedCoupon ? appliedCoupon.thTitle : undefined,
        totalAmount: finalTotal,
        pickupTime: customerData.pickupTime,
        customerName: customerData.customerName,
        customerPhone: customerData.customerPhone,
        note: customerData.note
      };



      const resultOrder = await createOrder(orderPayload);
      setConfirmedOrder(resultOrder);
      setOrdersHistory((prev) => {
        const updated = [resultOrder, ...prev.filter((o) => o.orderId !== resultOrder.orderId)];
        if (typeof window !== 'undefined') {
          localStorage.setItem('cafe_doitung_orders', JSON.stringify(updated));
        }
        return updated;
      });

      // Single-use enforcement: Mark applied coupon as used
      if (appliedCoupon) {
        const uid = lineProfile?.userId || 'guest_user';
        markCouponAsUsed(uid, appliedCoupon.id);
        setUserCoupons((prev) =>
          prev.map((c) => (c.id === appliedCoupon.id ? { ...c, isUsed: true } : c))
        );
        setAppliedCoupon(null);
      }

      setCartItems([]);
      setIsCartOpen(false);

      const activeUid = lineProfile?.userId || 'guest_user';
      const pointsEarned = Math.max(20, Math.floor(finalTotal / 20));
      const updatedBeans = await addPointsToUser(activeUid, pointsEarned);
      setUserBeans(updatedBeans);


    } catch (error: any) {
      console.error('Submission failed:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefreshStatus = async () => {
    if (!confirmedOrder) return;
    const updated = await fetchOrderById(confirmedOrder.orderId);
    if (updated) {
      setConfirmedOrder(updated);
    }
  };

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-[#0A110C] text-stone-200 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#06C755] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A110C] text-stone-100 font-sans antialiased pb-28">

      {/* LINE Mini App Top Header */}
      <LineHeader
        isLoggedIn={isLoggedIn}
        profile={lineProfile}
        userBeans={userBeans}
        isAuthChecking={isAuthChecking}
        isLoggingIn={isLoggingIn}
        onLogin={handleLineLogin}
        onLogout={handleLineLogout}
      />

      {activeView === 'barista' ? (
        <BaristaQueueView />
      ) : (
        <main className="max-w-md mx-auto space-y-4 pt-2">



          {/* Render Views based on activeTab */}
          {activeTab === 'home' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Active Pre-Order Banner Notification if any */}
              {confirmedOrder && (
                <div
                  onClick={() => setConfirmedOrder(confirmedOrder)}
                  className="mx-4 p-3 bg-gradient-to-r from-emerald-950 via-[#132218] to-stone-900 text-white rounded-2xl shadow-lg border border-[#06C755]/50 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#06C755] text-stone-950 flex items-center justify-center font-black text-xs">
                      DT
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-100 flex items-center space-x-1">
                        <span>Active Order #{confirmedOrder.orderId}</span>
                        <span className="w-2 h-2 rounded-full bg-[#06C755] animate-pulse"></span>
                      </div>
                      <p className="text-[11px] text-stone-300">
                        Status: <strong className="text-amber-300">{confirmedOrder.status.replace(/_/g, ' ')}</strong> • {confirmedOrder.pickupTime}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmedOrder(confirmedOrder)}
                    className="text-xs font-bold bg-[#06C755] text-stone-950 px-2.5 py-1 rounded-xl"
                  >
                    ตั๋วรับสินค้า
                  </button>
                </div>
              )}

              {/* Sample Menu Carousel featuring high-quality images, dish name, short description, and price */}
              <FeaturedCarousel
                featuredItems={featuredMenuItems}
                onSelectItem={setSelectedItemForCustom}
              />

              {/* Menu Categories & Eco Banner */}
              <MenuCategories
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
              />

              {/* Menu Item Cards Grid */}
              <div className="px-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-400 font-medium px-1 pt-1">
                  <span>ทั้งหมด {filteredMenuItems.length} รายการ</span>
                  <span className="text-[#06C755] font-semibold">กาแฟอาราบิก้าดอยตุง</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {filteredMenuItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onSelectItem={setSelectedItemForCustom}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'friends' && (
            <div className="animate-in fade-in">
              <InviteFriendsTab
                userBeans={userBeans}
                isLoggedIn={isLoggedIn}
                onLogin={handleLineLogin}
                onInvite={handleInviteFriends}
              />
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="px-4 py-3 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-white">ประวัติคำสั่งซื้อ</h2>
                <span className="text-xs text-[#06C755] bg-[#132218] px-2.5 py-1 rounded-full border border-[#1E3A24] font-bold">
                  {ordersHistory.length} ออเดอร์
                </span>
              </div>

              {ordersHistory.length > 0 ? (
                <div className="space-y-3">
                  {ordersHistory.map((ord) => (
                    <div
                      key={ord.orderId}
                      className="p-4 bg-[#132218] rounded-2xl border border-[#1E3A24] space-y-3 transition hover:border-emerald-800"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                            รหัสคำสั่งซื้อ
                          </span>
                          <p className="text-lg font-black font-mono text-[#C5A059]">{ord.orderId}</p>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-950 text-[#06C755] border border-emerald-700/50 text-[11px] font-bold rounded-full">
                          {ord.status ? ord.status.replace(/_/g, ' ') : 'รับออเดอร์แล้ว'}
                        </span>
                      </div>

                      {/* Items with Thumbnails */}
                      <div className="space-y-2 pt-1 border-t border-[#1E3A24]/60">
                        {ord.items && ord.items.length > 0 ? (
                          ord.items.map((item, iIdx) => (
                            <div key={iIdx} className="flex items-center justify-between gap-2">
                              <div className="flex items-center space-x-2.5 min-w-0">
                                <img
                                  src={
                                    item.image ||
                                    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=150&q=80'
                                  }
                                  alt={item.itemName}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 rounded-xl object-cover border border-stone-800 flex-shrink-0"
                                />
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-stone-100 truncate">
                                    {item.itemName} <span className="text-[#06C755]">x{item.quantity}</span>
                                  </h4>
                                  <p className="text-[10px] text-stone-400 truncate">
                                    {item.temp} • หวาน {item.sweetness}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-[#C5A059] flex-shrink-0">
                                ฿{item.price.toLocaleString()}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-stone-300">กาแฟสดดอยตุง</p>
                        )}
                      </div>

                      {/* Discount Status Badge */}
                      <div className="text-xs pt-2 border-t border-[#1E3A24] space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] text-stone-400">สิทธิ์ส่วนลด:</span>
                          {ord.appliedCouponTitle || (ord.discountAmount && ord.discountAmount > 0) ? (
                            <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/50">
                              🎟️ {ord.appliedCouponTitle || 'คูปองส่วนลด'} (-฿{ord.discountAmount || 0})
                            </span>
                          ) : (
                            <span className="text-[11px] text-stone-400 bg-stone-900 px-2 py-0.5 rounded-md border border-stone-800">
                              🏷️ ไม่ได้ใช้ส่วนลด
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between items-center pt-1 text-sm font-bold">
                          <span className="text-stone-300">ยอดรวมสุทธิ:</span>
                          <span className="text-amber-400 font-mono text-base">฿{ord.totalAmount.toLocaleString()}</span>
                        </div>
                      </div>


                      <button
                        onClick={() => setConfirmedOrder(ord)}
                        className="w-full py-2.5 bg-[#06C755] hover:bg-[#05b34c] text-stone-950 font-black text-xs rounded-xl shadow-md transition"
                      >
                        แสดงตั๋วรับสินค้า
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-[#132218] rounded-2xl border border-dashed border-[#1E3A24] space-y-3">
                  <Coffee className="w-10 h-10 text-stone-600 mx-auto" />
                  <p className="text-stone-400 text-xs font-medium">ยังไม่มีรายการสั่งซื้อย้อนหลัง</p>
                  <button
                    onClick={() => setActiveTab('home')}
                    className="px-4 py-2 bg-[#06C755] text-stone-950 text-xs font-black rounded-xl"
                  >
                    สั่งเลยที่เมนูสินค้า
                  </button>
                </div>
              )}
            </div>
          )}

        </main>
      )}

      {/* Floating Bottom Cart Bar for Home View */}
      {activeView === 'customer' && cartItems.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-40 px-4 max-w-md mx-auto animate-in slide-in-from-bottom-4">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#06C755] text-stone-950 shadow-2xl hover:bg-[#05b34c] active:scale-98 transition flex items-center justify-between border border-emerald-400"
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-stone-950 text-[#06C755] flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5 text-[#06C755]" />
                </div>
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-black flex items-center justify-center border-2 border-stone-950">
                  {totalCartCount}
                </span>
              </div>
              <div className="text-left">
                <div className="text-xs text-stone-900 font-bold">View Pre-Order Cart</div>
                <div className="text-sm font-black text-stone-950">
                  {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'} selected
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-base font-black text-stone-950">
                ฿{totalCartPrice.toLocaleString()}
              </span>
              <ChevronRight className="w-5 h-5 text-stone-950" />
            </div>
          </button>
        </div>
      )}

      {/* Persistent Bottom Nav Dock for LINE Mini App */}
      {activeView === 'customer' && (
        <BottomNavDock
          activeTab={activeTab}
          onTabChange={setActiveTab}
          cartCount={totalCartCount}
        />
      )}

      {/* Customization Modal */}
      <CustomizationModal
        item={selectedItemForCustom}
        isLoggedIn={isLoggedIn}
        onLogin={handleLineLogin}
        onClose={() => setSelectedItemForCustom(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart & Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        isLoggedIn={isLoggedIn}

        onLogin={handleLineLogin}
        lineUserProfile={lineProfile}
        userBeans={userBeans}
        onOpenRedeemModal={() => setIsRedeemModalOpen(true)}
        appliedCoupon={appliedCoupon}
        onSelectCoupon={setAppliedCoupon}
        userCoupons={userCoupons}
        onSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmitting}
      />

      {/* Points & Coupons Redemption Modal */}
      <RedeemModal
        isOpen={isRedeemModalOpen}
        onClose={() => setIsRedeemModalOpen(false)}
        userId={lineProfile?.userId}
        userBeans={userBeans}
        onPointsUpdated={setUserBeans}
        onCouponRedeemed={(newCoupon) => {
          setUserCoupons((prev) => [newCoupon, ...prev]);
          setAppliedCoupon(newCoupon);
        }}
      />

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onRefreshStatus={handleRefreshStatus}
      />
    </div>
  );
}

