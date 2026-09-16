'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { fetchCart, getMyOrders, Product, getSavedAddresses, createSavedAddress, updateSavedAddress, deleteSavedAddress } from '@/lib/api';
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
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  
  // Address Form Fields
  const [addrTitle, setAddrTitle] = useState<string>('Primary Residence');
  const [addrName, setAddrName] = useState<string>('');
  const [addrPhone, setAddrPhone] = useState<string>('');
  const [addrStreet, setAddrStreet] = useState<string>('');
  const [addrCity, setAddrCity] = useState<string>('');
  const [addrState, setAddrState] = useState<string>('');
  const [addrPincode, setAddrPincode] = useState<string>('');
  const [addrIsDefault, setAddrIsDefault] = useState<boolean>(false);

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
        const u = JSON.parse(rawUser);
        setUser({
          name: u.name || 'Valued Customer',
          email: u.email || 'customer@riwaayathreads.com',
          phone: u.phone || '',
          role: u.role
        });
      } catch (err) {
        setUser({ name: 'Valued Customer', email: 'customer@riwaayathreads.com', phone: '' });
      }
    } else if (token) {
      setUser({ name: 'Valued Customer', email: 'customer@riwaayathreads.com', phone: '' });
    } else {
      setUser(null);
    }

    // Fetch saved addresses from API & Local Storage
    getSavedAddresses().then(addrs => {
      if (Array.isArray(addrs)) setAddresses(addrs);
    });

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
      if (Array.isArray(res)) {
        setOrders(res);
      } else {
        setOrders([]);
      }
    }).catch(() => {
      setOrders([]);
    }).finally(() => setLoading(false));

    return () => unsubWishlist();
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('riwaaya_token');
      localStorage.removeItem('riwaaya_user');
    }
    router.push('/login');
  };

  const handleOpenAddModal = () => {
    setEditingAddressId(null);
    setAddrTitle('Primary Residence');
    setAddrName(user?.name || '');
    setAddrPhone(user?.phone || '');
    setAddrStreet('');
    setAddrCity('');
    setAddrState('');
    setAddrPincode('');
    setAddrIsDefault(addresses.length === 0);
    setShowAddressModal(true);
  };

  const handleOpenEditModal = (addr: any) => {
    setEditingAddressId(addr._id || addr.id);
    setAddrTitle(addr.title || 'Saved Location');
    setAddrName(addr.name || '');
    setAddrPhone(addr.phone || '');
    setAddrStreet(addr.street || '');
    setAddrCity(addr.city || '');
    setAddrState(addr.state || '');
    setAddrPincode(addr.pincode || '');
    setAddrIsDefault(!!addr.isDefault);
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: addrTitle,
      name: addrName,
      phone: addrPhone,
      street: addrStreet,
      city: addrCity,
      state: addrState,
      pincode: addrPincode,
      isDefault: addrIsDefault
    };

    let updated: any[] = [];
    if (editingAddressId) {
      updated = await updateSavedAddress(editingAddressId, payload);
    } else {
      updated = await createSavedAddress(payload);
    }

    setAddresses(updated);
    setShowAddressModal(false);
  };

  const handleDeleteAddress = async (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      const updated = await deleteSavedAddress(id);
      setAddresses(updated);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    const updated = await updateSavedAddress(id, { isDefault: true });
    setAddresses(updated);
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-wider shrink-0">Delivered</span>;
      case 'SHIPPED':
      case 'PROCESSING':
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-wider shrink-0">{status}</span>;
      case 'PENDING':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-wider shrink-0">Pending</span>;
      default:
        return <span className="bg-stone-100 text-stone-700 border border-stone-300 text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-wider shrink-0">{status}</span>;
    }
  };

  const renderOrderCard = (order: any) => {
    const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const orderItems = order.orderItems || [];

    return (
      <div key={order.id || order._id} className="w-full max-w-full overflow-hidden rounded-lg bg-[#fbf6ee] border border-[#b8963e]/25 p-4 sm:p-5 shadow-sm transition-all hover:border-[#b8963e]/50 flex flex-col gap-3">
        {/* Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#b8963e]/20 w-full">
          <div className="flex flex-wrap items-center gap-2 min-w-0 max-w-full">
            <span className="font-mono font-bold text-xs sm:text-sm text-[#6b1929] truncate max-w-[160px] sm:max-w-none">
              ORDER #{order.id || order._id}
            </span>
            <span className="text-[11px] text-stone-500 font-medium whitespace-nowrap">
              • {formattedDate}
            </span>
          </div>
          <div className="shrink-0">{getOrderStatusBadge(order.status)}</div>
        </div>

        {/* Order Items */}
        <div className="flex flex-col gap-2.5 w-full">
          {orderItems.map((it: any, idx: number) => {
            const itemPrice = typeof it.price === 'number' ? it.price : 18500;
            const itemQty = it.quantity || 1;
            const itemTotal = itemPrice * itemQty;

            return (
              <div key={idx} className="flex items-center justify-between gap-3 text-xs text-stone-800 py-1 border-b border-[#b8963e]/10 last:border-b-0 w-full">
                {/* Left: Thumbnail & Name */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-12 sm:w-12 sm:h-14 rounded-md bg-gradient-to-br from-[#6b1929] to-[#3d0e17] text-[#b8963e] flex items-center justify-center font-serif font-bold text-xs shrink-0 overflow-hidden shadow-inner border border-[#b8963e]/30">
                    {it.image ? (
                      <img src={it.image} alt={it.name || 'Couture Suit'} className="w-full h-full object-cover" />
                    ) : (
                      <span>{(it.name || 'RT').slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-semibold text-stone-900 text-xs sm:text-sm truncate leading-snug">
                      {it.name || 'Pakistani Pret Suit'}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {it.size && (
                        <span className="text-[10px] bg-white border border-[#b8963e]/30 text-[#6b1929] font-bold px-1.5 py-0.2 rounded-md uppercase">
                          Size: {it.size}
                        </span>
                      )}
                      {it.color && (
                        <span className="text-[10px] text-stone-500 font-medium">
                          {it.color}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Quantity & Line Total */}
                <div className="flex flex-col items-end shrink-0 text-right">
                  <span className="font-extrabold text-stone-900 text-xs sm:text-sm">
                    ₹{itemTotal.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-stone-500 font-medium">
                    Qty: {itemQty} {itemQty > 1 ? `(₹${itemPrice.toLocaleString('en-IN')} ea)` : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Card Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-3 border-t border-[#b8963e]/20 bg-white/70 p-3 rounded-md w-full">
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8963e" strokeWidth="2" className="shrink-0">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            <span className="font-semibold text-stone-700">Doorstep Express Delivery</span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-[#b8963e]/15">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Paid</span>
            <span className="font-serif text-lg font-bold text-[#6b1929]">
              ₹{(order.totalAmount || 18500).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    );
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
        <div className="bg-gradient-to-r from-[#6b1929] to-[#3d0e17] text-white rounded-lg p-6 sm:p-8 md:p-10 border border-[#b8963e]/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 relative overflow-hidden">
          <div className="flex items-center gap-4 sm:gap-6 z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-md bg-[#b8963e]/20 border-2 border-[#b8963e] flex items-center justify-center text-white font-serif text-2xl font-bold shadow-lg">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'MK'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#b8963e] text-stone-900 text-[10px] font-extrabold px-3 py-0.5 rounded-md uppercase tracking-wider">
                  ✦ ATELIER VIP MEMBER
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
                {user?.name || 'Valued Customer'}
              </h1>
              <p className="text-stone-300 text-xs sm:text-sm font-light">
                {user?.email || ''} {user?.phone ? `• ${user.phone}` : ''}
              </p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="z-10 bg-white/10 hover:bg-white/20 text-white border border-white/30 text-xs font-bold px-5 py-2.5 rounded-md uppercase tracking-wider transition-all flex items-center gap-2"
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
              className={`px-5 py-2.5 rounded-md text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap ${
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
                className="bg-white p-6 rounded-lg border border-[#b8963e]/20 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <span className="text-[10px] font-bold text-[#b8963e] uppercase tracking-wider block">TOTAL ORDERS</span>
                  <span className="text-2xl font-extrabold text-[#6b1929] mt-1 block">{orders.length} Orders</span>
                  <span className="text-xs text-stone-500 font-medium">Track shipping & status ➔</span>
                </div>
                <div className="w-12 h-12 rounded-md bg-[#6b1929]/10 text-[#6b1929] flex items-center justify-center group-hover:bg-[#6b1929] group-hover:text-white transition-colors">
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M6 21h12a2 2 0 0 0 2-2V8H4v11a2 2 0 0 0 2 2z"></path>
                    <path d="M16 8V6a4 4 0 0 0-8 0v2"></path>
                  </svg>
                </div>
              </div>

              <div 
                onClick={() => router.push('/wishlist')}
                className="bg-white p-6 rounded-lg border border-[#b8963e]/20 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <span className="text-[10px] font-bold text-[#b8963e] uppercase tracking-wider block">SAVED WISHLIST</span>
                  <span className="text-2xl font-extrabold text-[#6b1929] mt-1 block">{wishlistIds.length} Items</span>
                  <span className="text-xs text-stone-500 font-medium">View saved couture ➔</span>
                </div>
                <div className="w-12 h-12 rounded-md bg-[#6b1929]/10 text-[#6b1929] flex items-center justify-center group-hover:bg-[#6b1929] group-hover:text-white transition-colors">
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </div>
              </div>

              <div 
                onClick={() => setActiveTab('addresses')}
                className="bg-white p-6 rounded-lg border border-[#b8963e]/20 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <span className="text-[10px] font-bold text-[#b8963e] uppercase tracking-wider block">SAVED ADDRESSES</span>
                  <span className="text-2xl font-extrabold text-[#6b1929] mt-1 block">{addresses.length} Locations</span>
                  <span className="text-xs text-stone-500 font-medium">Manage address book ➔</span>
                </div>
                <div className="w-12 h-12 rounded-md bg-[#6b1929]/10 text-[#6b1929] flex items-center justify-center group-hover:bg-[#6b1929] group-hover:text-white transition-colors">
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-white rounded-lg p-6 sm:p-8 border border-[#b8963e]/20 shadow-sm">
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

              {orders.length > 0 ? (
                <div className="flex flex-col gap-4 w-full">
                  {orders.map((order) => renderOrderCard(order))}
                </div>
              ) : (
                <div className="text-center py-10 px-4 bg-[#fbf6ee] rounded-lg border border-[#b8963e]/20 flex flex-col items-center justify-center gap-2.5">
                  <h4 className="font-serif text-lg font-bold text-[#6b1929]">No Couture Orders Placed Yet</h4>
                  <p className="text-xs text-stone-500">Explore our luxury pret collections to place your first order.</p>
                  <button 
                    onClick={() => router.push('/collections/all')}
                    className="mt-1 bg-[#6b1929] hover:bg-[#8b2336] text-white font-bold text-xs tracking-wider uppercase px-5 py-2.5 rounded-md shadow-sm"
                  >
                    EXPLORE SHOP ➔
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Orders List */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg p-6 sm:p-8 border border-[#b8963e]/20 shadow-sm flex flex-col gap-6 w-full overflow-hidden">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#6b1929]">Order History</h2>
              <p className="text-xs text-stone-500">Track current dispatches and review previous purchases.</p>
            </div>

            {orders.length > 0 ? (
              <div className="flex flex-col gap-4 w-full">
                {orders.map((order) => renderOrderCard(order))}
              </div>
            ) : (
              <div className="text-center py-14 px-4 bg-[#fbf6ee] rounded-lg border border-[#b8963e]/20 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-md bg-[#6b1929]/10 border border-[#6b1929]/20 flex items-center justify-center text-[#6b1929]">
                  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M6 21h12a2 2 0 0 0 2-2V8H4v11a2 2 0 0 0 2 2z"></path>
                    <path d="M16 8V6a4 4 0 0 0-8 0v2"></path>
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#6b1929]">No Couture Orders Placed Yet</h3>
                <p className="text-xs text-stone-500 max-w-sm">When you place an order, it will appear here with live tracking & delivery updates.</p>
                <button 
                  onClick={() => router.push('/collections/all')} 
                  className="mt-2 bg-[#6b1929] hover:bg-[#8b2336] text-white font-bold text-xs tracking-widest uppercase px-6 py-3 rounded-md shadow-md transition-all"
                >
                  START SHOPPING ➔
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Saved Delivery Addresses */}
        {activeTab === 'addresses' && (
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#b8963e]/25 shadow-sm flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#b8963e]/20 pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#6b1929] tracking-wide">Saved Delivery Addresses</h2>
                <p className="text-xs text-stone-500 font-medium">Manage address book locations for instant doorstep dispatch.</p>
              </div>
              {addresses.length > 0 && (
                <button 
                  onClick={handleOpenAddModal}
                  className="bg-[#6b1929] hover:bg-[#8b2336] text-white text-xs font-bold px-5 py-2.5 rounded-md uppercase tracking-widest shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <span>+ ADD NEW LOCATION</span>
                </button>
              )}
            </div>

            {addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => {
                  const addrId = addr._id || addr.id;
                  return (
                    <div key={addrId} className="p-5 rounded-lg bg-[#fdfaf5] border border-[#b8963e]/30 flex flex-col justify-between gap-4 relative shadow-sm hover:border-[#6b1929]/50 transition-all">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#b8963e]/15">
                          <h4 className="font-serif font-bold text-base text-[#6b1929] tracking-wide">{addr.title || 'Saved Location'}</h4>
                          {addr.isDefault ? (
                            <span className="bg-[#6b1929] text-[#f7efe3] border border-[#b8963e]/40 text-[9px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                              DEFAULT PRIMARY
                            </span>
                          ) : (
                            <button 
                              onClick={() => handleSetDefaultAddress(addrId)}
                              className="text-[10px] text-[#b8963e] font-bold hover:underline uppercase tracking-wider"
                            >
                              Set as Default
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-stone-900 font-bold">{addr.name} • <span className="font-medium text-stone-600">{addr.phone}</span></p>
                        <p className="text-xs text-stone-600 leading-relaxed font-sans">{addr.street}, {addr.city}, {addr.state} - <span className="font-semibold text-stone-800">{addr.pincode}</span></p>
                      </div>

                      <div className="flex items-center gap-4 pt-3 border-t border-[#b8963e]/20 text-xs font-bold uppercase tracking-wider">
                        <button 
                          onClick={() => handleOpenEditModal(addr)}
                          className="text-[#6b1929] hover:underline"
                        >
                          EDIT LOCATION
                        </button>
                        <button 
                          onClick={() => handleDeleteAddress(addrId)}
                          className="text-red-700 hover:underline"
                        >
                          REMOVE
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 px-4 bg-[#fdfaf5] rounded-lg border border-[#b8963e]/25 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#6b1929]/10 border border-[#6b1929]/20 flex items-center justify-center text-[#6b1929]">
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <h4 className="font-serif text-lg font-bold text-[#6b1929]">No Saved Addresses Yet</h4>
                <p className="text-xs text-stone-500 max-w-sm">Save delivery addresses for quick doorstep checkout.</p>
                <button 
                  onClick={handleOpenAddModal}
                  className="mt-1 bg-[#6b1929] hover:bg-[#8b2336] text-white font-bold text-xs tracking-widest uppercase px-6 py-3 rounded-md shadow-md transition-all"
                >
                  + ADD LOCATION
                </button>
              </div>
            )}
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
                <input type="text" defaultValue={user?.name || ''} placeholder="Full Name" className="w-full px-4 py-3 rounded-xl border border-[#b8963e]/30 bg-stone-50 text-sm font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-wider uppercase text-stone-700 mb-1">Email Address</label>
                <input type="email" disabled defaultValue={user?.email || ''} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-100 text-stone-500 text-sm font-medium cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-wider uppercase text-stone-700 mb-1">Phone Number</label>
                <input type="text" defaultValue={user?.phone || ''} placeholder="+91 9876543210" className="w-full px-4 py-3 rounded-xl border border-[#b8963e]/30 bg-stone-50 text-sm font-medium" />
              </div>

              <button type="submit" className="mt-2 bg-[#6b1929] hover:bg-[#8b2336] text-white font-bold text-xs tracking-widest uppercase py-3.5 rounded-full shadow-md">
                SAVE CHANGES
              </button>
            </form>
          </div>
        )}

        {/* Add / Edit Location Modal */}
        {showAddressModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#fffdfa] rounded-xl max-w-md w-full p-6 sm:p-8 border border-[#b8963e]/40 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
              <button 
                onClick={() => setShowAddressModal(false)}
                className="absolute top-5 right-5 text-stone-400 hover:text-[#6b1929] text-lg font-bold transition-colors"
              >
                ✕
              </button>

              <h3 className="font-serif text-2xl font-bold text-[#6b1929] mb-1 tracking-wide">
                {editingAddressId ? 'Edit Location' : 'Add New Location'}
              </h3>
              <p className="text-xs text-stone-500 uppercase tracking-widest font-semibold mb-6">
                Enter shipping address details
              </p>

              <form onSubmit={handleSaveAddress} className="flex flex-col gap-4 text-left">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-800 mb-1">Location Label / Title</label>
                  <input 
                    type="text" 
                    required 
                    value={addrTitle}
                    onChange={(e) => setAddrTitle(e.target.value)}
                    placeholder="e.g. Home / Atelier Studio / Office"
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#b8963e]/30 bg-[#fbf6ee]/50 text-stone-900 text-xs font-medium focus:outline-none focus:border-[#6b1929] transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-800 mb-1">Recipient Name</label>
                    <input 
                      type="text" 
                      required 
                      value={addrName}
                      onChange={(e) => setAddrName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-3.5 py-2.5 rounded-md border border-[#b8963e]/30 bg-[#fbf6ee]/50 text-stone-900 text-xs font-medium focus:outline-none focus:border-[#6b1929] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-800 mb-1">Contact Phone</label>
                    <input 
                      type="text" 
                      required 
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full px-3.5 py-2.5 rounded-md border border-[#b8963e]/30 bg-[#fbf6ee]/50 text-stone-900 text-xs font-medium focus:outline-none focus:border-[#6b1929] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-800 mb-1">Street Address</label>
                  <input 
                    type="text" 
                    required 
                    value={addrStreet}
                    onChange={(e) => setAddrStreet(e.target.value)}
                    placeholder="Flat / House No., Building Name, Street"
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#b8963e]/30 bg-[#fbf6ee]/50 text-stone-900 text-xs font-medium focus:outline-none focus:border-[#6b1929] transition-all"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-800 mb-1">City</label>
                    <input 
                      type="text" 
                      required 
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-md border border-[#b8963e]/30 bg-[#fbf6ee]/50 text-stone-900 text-xs font-medium focus:outline-none focus:border-[#6b1929] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-800 mb-1">State</label>
                    <input 
                      type="text" 
                      required 
                      value={addrState}
                      onChange={(e) => setAddrState(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-md border border-[#b8963e]/30 bg-[#fbf6ee]/50 text-stone-900 text-xs font-medium focus:outline-none focus:border-[#6b1929] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-800 mb-1">Pincode</label>
                    <input 
                      type="text" 
                      required 
                      value={addrPincode}
                      onChange={(e) => setAddrPincode(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-md border border-[#b8963e]/30 bg-[#fbf6ee]/50 text-stone-900 text-xs font-medium focus:outline-none focus:border-[#6b1929] transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <input 
                    type="checkbox" 
                    id="addrDefaultChk"
                    checked={addrIsDefault}
                    onChange={(e) => setAddrIsDefault(e.target.checked)}
                    className="accent-[#6b1929] w-4 h-4 rounded-sm"
                  />
                  <label htmlFor="addrDefaultChk" className="text-xs text-stone-800 font-bold cursor-pointer">
                    Set as Primary Default Address
                  </label>
                </div>

                <div className="flex gap-3 mt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowAddressModal(false)}
                    className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs uppercase tracking-widest rounded-md transition-colors border border-stone-300"
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 bg-[#6b1929] hover:bg-[#8b2336] text-white font-bold text-xs uppercase tracking-widest rounded-md shadow-md transition-colors"
                  >
                    {editingAddressId ? 'SAVE CHANGES' : 'CREATE LOCATION'}
                  </button>
                </div>
              </form>
            </div>
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
          onClick={() => router.push('/wishlist')} 
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-stone-500 hover:text-[#6b1929] transition-colors relative py-1"
        >
          <div className="relative">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            {wishlistIds.length > 0 && <span className="absolute -top-1 -right-2 bg-[#6b1929] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{wishlistIds.length}</span>}
          </div>
          <span>WISHLIST</span>
        </button>
      </nav>
    </div>
  );
}
