'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getProducts, fetchCart, addCartItem, Product } from '@/lib/api';
import { getWishlistIds, toggleWishlist, subscribeWishlist } from '@/lib/wishlist';
import { animateFlyToCart } from '@/lib/flyToCart';

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cartCount, setCartCount] = useState<number>(0);
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Subscribe to wishlist updates across tabs/components
    const unsubscribe = subscribeWishlist((ids) => {
      setWishlistIds(ids);
    });

    fetchCart().then(c => {
      if (c && c.items) setCartCount(c.items.length);
    });

    // Fetch products
    setLoading(true);
    getProducts().then(res => {
      if (Array.isArray(res)) {
        setProducts(res);
      }
    }).catch(err => {
      console.error('Error fetching products for wishlist:', err);
    }).finally(() => {
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRemoveFromWishlist = (productId: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(productId);
  };

  const handleAddToCart = (product: Product, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const prodDetails = {
      name: product.name,
      price: product.rawPrice || parseFloat(product.price.replace(/[^\d.]/g, '')) || 18500,
      image: product.image,
      category: product.category
    };

    addCartItem(String(product.id), 'M', 1, 'Ivory', prodDetails).then(updated => {
      if (updated && updated.items) setCartCount(updated.items.length);
    });
    setCartCount(prev => prev + 1);

    const sourceElem = event.currentTarget as HTMLElement;
    animateFlyToCart(sourceElem, product.image);
  };

  const savedProducts = products.filter(p => {
    const pIdStr = String(p.id || '');
    const pMongoIdStr = (p as any)._id ? String((p as any)._id) : '';
    return wishlistIds.some(wId => {
      const wIdStr = String(wId);
      return wIdStr === pIdStr || (Boolean(pMongoIdStr) && wIdStr === pMongoIdStr);
    });
  });

  return (
    <div className="min-h-screen bg-[#f7efe3] text-[#1a0a0e] font-sans">
      {/* Sticky App Bar (Luxury Navigation Header) */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b border-[#b8963e]/20 transition-all duration-300 px-4 sm:px-6 md:px-10 py-3 flex items-center justify-between ${scrolled ? 'bg-[#f7efe3]/95 shadow-md' : 'bg-[#f7efe3]/90'}`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="w-8 h-8 rounded-full bg-white/80 border border-[#b8963e]/30 flex items-center justify-center text-stone-700 hover:text-[#6b1929] hover:bg-white transition-all shadow-sm"
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
          <span className="hidden sm:inline-block text-xs font-serif font-semibold text-[#6b1929] bg-[#b8963e]/10 px-3 py-1 rounded-full border border-[#b8963e]/20">
            My Wishlist ({wishlistIds.length})
          </span>
          
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
              const token = typeof window !== 'undefined' ? (localStorage.getItem('riwaaya_token') || localStorage.getItem('token')) : null;
              router.push(token ? '/profile' : '/login');
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>

          <button 
            id="cart-icon-header"
            className="p-1.5 text-stone-800 hover:text-[#6b1929] transition-colors rounded-lg hover:bg-[#b8963e]/10 relative" 
            aria-label="Shopping Bag"
            onClick={() => router.push('/cart')}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 21h12a2 2 0 0 0 2-2V8H4v11a2 2 0 0 0 2 2z"></path>
              <path d="M16 8V6a4 4 0 0 0-8 0v2"></path>
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#6b1929] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Breadcrumbs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-4 flex items-center gap-2 text-[11px] md:text-xs font-semibold tracking-wider uppercase text-stone-500">
        <a href="#" className="hover:text-[#6b1929] transition-colors" onClick={(e) => { e.preventDefault(); router.push('/'); }}>Home</a>
        <span className="text-[#b8963e]/40">/</span>
        <span className="text-[#6b1929] font-bold">Saved Wishlist</span>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-8">
        
        {/* Title Header Card */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white/70 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-[#b8963e]/20 shadow-sm">
          <div>
            <span className="text-[10px] md:text-xs font-extrabold tracking-[0.18em] text-[#b8963e] uppercase block mb-1">
              ✦ RIWAAYA SAVED FAVORITES
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-semibold text-[#6b1929]">
              Your Curated Wishlist
            </h1>
            <p className="text-xs md:text-sm text-stone-600 mt-1 font-light">
              Saved artisanal pret designs, festive suits, and luxury couture pieces.
            </p>
          </div>
          
          <div className="bg-[#6b1929] text-white text-xs font-semibold px-4 py-2 rounded-full tracking-wider shadow-sm flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#b8963e" stroke="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <span>{wishlistIds.length} {wishlistIds.length === 1 ? 'Item' : 'Items'} Saved</span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-[#b8963e]/20 shadow-sm gap-3">
            <div className="w-10 h-10 border-3 border-[#b8963e]/30 border-t-[#6b1929] rounded-full animate-spin" />
            <p className="font-serif text-stone-700 text-sm">Loading your saved wishlist...</p>
          </div>
        ) : savedProducts.length === 0 ? (
          /* Empty Wishlist State */
          <div className="text-center py-20 px-6 bg-white rounded-3xl border border-dashed border-[#b8963e]/40 shadow-sm flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#6b1929]/10 text-[#6b1929] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-[#6b1929] font-semibold">
              Your Wishlist is Empty
            </h2>
            <p className="text-stone-600 text-sm max-w-md leading-relaxed font-light">
              You haven't saved any items yet. Tap the heart icon on any product card to save your favorite couture pieces here.
            </p>
            <button 
              className="mt-2 bg-[#6b1929] hover:bg-[#8b2336] text-white font-bold text-xs tracking-widest uppercase px-8 py-3.5 rounded-full transition-all shadow-md hover:shadow-lg" 
              onClick={() => router.push('/collections/all')}
            >
              EXPLORE COLLECTIONS ➔
            </button>
          </div>
        ) : (
          /* Wishlist Product Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {savedProducts.map((product) => (
              <div 
                key={product.id}
                onClick={() => router.push(`/product/${product.id}`)}
                className="bg-white rounded-2xl border border-[#b8963e]/20 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer flex flex-col justify-between"
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    fill 
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500" 
                  />

                  {/* Badge */}
                  {product.badge && (
                    <span className="absolute top-2.5 left-2.5 bg-[#6b1929] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      {product.badge}
                    </span>
                  )}

                  {/* Remove Wishlist Button (Top-Right Heart) */}
                  <button 
                    onClick={(e) => handleRemoveFromWishlist(product.id, e)}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 text-red-600 shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                    aria-label="Remove from Wishlist"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                </div>

                {/* Content Section */}
                <div className="p-4 flex flex-col gap-2 flex-1 justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#b8963e] tracking-widest uppercase block">
                      {product.category}
                    </span>
                    <h3 className="font-serif text-sm font-semibold text-stone-900 line-clamp-1 group-hover:text-[#6b1929] transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-bold text-sm sm:text-base text-[#6b1929]">
                        {product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="line-through text-stone-400 text-xs font-serif">
                          {product.originalPrice}
                        </span>
                      )}
                    </div>

                    {/* Add to Bag CTA Button */}
                    <button 
                      onClick={(e) => handleAddToCart(product, e)}
                      className="w-full mt-3 bg-[#6b1929] hover:bg-[#8b2336] text-white text-[11px] font-bold tracking-widest uppercase py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 21h12a2 2 0 0 0 2-2V8H4v11a2 2 0 0 0 2 2z"></path>
                        <path d="M16 8V6a4 4 0 0 0-8 0v2"></path>
                      </svg>
                      <span>Add to Bag</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
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

      {/* Fixed Bottom Navigation Bar (Mobile) */}
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
          className="flex flex-col items-center gap-1 text-[10px] font-extrabold text-[#6b1929] transition-colors relative py-1"
        >
          <div className="w-6 h-0.5 bg-[#6b1929] rounded-full absolute -top-2" />
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
