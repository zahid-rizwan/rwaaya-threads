'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { getProducts, fetchCart, addCartItem, Product } from '@/lib/api';
import { getWishlistIds, toggleWishlist as toggleWishlistStore, subscribeWishlist } from '@/lib/wishlist';
import { animateFlyToCart } from '@/lib/flyToCart';
import ProductSkeletonGrid from '@/components/ProductSkeletonGrid';

const categoryBanners: Record<string, { title: string; subtitle: string; description: string; image: string }> = {
  all: {
    title: "All Collections",
    subtitle: "DISCOVER TIMELESS SILHOUETTES",
    description: "Explore our complete range of luxury Pakistani Suits, Co-Ord Sets, Festive Party Wear, and Royal Gift Hampers.",
    image: "/assets/pakistani_suits.png"
  },
  suits: {
    title: "Pakistani Suits",
    subtitle: "SUMMER HUES",
    description: "Discover timeless silhouettes crafted with elegance, tradition, and contemporary luxury.",
    image: "/assets/pakistani_suits.png"
  },
  coords: {
    title: "Co-Ord Sets",
    subtitle: "CURATED PAIRINGS",
    description: "Effortlessly curated pairings for the modern South Asian woman.",
    image: "/assets/cord_sets.png"
  },
  party: {
    title: "Party Wear",
    subtitle: "HERITAGE & FESTIVE",
    description: "Evening glamour for every occasion — from intimate dinners to grand celebrations.",
    image: "/assets/13960744be005aa72595ea1e43c13afca8050ca4.png"
  },
  hampers: {
    title: "Gift Hampers",
    subtitle: "EXCLUSIVE GIFTING",
    description: "Luxuriously curated gifts for the most cherished and memorable moments.",
    image: "/assets/gift_hamper.png"
  }
};

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const activeCategory = selectedCategory || (params.category as string) || 'suits';
  
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [cartCount, setCartCount] = useState<number>(0);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribeWishlist = subscribeWishlist((ids) => {
      setWishlist(ids);
    });
    fetchCart().then(c => {
      if (c && c.items) setCartCount(c.items.length);
    });
    return () => unsubscribeWishlist();
  }, []);

  useEffect(() => {
    setLoadingProducts(true);
    getProducts(activeCategory).then((data) => {
      setProductsList(Array.isArray(data) ? data : []);
      setLoadingProducts(false);
    }).catch(() => {
      setLoadingProducts(false);
    });
  }, [activeCategory]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = [
    { id: 'all', name: 'All Collection' },
    { id: 'suits', name: 'Pakistani Suits' },
    { id: 'coords', name: 'Co-Ord Sets' },
    { id: 'party', name: 'Party Wear' },
    { id: 'hampers', name: 'Gift Hampers' }
  ];

  const exploreCollections = [
    { title: "Co-Ord Sets", subtitle: "EXPLORE COLLECTION", image: "/assets/8cd274c8adf8a9367c11b2f398e872089e3379a0.png", tag: "coords" },
    { title: "Bridal Collection", subtitle: "EXPLORE COLLECTION", image: "/assets/13960744be005aa72595ea1e43c13afca8050ca4.png", tag: "party" },
    { title: "Gift Hampers", subtitle: "EXPLORE COLLECTION", image: "/assets/bfbf18493c6f15c8b582f56fad304f8de3f26c0f.png", tag: "hampers" }
  ];

  const addToBag = (productId: string | number, eventOrElem?: React.MouseEvent | HTMLElement, imgSrc?: string) => {
    const p = productsList.find(item => String(item.id) === String(productId));
    const itemColor = p?.colorName || (p?.colors && p.colors.length > 0 ? p.colors[0].name : '') || 'Standard';
    const prodDetails = p ? {
      name: p.name,
      price: p.rawPrice || parseFloat(p.price.replace(/[^\d.]/g, '')) || 18500,
      image: imgSrc || p.image,
      category: p.category,
      color: itemColor
    } : undefined;

    addCartItem(String(productId), 'M', 1, itemColor, prodDetails).then(updated => {
      if (updated && updated.items) setCartCount(updated.items.length);
    });
    setCartCount(prev => prev + 1);
    
    let sourceElem: HTMLElement | null = null;
    if (eventOrElem && 'currentTarget' in eventOrElem) {
      sourceElem = eventOrElem.currentTarget as HTMLElement;
    } else if (eventOrElem instanceof HTMLElement) {
      sourceElem = eventOrElem;
    }
    
    animateFlyToCart(sourceElem, imgSrc || p?.image);
  };

  const toggleWishlist = (productId: string | number) => {
    toggleWishlistStore(productId);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const filteredProducts = productsList;

  const banner = categoryBanners[activeCategory] || categoryBanners['suits'];

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

      {/* Top Circular Story Category Bar (Matching Home Page) */}
      <div className="max-w-7xl mx-auto px-4 py-4 overflow-x-auto scrollbar-none flex items-center justify-start sm:justify-center gap-4 sm:gap-8 border-b border-[#b8963e]/20 bg-[#f7efe3]">
        {[
          { id: 'all', name: 'All Collection', image: '/assets/2131d28031801befa44bd105ec5914c27b763b64.png', tag: 'all' },
          { id: 'suits', name: 'Pakistani Suits', image: '/assets/pakistani_suits.png', tag: 'suits' },
          { id: 'coords', name: 'Co-Ord Sets', image: '/assets/cord_sets.png', tag: 'coords' },
          { id: 'party', name: 'Party Wear', image: '/assets/13960744be005aa72595ea1e43c13afca8050ca4.png', tag: 'party' },
          { id: 'hampers', name: 'Gift Hampers', image: '/assets/gift_hamper.png', tag: 'hampers' }
        ].map((cat) => (
          <button 
            key={cat.id} 
            className="flex flex-col items-center gap-2 group flex-shrink-0 cursor-pointer select-none outline-none"
            onClick={() => {
              setSelectedCategory(cat.tag);
              router.push(`/collections/${cat.tag}`);
            }}
          >
            <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 border-2 shadow-sm group-hover:scale-105 transition-transform duration-300 bg-white ${activeCategory === cat.tag ? 'border-[#6b1929] ring-2 ring-[#6b1929]/30 scale-105' : 'border-[#b8963e]'}`}>
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image src={cat.image} alt={cat.name} fill className="object-cover object-top" />
              </div>
            </div>
            <span className={`text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-center max-w-[95px] truncate transition-colors ${activeCategory === cat.tag ? 'text-[#6b1929]' : 'text-stone-800 group-hover:text-[#6b1929]'}`}>
              {cat.name}
            </span>
          </button>
        ))}
      </div>

      {/* Collection Hero Banner (Matching Home Page Carousel Banner Style) */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-10 my-4 sm:my-6">
        <div 
          className="relative w-full aspect-[4/5] sm:aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden border border-[#b8963e]/30 shadow-xl group cursor-pointer"
          onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <Image 
            src={banner.image} 
            alt={banner.title}
            fill
            className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
          
          {/* Hero Content Overlay — Perfectly Aligned Bottom Left (Matching Home Screen Carousel) */}
          <div className="absolute bottom-8 sm:bottom-12 left-6 sm:left-12 right-20 z-20 flex flex-col items-start text-left text-white">
            <span className="bg-[#b8963e] text-stone-900 text-[10px] sm:text-xs font-extrabold px-3 py-1 rounded-full tracking-[0.2em] uppercase mb-2 shadow-md">
              {banner.subtitle}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold tracking-wide text-white drop-shadow-lg leading-tight mb-1">
              {banner.title}
            </h2>
            <p className="text-stone-200 text-xs sm:text-sm font-light leading-relaxed max-w-lg hidden sm:block mb-3 drop-shadow">
              {banner.description}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[#b8963e] text-xs font-bold tracking-widest uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                EXPLORE COLLECTION ➔
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section Heading (Matching Home Screen Carousel Section) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-6 pb-2 text-center">
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-stone-900 tracking-wide inline-flex items-center gap-2 cursor-pointer hover:text-[#6b1929] transition-colors">
          <span>{banner.subtitle}</span>
          <span className="text-xl">➔</span>
        </h2>
      </div>

      {/* Category Description */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-2 text-center">
        <p className="text-stone-600 text-xs md:text-sm font-medium leading-relaxed max-w-2xl mx-auto">
          {banner.description}
        </p>
      </div>

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-2 flex items-center justify-center gap-2 text-[11px] md:text-xs font-semibold tracking-wider uppercase text-stone-500">
        <span className="cursor-pointer hover:text-[#6b1929] transition-colors" onClick={() => router.push('/')}>Home</span>
        <span className="text-[#b8963e]/40">/</span>
        <span className="cursor-pointer hover:text-[#6b1929] transition-colors" onClick={() => router.push('/collections/all')}>Collections</span>
        <span className="text-[#b8963e]/40">/</span>
        <span className="text-[#6b1929] font-bold">
          {categories.find(c => c.id === activeCategory)?.name || 'Pakistani Suits'}
        </span>
      </div>

      {/* Products Grid */}
      <section id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6">
        {loadingProducts ? (
          <ProductSkeletonGrid count={4} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={(product as any).cardId || product.id} 
                className="group flex flex-col cursor-pointer transition-all duration-300" 
                data-product-card 
                onClick={() => router.push(`/product/${product.id}${(product as any).colorName ? `?color=${encodeURIComponent((product as any).colorName)}` : ''}`)}
              >
                {/* Image Container */}
                <div className="relative w-full aspect-[3/4] bg-stone-100 overflow-hidden rounded-md border border-stone-200/60 shadow-xs">
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Optional Top-Left Badge */}
                  {product.badge && (
                    <span className="absolute top-2.5 left-2.5 bg-[#6b1929] text-white text-[10px] font-bold px-2.5 py-0.5 rounded tracking-wider uppercase z-10 shadow-sm">
                      {product.badge}
                    </span>
                  )}

                  {/* Bottom-Left Floating Rating Badge (Matching Screenshot: 4.8 ★ | 1.2k) */}
                  <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-md px-2 py-1 rounded text-[11px] font-bold text-stone-900 flex items-center gap-1 shadow-sm z-10">
                    <span>4.8</span>
                    <svg width="12" height="12" fill="#0d9488" viewBox="0 0 24 24" className="text-teal-600">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                    </svg>
                    <span className="text-stone-300 font-normal mx-0.5">|</span>
                    <span className="text-stone-600 font-medium">1.2k</span>
                  </div>

                  {/* Top-Right Wishlist Button */}
                  <button 
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-stone-700 hover:bg-[#6b1929] hover:text-white transition-all z-10 shadow-sm"
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                    aria-label="Add to wishlist"
                    title="Wishlist"
                  >
                    <svg width="14" height="14" fill={wishlist.includes(String(product.id)) ? "#6b1929" : "none"} stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>

                  {/* Bottom-Right Quick Add Cart Button */}
                  <button 
                    className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-[#6b1929] hover:bg-[#b8963e] text-white flex items-center justify-center transition-all duration-300 shadow-md z-10 hover:scale-110 active:scale-95"
                    onClick={(e) => { e.stopPropagation(); addToBag(product.id, e, product.image); }}
                    aria-label="Add to Cart"
                    title="Add to Cart"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
                      <path d="M6 21h12a2 2 0 0 0 2-2V8H4v11a2 2 0 0 0 2 2z"></path>
                      <path d="M16 8V6a4 4 0 0 0-8 0v2"></path>
                    </svg>
                  </button>
                </div>

                {/* Product Info below image matching exact reference photo */}
                <div className="pt-2.5 pb-1 flex flex-col flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h3 className="font-bold text-stone-900 text-sm sm:text-base uppercase tracking-wider leading-snug">
                      {product.category || 'RIWAAYA'}
                    </h3>
                    {(product as any).colorName && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                        <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: (product as any).colorHex || '#B8963E' }} />
                        <span>{(product as any).colorName}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-stone-500 text-xs sm:text-sm font-normal truncate leading-snug mb-1">
                    {product.name}
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap mt-auto">
                    <span className="font-bold text-sm sm:text-base text-stone-900">{product.price}</span>
                    {product.originalPrice && (
                      <span className="line-through text-stone-400 text-xs font-normal">
                        {product.originalPrice}
                      </span>
                    )}
                    {Boolean(product.discountPercent) && (
                      <span className="text-[#e56a54] text-xs font-bold">
                        ({product.discountPercent}% OFF)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Explore More Section */}
      <section id="heritage-section" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10">
        <div className="text-center mb-8">
          <p className="text-xs font-bold text-[#b8963e] tracking-widest uppercase mb-1">EXPLORE MORE</p>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900">You May Also Like</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {exploreCollections.map((col, idx) => (
            <div key={idx} className="group relative h-64 md:h-80 rounded-2xl overflow-hidden cursor-pointer border border-[#b8963e]/20 shadow-md" onClick={() => router.push(`/collections/${col.tag}`)}>
              <Image src={col.image} alt={col.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex items-end justify-between text-white">
                <div className="flex flex-col items-start gap-1">
                  <p className="text-[10px] font-bold text-[#b8963e] tracking-widest uppercase">{col.subtitle}</p>
                  <h3 className="font-serif text-xl font-semibold">{col.title}</h3>
                </div>
                <div className="text-lg font-bold group-hover:translate-x-1 transition-transform">➔</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Luxury "Join the Inner Circle" Newsletter Section */}
      <section className="bg-[#f9f3ea] text-stone-900 my-12 py-16 md:py-20 px-4 border-y border-[#b8963e]/20">
        <div className="max-w-xl mx-auto text-center flex flex-col items-center">
          
          {/* Centered Gold Bow Ribbon SVG Emblem */}
          <svg width="70" height="35" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-auto mb-3 text-[#c5a666]">
            <path d="M50 24C38 8 12 10 10 24C8 38 34 38 50 24Z" fill="currentColor" opacity="0.8" />
            <path d="M50 24C62 8 88 10 90 24C92 38 66 38 50 24Z" fill="currentColor" opacity="0.8" />
            <path d="M48 26C35 34 20 42 12 46C24 40 38 34 48 26Z" fill="#b8963e" />
            <path d="M52 26C65 34 80 42 88 46C76 40 62 34 52 26Z" fill="#b8963e" />
            <circle cx="50" cy="24" r="3.5" fill="#a38234" />
          </svg>

          <p className="text-[#b8963e] text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase mb-2">
            EXCLUSIVE ACCESS
          </p>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#1c1917] tracking-tight mb-3">
            Join the Inner Circle
          </h2>

          <p className="text-[#6e6254] text-xs sm:text-sm font-normal max-w-md mx-auto leading-relaxed mb-8">
            Be the first to discover new collections, exclusive editorial drops, and private sale events. Curated for the discerning few.
          </p>
          
          {subscribed ? (
            <div className="text-[#6b1929] font-serif font-bold text-lg p-4 bg-[#f3e7d6] rounded-md border border-[#b8963e]/30 animate-fade-in w-full max-w-md">
              Thank you for joining our Inner Circle. Welcome.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3 w-full max-w-md">
              <input
                type="email"
                placeholder="Your email address"
                required
                className="w-full px-5 py-3.5 bg-[#faf6f0] border border-[#c5a666]/60 text-stone-900 placeholder-[#a89b88] focus:outline-none focus:border-[#b8963e] text-sm text-center sm:text-left transition-colors"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
              <button 
                type="submit" 
                className="w-full bg-[#591b26] hover:bg-[#6b1929] text-white font-bold text-xs sm:text-sm tracking-[0.25em] uppercase py-4 transition-colors shadow-md"
              >
                SUBSCRIBE
              </button>
            </form>
          )}

          <p className="text-[#9e907e] text-[11px] sm:text-xs font-normal mt-4">
            No spam, ever. Unsubscribe at any time.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a0a0e] text-stone-300 pt-16 pb-24 md:pb-12 px-4 sm:px-6 md:px-10 border-t border-[#b8963e]/30">
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

      {/* Bottom Navigation Bar */}
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
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-[#6b1929] relative py-1"
        >
          <div className="w-6 h-0.5 bg-[#6b1929] rounded-full absolute -top-2" />
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
            {wishlist.length > 0 && <span className="absolute -top-1 -right-2 bg-[#6b1929] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{wishlist.length}</span>}
          </div>
          <span>WISHLIST</span>
        </button>
      </nav>

    </div>
  );
}
