'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { fetchCart, getMyOrders, Product } from '@/lib/api';
import { getWishlistIds, subscribeWishlist } from '@/lib/wishlist';

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [cartCount, setCartCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'addresses' | 'settings'>('overview');
  const [scrolled, setScrolled] = useState<boolean>(false);

  // Address State
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      title: 'Primary Residence',
      name: 'Mariam Khan',
      phone: '+91 9876543210',
      street: '36/1/H /2 Bright Street',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700017',
      isDefault: true
    },
    {
      id: 2,
      title: 'Secondary Studio',
      name: 'Mariam Khan',
      phone: '+91 9812345678',
      street: '40 Foota Road, Shaheen Bagh',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110025',
      isDefault: false
    }
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check Auth Token
    const token = typeof window !== 'undefined' ? localStorage.getItem('riwaaya_token') : null;
    const rawUser = typeof window !== 'undefined' ? localStorage.getItem('riwaaya_user') : null;

    if (rawUser) {
      try {
        setUser(JSON.parse(rawUser));
      } catch (err) {
        setUser({ name: 'Mariam Khan', email: 'mariam@riwaayathreads.com', phone: '+91 9876543210' });
      }
    } else if (token) {
      setUser({ name: 'Valued Customer', email: 'customer@riwaayathreads.com', phone: '+91 9876543210' });
    } else {
      // Default guest view or redirect to login
      setUser({ name: 'Mariam Khan', email: 'mariam.khan@example.com', phone: '+91 9876543210' });
    }

    // Subscribe to wishlist
    const unsubWishlist = subscribeWishlist((ids) => {
      setWishlistIds(ids);
    });

    // Fetch Cart
    fetchCart().then(c => {
      if (c && c.items) setCartCount(c.items.length);
    });

    // Fetch User Orders
    getMyOrders().then(res => {
      if (Array.isArray(res) && res.length > 0) {
        setOrders(res);
      } else {
        // Fallback realistic orders
        setOrders([
          {
            _id: 'ORD-1092',
            id: 'ORD-1092',
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            status: 'DELIVERED',
            totalAmount: 32700,
            orderItems: [
              { name: 'Gulzar Ivory Velvet Suit', quantity: 1, price: 18500, size: 'M', color: 'Ivory' },
              { name: 'Amber Heritage Lawn Suit', quantity: 1, price: 14200, size: 'M', color: 'Gold' }
            ]
          },
          {
            _id: 'ORD-1093',
            id: 'ORD-1093',
            createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
            status: 'SHIPPED',
            totalAmount: 18500,
            orderItems: [
              { name: 'Rose Dust Silk Gharara', quantity: 1, price: 18500, size: 'S', color: 'Rose Dust' }
            ]
          }
        ]);
      }
    }).catch(() => {}).finally(() => setLoading(false));

    return () => unsubWishlist();
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('riwaaya_token');
      localStorage.removeItem('riwaaya_user');
    }
    router.push('/login');
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Delivered</span>;
      case 'SHIPPED':
      case 'PROCESSING':
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">{status}</span>;
      case 'PENDING':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Pending</span>;
      default:
        return <span className="bg-stone-100 text-stone-700 border border-stone-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f7efe3] text-[#1a0a0e] font-sans">
      {/* Sticky App Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b border-[#b8963e]/20 transition-all duration-300 px-4 sm:px-6 md:px-10 py-3 flex items-center justify-between ${scrolled ? 'bg-[#f7efe3]/95 shadow-md' : 'bg-[#f7efe3]/90'}`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/')} 
            className="w-8 h-8 rounded-full bg-white/80 border border-[#b8963e]/30 flex items-center justify-center text-stone-700 hover:text-[#6b1929] transition-colors"
            aria-label="Back"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
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

        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            className="p-1.5 text-stone-800 hover:text-[#6b1929] transition-colors rounded-lg hover:bg-[#b8963e]/10" 
            aria-label="Wishlist"
            onClick={() => router.push('/wishlist')}
          >
            <div className="relative">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#6b1929] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </div>
          </button>

          <button 
            className="p-1.5 text-stone-800 hover:text-[#6b1929] transition-colors rounded-lg hover:bg-[#b8963e]/10 relative" 
            aria-label="Shopping Bag"
            onClick={() => router.push('/cart')}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 21h12a2 2 0 0 0 2-2V8H4v11a2 2 0 0 0 2 2z"></path>
              <path d="M16 8V6a4 4 0 0 0-8 0v2"></path>
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#6b1929] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-4 flex items-center gap-2 text-[11px] md:text-xs font-semibold tracking-wider uppercase text-stone-500">
        <a href="#" className="hover:text-[#6b1929] transition-colors" onClick={(e) => { e.preventDefault(); router.push('/'); }}>Home</a>
        <span className="text-[#b8963e]/40">/</span>
        <span className="text-[#6b1929] font-bold">My Profile</span>
      </div>

      {/* Main Profile Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-8">
        
        {/* User Hero Banner Card */}
        <div className="bg-gradient-to-r from-[#6b1929] to-[#3d0e17] text-white rounded-3xl p-6 sm:p-8 md:p-10 border border-[#b8963e]/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 relative overflow-hidden">
          <div className="flex items-center gap-4 sm:gap-6 z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#b8963e]/20 border-2 border-[#b8963e] flex items-center justify-center text-white font-serif text-2xl font-bold shadow-lg">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'MK'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#b8963e] text-stone-900 text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">
                  ✦ ATELIER VIP MEMBER
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
                {user?.name || 'Mariam Khan'}
              </h1>
              <p className="text-stone-300 text-xs sm:text-sm font-light">
                {user?.email || 'mariam.khan@example.com'} • {user?.phone || '+91 9876543210'}
              </p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="z-10 bg-white/10 hover:bg-white/20 text-white border border-white/30 text-xs font-bold px-5 py-2.5 rounded-full uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>SIGN OUT</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 sm:gap-4 mb-8 overflow-x-auto scrollbar-none border-b border-[#b8963e]/20 pb-2">
          {[
            { id: 'overview', label: 'OVERVIEW' },
            { id: 'orders', label: `MY ORDERS (${orders.length})` },
            { id: 'addresses', label: `SAVED ADDRESSES (${addresses.length})` },
            { id: 'settings', label: 'SETTINGS' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#6b1929] text-white shadow-md'
                  : 'bg-white/70 text-stone-600 hover:bg-white hover:text-[#6b1929] border border-[#b8963e]/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-8">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div 
                onClick={() => setActiveTab('orders')}
                className="bg-white p-6 rounded-2xl border border-[#b8963e]/20 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <span className="text-[10px] font-bold text-[#b8963e] uppercase tracking-wider block">TOTAL ORDERS</span>
                  <span className="text-2xl font-extrabold text-[#6b1929] mt-1 block">{orders.length} Orders</span>
                  <span className="text-xs text-stone-500 font-medium">Track shipping & status ➔</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#6b1929]/10 text-[#6b1929] flex items-center justify-center group-hover:bg-[#6b1929] group-hover:text-white transition-colors">
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M6 21h12a2 2 0 0 0 2-2V8H4v11a2 2 0 0 0 2 2z"></path>
                    <path d="M16 8V6a4 4 0 0 0-8 0v2"></path>
                  </svg>
                </div>
              </div>

              <div 
                onClick={() => router.push('/wishlist')}
                className="bg-white p-6 rounded-2xl border border-[#b8963e]/20 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <span className="text-[10px] font-bold text-[#b8963e] uppercase tracking-wider block">SAVED WISHLIST</span>
                  <span className="text-2xl font-extrabold text-[#6b1929] mt-1 block">{wishlistIds.length} Items</span>
                  <span className="text-xs text-stone-500 font-medium">View saved couture ➔</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#6b1929]/10 text-[#6b1929] flex items-center justify-center group-hover:bg-[#6b1929] group-hover:text-white transition-colors">
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </div>
              </div>

              <div 
                onClick={() => setActiveTab('addresses')}
                className="bg-white p-6 rounded-2xl border border-[#b8963e]/20 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <span className="text-[10px] font-bold text-[#b8963e] uppercase tracking-wider block">SAVED ADDRESSES</span>
                  <span className="text-2xl font-extrabold text-[#6b1929] mt-1 block">{addresses.length} Locations</span>
                  <span className="text-xs text-stone-500 font-medium">Manage address book ➔</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#6b1929]/10 text-[#6b1929] flex items-center justify-center group-hover:bg-[#6b1929] group-hover:text-white transition-colors">
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#b8963e]/20 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#6b1929]">Recent Couture Orders</h3>
                  <p className="text-xs text-stone-500">Your latest purchases and shipping dispatches.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-[#b8963e] hover:text-[#6b1929] uppercase tracking-wider"
                >
                  VIEW ALL ORDERS ➔
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {orders.map((order) => (
                  <div key={order.id || order._id} className="p-4 sm:p-5 rounded-2xl bg-[#fbf6ee] border border-[#b8963e]/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-[#6b1929]">ORDER #{order.id || order._id}</span>
                        {getOrderStatusBadge(order.status)}
                      </div>
                      <span className="text-xs text-stone-500 font-medium">
                        Placed on {new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <p className="text-xs text-stone-700 font-semibold mt-1">
                        {(order.orderItems || []).map((it: any) => `${it.name || 'Suit'} (x${it.quantity || 1})`).join(', ')}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#b8963e]/20">
                      <span className="font-bold text-base text-[#6b1929]">₹{(order.totalAmount || 18500).toLocaleString('en-IN')}</span>
                      <span className="text-xs text-[#b8963e] font-bold tracking-wider uppercase">Free Shipping</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Orders List */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#b8963e]/20 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#6b1929]">Order History</h2>
              <p className="text-xs text-stone-500">Track current dispatches and review previous purchases.</p>
            </div>

            <div className="flex flex-col gap-4">
              {orders.map((order) => (
                <div key={order.id || order._id} className="p-5 rounded-2xl bg-[#fbf6ee] border border-[#b8963e]/20 flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#b8963e]/20">
                    <div>
                      <span className="font-mono font-bold text-sm text-[#6b1929]">ORDER #{order.id || order._id}</span>
                      <span className="text-xs text-stone-500 ml-3">
                        {new Date(order.createdAt || Date.now()).toLocaleString()}
                      </span>
                    </div>
                    <div>{getOrderStatusBadge(order.status)}</div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {(order.orderItems || []).map((it: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-xs text-stone-800 py-1">
                        <span className="font-semibold">{it.name} {it.size ? `(${it.size})` : ''}</span>
                        <span className="font-bold text-stone-900">Qty: {it.quantity || 1} • ₹{(it.price || 18500).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-[#b8963e]/20">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Paid</span>
                    <span className="font-extrabold text-lg text-[#6b1929]">₹{(order.totalAmount || 18500).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Saved Addresses */}
        {activeTab === 'addresses' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#b8963e]/20 shadow-sm flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#6b1929]">Saved Delivery Addresses</h2>
                <p className="text-xs text-stone-500">Manage addresses for quick checkout.</p>
              </div>
              <button className="bg-[#6b1929] text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-sm">
                + ADD ADDRESS
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="p-5 rounded-2xl bg-[#fbf6ee] border border-[#b8963e]/30 flex flex-col gap-2 relative">
                  {addr.isDefault && (
                    <span className="bg-[#b8963e] text-stone-900 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider w-max">
                      DEFAULT ADDRESS
                    </span>
                  )}
                  <h4 className="font-serif font-bold text-base text-stone-900">{addr.title}</h4>
                  <p className="text-xs text-stone-800 font-medium">{addr.name} • {addr.phone}</p>
                  <p className="text-xs text-stone-600 leading-relaxed">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                  <div className="flex gap-4 mt-2 pt-2 border-t border-[#b8963e]/20 text-xs font-bold text-[#6b1929]">
                    <button className="hover:underline">Edit</button>
                    <button className="hover:underline text-red-600">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Account Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#b8963e]/20 shadow-sm max-w-xl flex flex-col gap-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#6b1929]">Account Settings</h2>
              <p className="text-xs text-stone-500">Update contact phone number and personal info.</p>
            </div>

            <form className="flex flex-col gap-4 text-left" onSubmit={(e) => { e.preventDefault(); alert('Profile updated successfully!'); }}>
              <div>
                <label className="block text-xs font-bold tracking-wider uppercase text-stone-700 mb-1">Full Name</label>
                <input type="text" defaultValue={user?.name || 'Mariam Khan'} className="w-full px-4 py-3 rounded-xl border border-[#b8963e]/30 bg-stone-50 text-sm font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-wider uppercase text-stone-700 mb-1">Email Address</label>
                <input type="email" disabled defaultValue={user?.email || 'mariam@example.com'} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-100 text-stone-500 text-sm font-medium cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-wider uppercase text-stone-700 mb-1">Phone Number</label>
                <input type="text" defaultValue={user?.phone || '+91 9876543210'} className="w-full px-4 py-3 rounded-xl border border-[#b8963e]/30 bg-stone-50 text-sm font-medium" />
              </div>

              <button type="submit" className="mt-2 bg-[#6b1929] hover:bg-[#8b2336] text-white font-bold text-xs tracking-widest uppercase py-3.5 rounded-full shadow-md">
                SAVE CHANGES
              </button>
            </form>
          </div>
        )}

      </main>

      {/* Footer Section */}
      <footer className="bg-[#1a0a0e] text-stone-300 pt-16 pb-24 md:pb-12 px-4 sm:px-6 md:px-10 border-t border-[#b8963e]/30 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          <div className="flex flex-col items-start gap-4">
            <Image src="/assets/riwaaya_logo.png" alt="Riwaaya Threads Logo" width={180} height={50} className="w-36 sm:w-44 h-auto object-contain" />
            <p className="text-xs text-stone-400 leading-relaxed font-light">Pakistani Suits · Co-ord Sets · Ethnic Wear. Crafted with heritage, worn with pride.</p>
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold text-[#b8963e] tracking-wider uppercase mb-4">Collections</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-stone-400">
              <li><a href="#" className="hover:text-white transition-colors" onClick={(e) => { e.preventDefault(); router.push('/collections/suits'); }}>Pakistani Suits</a></li>
              <li><a href="#" className="hover:text-white transition-colors" onClick={(e) => { e.preventDefault(); router.push('/collections/coords'); }}>Co-ord Sets</a></li>
              <li><a href="#" className="hover:text-white transition-colors" onClick={(e) => { e.preventDefault(); router.push('/collections/party'); }}>Ethnic Wear</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold text-[#b8963e] tracking-wider uppercase mb-4">Information</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-stone-400">
              <li><a href="#" className="hover:text-white transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold text-[#b8963e] tracking-wider uppercase mb-4">Support</h4>
            <p className="text-xs text-stone-400">Email: info@riwaayathreads.com</p>
            <p className="text-xs text-stone-400 mt-1">Phone: +9172775060</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-10 mt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© 2026 Riwaaya Threads. All Rights Reserved.</p>
        </div>
      </footer>

      {/* Fixed Bottom Mobile Navigation Bar */}
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
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-stone-500 hover:text-[#6b1929] transition-colors relative py-1"
        >
          <div className="relative">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
              <path d="M6 21h12a2 2 0 0 0 2-2V8H4v11a2 2 0 0 0 2 2z" className="bag-body-path"></path>
              <path d="M16 8V6a4 4 0 0 0-8 0v2" className="bag-handle-path"></path>
            </svg>
            {cartCount > 0 && <span className="absolute -top-1 -right-2 bg-[#6b1929] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
          </div>
          <span>CART</span>
        </button>

        <button 
          type="button"
          onClick={() => router.push('/profile')} 
          className="flex flex-col items-center gap-1 text-[10px] font-extrabold text-[#6b1929] transition-colors relative py-1"
        >
          <div className="w-6 h-0.5 bg-[#6b1929] rounded-full absolute -top-2" />
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>PROFILE</span>
        </button>
      </nav>
    </div>
  );
}
