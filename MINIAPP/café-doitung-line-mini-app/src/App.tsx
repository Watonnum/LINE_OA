'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Leaf, Coffee, ChevronRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import liff from '@line/liff';
import { MenuItem, CategoryType, CartItem, Branch, LineUserProfile, MiniAppTab } from './types';
import { BRANCHES, MENU_ITEMS } from './data/menuData';
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
import { createOrder, fetchOrderById, OrderResponse } from './api/orderService';
import { syncUserProfile, processReferral } from './services/userService';

import { fetchProducts, fetchBranches } from './services/productService';

export default function App() {
  const [branchesList, setBranchesList] = useState<Branch[]>(BRANCHES);
  const [productsList, setProductsList] = useState<MenuItem[]>(MENU_ITEMS);
  const [selectedBranch, setSelectedBranch] = useState<Branch>(BRANCHES[0]);
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
      const [prods, brs] = await Promise.all([fetchProducts(), fetchBranches()]);
      if (prods && prods.length > 0) setProductsList(prods);
      if (brs && brs.length > 0) {
        setBranchesList(brs);
        setSelectedBranch(brs[0]);
      }
    }
    loadInitialData();
  }, []);

  // Sync user profile to Firestore when user logs in & process referral if arriving via invite link
  useEffect(() => {
    if (lineProfile) {
      syncUserProfile(lineProfile).then((pts) => {
        if (pts !== undefined) setUserBeans(pts);
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
      const orderPayload = {
        lineUserId: lineProfile?.userId,
        branch: selectedBranch.name,
        items: cartItems.map((ci) => ({
          itemName: ci.menuItem.name,
          temp: ci.customization.temp,
          sweetness: ci.customization.sweetness,
          milk: ci.customization.milk,
          price: ci.totalPrice,
          quantity: ci.customization.quantity,
          ecoCup: ci.customization.ecoCup,
          notes: ci.customization.notes
        })),
        totalAmount: totalCartPrice,
        pickupTime: customerData.pickupTime,
        customerName: customerData.customerName,
        customerPhone: customerData.customerPhone,
        note: customerData.note
      };

      const resultOrder = await createOrder(orderPayload);
      setConfirmedOrder(resultOrder);
      setCartItems([]);
      setIsCartOpen(false);
      setUserBeans((prev) => prev + 20); // Earn 20 beans per pre-order
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
                    Ticket
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
                  <span>Showing {filteredMenuItems.length} Specialty Items</span>
                  <span className="text-[#06C755] font-semibold">Chiang Rai Arabica</span>
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
                <h2 className="text-lg font-black text-white">Your Orders (ประวัติคำสั่งซื้อ)</h2>
                <span className="text-xs text-[#06C755] bg-[#132218] px-2.5 py-1 rounded-full border border-[#1E3A24]">
                  Pickup Orders
                </span>
              </div>

              {confirmedOrder ? (
                <div className="p-4 bg-[#132218] rounded-2xl border border-[#06C755]/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase">Order ID</span>
                      <p className="text-xl font-black font-mono text-amber-400">#{confirmedOrder.orderId}</p>
                    </div>
                    <span className="px-3 py-1 bg-[#06C755] text-stone-950 text-xs font-black rounded-full">
                      {confirmedOrder.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-stone-300 space-y-1">
                    <p><strong>Store:</strong> {confirmedOrder.branch}</p>
                    <p><strong>Pickup:</strong> {confirmedOrder.pickupTime}</p>
                    <p><strong>Total:</strong> ฿{confirmedOrder.totalAmount.toLocaleString()}</p>
                  </div>

                  <button
                    onClick={() => setConfirmedOrder(confirmedOrder)}
                    className="w-full py-2 bg-[#06C755] text-stone-950 font-black text-xs rounded-xl hover:bg-[#05b34c]"
                  >
                    Show Pick-up Ticket (แสดงตั๋วรับสินค้า)
                  </button>
                </div>
              ) : (
                <div className="p-8 text-center bg-[#132218] rounded-2xl border border-dashed border-[#1E3A24] space-y-3">
                  <Coffee className="w-10 h-10 text-stone-600 mx-auto" />
                  <p className="text-stone-400 text-xs font-medium">ยังไม่มีรายการสั่งซื้อย้อนหลัง</p>
                  <button
                    onClick={() => setActiveTab('home')}
                    className="px-4 py-2 bg-[#06C755] text-stone-950 text-xs font-black rounded-xl"
                  >
                    สั่งเลยที่ Menu
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
        selectedBranch={selectedBranch}
        isLoggedIn={isLoggedIn}
        onLogin={handleLineLogin}
        lineUserProfile={lineProfile}
        onSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmitting}
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
