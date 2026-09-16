'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { fetchCart, updateCartItemQty, removeCartItem, CartData } from '@/lib/api';
import { subscribeWishlist } from '@/lib/wishlist';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartData | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [deliveryDateRange, setDeliveryDateRange] = useState<string>('3 - 5 Business Days');

  useEffect(() => {
    const unsub = subscribeWishlist((ids) => setWishlist(ids));
    return () => unsub();
  }, []);

  useEffect(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() + 3);
    const end = new Date(today);
    end.setDate(today.getDate() + 5);

    const startStr = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const endStr = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    setDeliveryDateRange(`${startStr} - ${endStr}`);
  }, []);

  const loadCartData = async () => {
    try {
      setLoading(true);
      const data = await fetchCart();
      setCart(data);
      if (data && Array.isArray(data.items)) {
        setSelectedItemIds(data.items.map(item => item.id));
      }
    } catch (err) {
      console.log('Error loading cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCartData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSelectItem = (itemId: string) => {
    if (selectedItemIds.includes(itemId)) {
      setSelectedItemIds(prev => prev.filter(id => id !== itemId));
    } else {
      setSelectedItemIds(prev => [...prev, itemId]);
    }
  };

  const toggleSelectAll = () => {
    if (!cart) return;
    if (selectedItemIds.length === cart.items.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(cart.items.map(item => item.id));
    }
  };

  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) return;
    const token = typeof window !== 'undefined' ? (localStorage.getItem('riwaaya_token') || localStorage.getItem('token')) : null;
    if (!token) {
      router.push('/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  const handleQtyChange = async (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      setUpdatingId(itemId);
      const updated = await updateCartItemQty(itemId, newQty);
      setCart(updated);
    } catch (err) {
      console.error('Failed to update qty:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      setUpdatingId(itemId);
      const updated = await removeCartItem(itemId);
      setCart(updated);
      setSelectedItemIds(prev => prev.filter(id => id !== itemId));
    } catch (err) {
      console.error('Failed to remove item:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim()) {
      setAppliedPromo(promoCode.trim().toUpperCase());
    }
  };

  const selectedItems = cart?.items.filter(item => selectedItemIds.includes(item.id)) || [];
  const selectedSubtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const freeShippingThreshold = 5000;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - selectedSubtotal);
  const shippingProgress = Math.min(100, (selectedSubtotal / freeShippingThreshold) * 100);

  const shippingCost = (selectedSubtotal >= freeShippingThreshold || selectedItems.length === 0) ? 0 : 350;
  const discountAmount = appliedPromo ? 1000 : 0;
  const grandTotal = Math.max(0, selectedSubtotal + shippingCost - discountAmount);

  const allSelected = cart ? (cart.items.length > 0 && selectedItemIds.length === cart.items.length) : false;

  return (
    <div className="min-h-screen bg-[#f7efe3] text-[#1a0a0e] font-sans">
      {/* 2. Top Header Navigation */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b border-[#b8963e]/20 transition-all duration-300 px-4 sm:px-6 md:px-10 py-3 flex items-center justify-between ${scrolled ? 'bg-[#f7efe3]/95 shadow-md' : 'bg-[#f7efe3]/90'}`}>
        {/* Left: Brand Logo (Standard E-Commerce Size) */}
        <div className="flex items-center">
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/'); }} className="flex items-center">
            <Image 
              src="/assets/riwaaya_logo.png" 
              alt="Riwaaya Threads Logo" 
              width={140} 
              height={32} 
              className="h-7 sm:h-8 md:h-9 w-auto object-contain"
              priority
            />
          </a>
        </div>

        {/* Right: Search & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 justify-end">
          <button 
            className="p-1.5 text-stone-800 hover:text-[#6b1929] transition-colors rounded-lg hover:bg-[#b8963e]/10" 
            aria-label="Search"
            onClick={() => router.push('/collections/all')}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>

          <button 
            className="p-1.5 text-stone-800 hover:text-[#6b1929] transition-colors rounded-lg hover:bg-[#b8963e]/10" 
            aria-label="Profile"
            onClick={() => {
              const token = typeof window !== 'undefined' ? localStorage.getItem('riwaaya_token') : null;
              router.push(token ? '/profile' : '/login');
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-[70px] bottom-0 bg-[#f7efe3] z-50 p-10 flex flex-col gap-6 font-serif text-xl border-b border-[#b8963e]/20">
          <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); router.push('/collections/suits'); }}>Pakistani Suits</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); router.push('/collections/coords'); }}>Co-Ord Sets</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); router.push('/collections/party'); }}>Bridal & Festive Edit</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); router.push('/collections/hampers'); }}>Gift Hampers</a>
        </div>
      )}

      {/* Breadcrumbs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-4 flex items-center gap-2 text-[11px] md:text-xs font-semibold tracking-wider uppercase text-stone-500">
        <a href="#" className="hover:text-[#6b1929] transition-colors" onClick={(e) => { e.preventDefault(); router.push('/'); }}>Home</a>
        <span className="text-[#b8963e]/40">/</span>
        <span className="text-[#6b1929] font-bold">Shopping Bag ({cart?.items.length || 0})</span>
      </div>

      {/* Cart Container Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6">
        
        {/* Page Title & Luxury Header Card */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 bg-white border border-[#b8963e]/25 p-5 md:p-6 rounded-lg shadow-sm">
          <div>
            <span className="text-[10px] md:text-xs font-extrabold tracking-[0.18em] text-[#b8963e] uppercase">
              ✦ RIWAAYA THREADS COUTURE
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-semibold text-[#6b1929] mt-0.5">
              Your Curated Shopping Bag
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="bg-[#6b1929] text-white text-xs font-semibold px-3.5 py-1.5 rounded-md tracking-wider">
              {selectedItems.length} of {cart?.items.length || 0} Items Selected
            </span>
          </div>
        </div>

        {/* Free Shipping Progress Bar Widget */}
        <div className="bg-white border border-[#b8963e]/25 rounded-lg p-4 md:p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-center text-xs md:text-sm font-semibold mb-2 text-stone-800 flex-wrap gap-2">
            <span className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#6b1929]">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
              {selectedItems.length === 0 ? (
                <span className="text-stone-500">Select items below to calculate express shipping threshold</span>
              ) : amountNeededForFreeShipping === 0 ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Congratulations! You unlocked <strong>FREE Express Shipping</strong>
                </span>
              ) : (
                <span>Add <strong>₹{amountNeededForFreeShipping.toLocaleString()}</strong> more to unlock <strong>FREE Express Shipping</strong></span>
              )}
            </span>
            <span className="text-[#b8963e] font-bold">{Math.round(shippingProgress)}%</span>
          </div>
          <div className="w-full h-2 bg-stone-100 rounded-md overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${amountNeededForFreeShipping === 0 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-[#b8963e] to-[#c8a96e]'}`}
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>

        {/* Main Cart Workspace Grid */}
        {!cart || cart.items.length === 0 ? (
          /* Empty Cart State */
          <div className="text-center py-16 px-6 bg-white rounded-lg border border-dashed border-[#b8963e]/40 shadow-sm flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-md bg-[#6b1929]/10 text-[#6b1929] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 21h12a2 2 0 0 0 2-2V8H4v11a2 2 0 0 0 2 2z"></path>
                <path d="M16 8V6a4 4 0 0 0-8 0v2"></path>
              </svg>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-[#6b1929] font-semibold">
              Your Bag is Currently Empty
            </h2>
            <p className="text-stone-600 text-sm max-w-md leading-relaxed">
              Discover our latest handcrafted pret collections, luxury lawn suits, and festive bridal edits.
            </p>
            <button 
              className="mt-2 bg-[#6b1929] hover:bg-[#8b2336] text-white font-bold text-xs tracking-widest uppercase px-6 py-3 rounded-md transition-all shadow-sm hover:shadow-md" 
              onClick={() => router.push('/collections/all')}
            >
              EXPLORE COLLECTIONS ➔
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Items List */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              
              {/* Select All Bar */}
              <div className="flex justify-between items-center bg-white border border-[#b8963e]/25 px-4 py-3 rounded-lg text-xs md:text-sm font-semibold text-stone-800 shadow-sm">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={allSelected} 
                    onChange={toggleSelectAll} 
                    className="w-4 h-4 accent-[#6b1929] rounded cursor-pointer" 
                  />
                  <span>Select All ({selectedItemIds.length}/{cart.items.length} items for checkout)</span>
                </label>
                {selectedItemIds.length < cart.items.length && (
                  <button 
                    className="text-[#b8963e] hover:text-[#6b1929] text-xs font-bold underline transition-colors"
                    onClick={toggleSelectAll}
                  >
                    Select All
                  </button>
                )}
              </div>

              {/* Items List Cards */}
              {cart.items.map((item) => {
                const isSelected = selectedItemIds.includes(item.id);
                const mrpPrice = item.price + 4500;
                const savings = 4500;

                return (
                  <div 
                    key={item.id} 
                    className={`bg-white rounded-lg border p-4 flex gap-4 transition-all duration-200 ${
                      isSelected 
                        ? 'border-[#6b1929]/40 shadow-sm' 
                        : 'border-[#b8963e]/20 opacity-75 bg-stone-50/50'
                    }`}
                  >
                    {/* Image with Checkbox */}
                    <div 
                      className="relative w-24 h-32 md:w-28 md:h-36 rounded-md overflow-hidden bg-stone-100 flex-shrink-0 cursor-pointer group border border-stone-200" 
                      onClick={() => toggleSelectItem(item.id)}
                    >
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill 
                        className="object-cover object-top" 
                      />
                      <div className={`absolute top-2 left-2 w-5 h-5 rounded-md border border-white flex items-center justify-center text-[10px] font-bold transition-all ${
                        isSelected ? 'bg-[#6b1929] text-white' : 'bg-white/80 text-transparent'
                      }`}>
                        ✓
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="flex flex-col justify-between flex-1 py-0.5">
                      
                      {/* Brand Title & Remove Button */}
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="text-[10px] font-bold text-[#b8963e] tracking-widest uppercase">Riwaaya Threads</h3>
                          <p className="font-serif text-sm md:text-base font-semibold text-stone-900 line-clamp-1">{item.name}</p>
                        </div>
                        <button 
                          className="w-7 h-7 rounded-md bg-stone-100 text-stone-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors text-xs font-bold" 
                          onClick={() => handleRemove(item.id)}
                          disabled={updatingId === item.id}
                          title="Remove Item"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Size & Quantity Controls Row */}
                      <div className="flex items-center gap-3 flex-wrap my-2">
                        <div className="bg-stone-100 px-2.5 py-1 rounded-md text-xs font-semibold text-stone-700">
                          Size: <strong className="text-stone-900">{item.size}</strong>
                        </div>

                        <div className="flex items-center border border-stone-200 rounded-md bg-white h-7 px-1">
                          <button 
                            className="w-6 h-full text-stone-600 hover:text-[#6b1929] font-bold text-xs" 
                            onClick={(e) => { e.stopPropagation(); handleQtyChange(item.id, item.quantity - 1); }}
                            disabled={updatingId === item.id}
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-stone-900">{item.quantity}</span>
                          <button 
                            className="w-6 h-full text-stone-600 hover:text-[#6b1929] font-bold text-xs" 
                            onClick={(e) => { e.stopPropagation(); handleQtyChange(item.id, item.quantity + 1); }}
                            disabled={updatingId === item.id}
                          >
                            +
                          </button>
                        </div>

                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">In Stock</span>
                      </div>

                      {/* Price Row */}
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-bold text-base md:text-lg text-[#6b1929]">₹{(item.price * item.quantity).toLocaleString()}</span>
                        <span className="line-through text-stone-400 text-xs font-serif">₹{(mrpPrice * item.quantity).toLocaleString()}</span>
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md">₹{(savings * item.quantity).toLocaleString()} Off</span>
                      </div>

                      {/* Delivery Info */}
                      <div className="flex items-center gap-4 text-[11px] text-stone-500 mt-1">
                        <span className="flex items-center gap-1">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                          <strong>7 days</strong> return
                        </span>
                        <span className="flex items-center gap-1">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                          Express Delivery by <strong>{deliveryDateRange}</strong>
                        </span>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Summary Sidebar */}
            <div className="bg-white rounded-lg border border-[#b8963e]/25 p-6 shadow-sm sticky top-24">
              <h3 className="font-serif text-lg font-semibold text-[#6b1929] border-b border-[#b8963e]/20 pb-3 mb-4">
                Order Summary
              </h3>

              {/* Delivery Guarantee Box */}
              <div className="bg-[#f7efe3]/60 border border-[#b8963e]/25 rounded-md p-3.5 mb-4 text-xs text-stone-700">
                <span className="font-bold text-[#6b1929] flex items-center gap-1.5 mb-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                  Express Delivery Guarantee
                </span>
                <p className="text-[11px] text-stone-500">Estimated Delivery: <strong>{deliveryDateRange}</strong> across India & International.</p>
              </div>

              {/* Price Breakdown Table */}
              <div className="flex flex-col gap-3 text-xs md:text-sm text-stone-600 mb-6">
                <div className="flex justify-between">
                  <span>Selected Items ({selectedItems.length})</span>
                  <span className="font-serif font-bold text-stone-900">₹{selectedSubtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span>Estimated Express Shipping</span>
                  <span className={`font-bold ${shippingCost === 0 ? 'text-emerald-600' : 'text-stone-900'}`}>
                    {selectedItems.length === 0 ? '₹0' : shippingCost === 0 ? 'FREE' : `₹${shippingCost.toLocaleString()}`}
                  </span>
                </div>

                {appliedPromo && selectedItems.length > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Promo Code ({appliedPromo})</span>
                    <span>- ₹1,000</span>
                  </div>
                )}
              </div>

              {/* Promo Code Drawer */}
              <form onSubmit={handleApplyPromo} className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  placeholder="Promo or Voucher Code" 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-3 py-2 border border-[#b8963e]/30 rounded-md text-xs bg-[#fffdf8] focus:outline-none focus:border-[#6b1929]"
                />
                <button 
                  type="submit" 
                  className="bg-[#6b1929] hover:bg-[#8b2336] text-white px-4 py-2 rounded-md text-xs font-bold tracking-wider uppercase transition-colors"
                >
                  APPLY
                </button>
              </form>

              {/* Grand Total */}
              <div className="border-t-2 border-[#b8963e]/20 pt-4 mb-6 flex justify-between items-baseline">
                <span className="text-sm font-bold text-stone-900">Grand Total</span>
                <span className="font-serif text-2xl font-bold text-[#6b1929]">
                  ₹{selectedItems.length === 0 ? '0' : grandTotal.toLocaleString()}
                </span>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-4 border-t border-dashed border-[#b8963e]/20 flex flex-col gap-2.5 text-[11px] text-stone-600">
                <div className="flex items-center gap-2.5">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b8963e" strokeWidth="2"><path d="M2 4l3 12h14l3-12-6 7-4-5-4 5-6-7z"></path></svg>
                  <span>100% Authentic Artisanal Pret & Formal Couture</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b8963e" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  <span>7-Day Hassle-Free Exchange & Return Policy</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b8963e" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <span>256-Bit SSL Encrypted Payment & Doorstep COD</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Section */}
      <footer className="bg-[#1a0a0e] text-stone-300 pt-16 pb-32 md:pb-12 px-4 sm:px-6 md:px-10 border-t border-[#b8963e]/30 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          <div className="flex flex-col items-start gap-4">
            <Image src="/assets/riwaaya_logo.png" alt="Riwaaya Threads Logo" width={180} height={50} className="w-36 sm:w-44 h-auto object-contain" />
            <p className="text-xs text-stone-400 leading-relaxed font-light">Pakistani Suits · Co-ord Sets · Ethnic Wear. Crafted with heritage, worn with pride.</p>
            <div className="flex items-center gap-3">
              <a href="https://www.instagram.com/riwaayathreads/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#b8963e] text-[#b8963e] hover:text-white transition-colors" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#b8963e] text-[#b8963e] hover:text-white transition-colors" aria-label="Pinterest">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.42 7.63 11.17-.11-.95-.2-2.41.04-3.45.22-.94 1.42-6.03 1.42-6.03s-.36-.73-.36-1.81c0-1.7 0.99-2.97 2.22-2.97 1.05 0 1.55.79 1.55 1.73 0 1.05-.67 2.63-1.02 4.09-.29 1.23.62 2.23 1.83 2.23 2.2 0 3.89-2.32 3.89-5.67 0-2.96-2.13-5.03-5.17-5.03-3.52 0-5.59 2.64-5.59 5.37 0 1.06.41 2.2 0.92 2.82.1.12.11.23.08.36-.09.38-.3.1.23-.39 1.58-.06.26-.2.34-.38.29-1.57-.73-2.55-1.77-2.55-2.87 0-3.9 2.83-7.49 8.18-7.49 4.29 0 7.63 3.06 7.63 7.15 0 4.27-2.69 7.7-6.42 7.7-1.25 0-2.43-.65-2.83-1.42l-.77 2.94c-.28 1.07-1.03 2.41-1.54 3.23C9.72 23.8 10.84 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#b8963e] text-[#b8963e] hover:text-white transition-colors" aria-label="Facebook">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://wa.me/917277506057" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#b8963e] text-[#b8963e] hover:text-white transition-colors" aria-label="WhatsApp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.461c-1.852 0-3.667-.497-5.26-1.442l-.377-.224-3.913 1.026 1.044-3.813-.247-.393c-1.038-1.652-1.587-3.565-1.587-5.529 0-5.656 4.602-10.258 10.259-10.258 2.74 0 5.316 1.068 7.251 3.004s3.003 4.512 3.003 7.255c0 5.657-4.602 10.257-10.259 10.257m0-18.758c-4.686 0-8.5 3.814-8.5 8.5 0 1.83.585 3.528 1.579 4.92l.149.213-.675 2.467 2.527-.663.204.121c1.344.796 2.898 1.215 4.482 1.215 4.686 0 8.5-3.814 8.5-8.5 0-2.268-.883-4.4-2.489-6.006-1.607-1.607-3.739-2.49-6.007-2.49"/>
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold text-[#b8963e] tracking-wider uppercase mb-4">Collections</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-stone-400">
              <li><a href="#" className="hover:text-white transition-colors" onClick={(e) => { e.preventDefault(); router.push('/collections/suits'); }}>Pakistani Suits</a></li>
              <li><a href="#" className="hover:text-white transition-colors" onClick={(e) => { e.preventDefault(); router.push('/collections/coords'); }}>Co-ord Sets</a></li>
              <li><a href="#" className="hover:text-white transition-colors" onClick={(e) => { e.preventDefault(); router.push('/collections/party'); }}>Ethnic Wear</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Bridal Edit</a></li>
              <li><a href="#" className="hover:text-white transition-colors">New Season Arrivals</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold text-[#b8963e] tracking-wider uppercase mb-4">Information</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-stone-400">
              <li><a href="#" className="hover:text-white transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Artisan Program</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sustainability</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold text-[#b8963e] tracking-wider uppercase mb-4">Get in touch</h4>
            <ul className="flex flex-col gap-3 text-xs">
              <li className="flex flex-col gap-0.5"><span className="text-[10px] font-bold text-[#b8963e] uppercase">Primary Address</span><span className="text-stone-400">36/1/H /2 Bright Street, Kolkata - 700017</span></li>
              <li className="flex flex-col gap-0.5"><span className="text-[10px] font-bold text-[#b8963e] uppercase">Secondary Address</span><span className="text-stone-400">40 Foota Road, Shaheen Bagh, Delhi - 110025</span></li>
              <li className="flex flex-col gap-0.5"><span className="text-[10px] font-bold text-[#b8963e] uppercase">Phone</span><span className="text-stone-400">+9172775060, +917250846963, +919163037924</span></li>
              <li className="flex flex-col gap-0.5"><span className="text-[10px] font-bold text-[#b8963e] uppercase">Email</span><span className="text-stone-400">info@riwaayathreads.com</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-10 mt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© 2026 Riwaaya Threads. All Rights Reserved.</p>
          <div className="flex gap-6"><a href="#" className="hover:text-stone-300 transition-colors">Privacy Policy</a><a href="#" className="hover:text-stone-300 transition-colors">Terms of Service</a></div>
        </div>
      </footer>

      {/* MOBILE STICKY FLOATING CHECKOUT DOCK */}
      {cart && cart.items.length > 0 && (
        <div className="fixed bottom-[64px] left-3 right-3 z-40 bg-white/95 backdrop-blur-md border border-[#b8963e]/30 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-4 md:hidden">
          <div>
            <span className="text-[10px] text-stone-500 block uppercase tracking-wider font-semibold">
              Total ({selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'})
            </span>
            <span className="font-serif text-xl font-bold text-[#6b1929]">
              ₹{selectedItems.length === 0 ? '0' : grandTotal.toLocaleString()}
            </span>
          </div>

          <button 
            disabled={selectedItems.length === 0}
            className="bg-[#6b1929] hover:bg-[#8b2336] text-white font-bold text-xs tracking-widest uppercase px-6 py-3 rounded-full shadow-md transition-all disabled:opacity-50"
            onClick={handleProceedToCheckout}
          >
            PLACE ORDER ➔
          </button>
        </div>
      )}

      {/* Bottom Floating Mobile Navigation Bar (CART Active) */}
      <nav className="bottom-nav-safe md:hidden">
        <button 
          type="button"
          onClick={() => router.push('/')} 
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-stone-500 hover:text-[#6b1929] transition-colors relative py-1"
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M3 9.5L12 3l9 6.5V20a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 13 20v-5h-2v5A1.5 1.5 0 0 1 9.5 21.5h-5A1.5 1.5 0 0 1 3 20V9.5z"></path>
          </svg>
          <span>HOME</span>
        </button>
        
        <button 
          type="button"
          onClick={() => router.push('/collections/all')} 
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-stone-500 hover:text-[#6b1929] transition-colors relative py-1"
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M3 9l1-5h16l1 5"></path>
            <path d="M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9"></path>
            <path d="M9 21V12h6v9"></path>
          </svg>
          <span>SHOP</span>
        </button>

        <button 
          id="bottom-cart-icon"
          data-bottom-cart="true"
          type="button"
          onClick={() => router.push('/cart')} 
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-[#6b1929] relative py-1"
        >
          <div className="w-6 h-0.5 bg-[#6b1929] rounded-full absolute -top-2" />
          <div className="relative">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
              <path d="M6 21h12a2 2 0 0 0 2-2V8H4v11a2 2 0 0 0 2 2z" className="bag-body-path"></path>
              <path d="M16 8V6a4 4 0 0 0-8 0v2" className="bag-handle-path"></path>
            </svg>
            {cart && cart.items.length > 0 && <span className="absolute -top-1 -right-2 bg-[#6b1929] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cart.items.length}</span>}
          </div>
          <span>CART</span>
        </button>

        <button 
          type="button"
          onClick={() => router.push('/wishlist')} 
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-stone-500 hover:text-[#6b1929] transition-colors relative py-1"
        >
          <div className="relative">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            {wishlist.length > 0 && <span className="absolute -top-1 -right-2 bg-[#6b1929] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{wishlist.length}</span>}
          </div>
          <span>WISHLIST</span>
        </button>
      </nav>
    </div>
  );
}
