'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './page.module.css';

// Type definitions for our data structures
interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
  badge?: string;
  tag: string; // Used for quick shop filtering: suits, coords, party, hampers
}

interface Testimonial {
  text: string;
  author: string;
  city: string;
}

// Category hero details matching Figma subcategory layouts
const categoryBanners: Record<string, { title: string; subtitle: string; description: string; image: string }> = {
  suits: {
    title: "Pakistani Suits",
    subtitle: "Discover timeless silhouettes",
    description: "Discover timeless silhouettes crafted with elegance, tradition, and contemporary luxury.",
    image: "/assets/e7088a2366cb90adc3302932505be2bc610e9afe.png"
  },
  coords: {
    title: "Co-Ord Sets",
    subtitle: "Curated Pairings",
    description: "Effortlessly curated pairings for the modern South Asian woman.",
    image: "/assets/8cd274c8adf8a9367c11b2f398e872089e3379a0.png"
  },
  party: {
    title: "Party Wear",
    subtitle: "Heritage & Festive",
    description: "Evening glamour for every occasion — from intimate dinners to grand celebrations.",
    image: "/assets/13960744be005aa72595ea1e43c13afca8050ca4.png"
  },
  hampers: {
    title: "Gift Hampers",
    subtitle: "Exclusive Gifting",
    description: "Luxuriously curated gifts for the most cherished and memorable moments.",
    image: "/assets/bfbf18493c6f15c8b582f56fad304f8de3f26c0f.png"
  }
};

export default function Home() {
  // Dynamic View Routing State
  const [view, setView] = useState<'home' | 'category' | 'product-detail' | 'login'>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewHistory, setViewHistory] = useState<string[]>([]);

  // Product detail states
  const [selectedColor, setSelectedColor] = useState<string>('Ivory');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [productQuantity, setProductQuantity] = useState<number>(1);
  const [activeDetailTab, setActiveDetailTab] = useState<'details' | 'materials' | 'shipping'>('details');

  // Navigation & interaction states
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTestimonial, setActiveTestimonial] = useState<number>(0);
  const [cartCount, setCartCount] = useState<number>(0);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  // Track page scroll to add shadow to header
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

  // Auto-scroll testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Navigation helpers
  const navigateToView = (newView: 'home' | 'category' | 'product-detail' | 'login') => {
    setViewHistory(prev => [...prev, view]);
    setView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (viewHistory.length > 0) {
      const previousView = viewHistory[viewHistory.length - 1];
      setViewHistory(prev => prev.slice(0, -1));
      setView(previousView as any);
    } else {
      setView('home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Products dataset matching Figma designs
  const products: Product[] = [
    {
      id: 1,
      name: "Gulzar Ivory Suit",
      category: "Pakistani Suit",
      price: "PKR 18,500",
      image: "/assets/1540aab590cd7d478ad01cdb1a615d469ef2a808.png",
      badge: "New",
      tag: "suits"
    },
    {
      id: 2,
      name: "Amber Heritage Lawn",
      category: "Co-ord Set",
      price: "PKR 14,200",
      image: "/assets/f5033b1a4ddb926f41bc87a1c3a2f99082eaa624.png",
      badge: "Bestseller",
      tag: "coords"
    },
    {
      id: 3,
      name: "Rose Dust Gharara",
      category: "Bridal Ready",
      price: "PKR 24,500",
      image: "/assets/14b11c8de3394bd25477cfb02149a056c046d507.png",
      badge: "Limited",
      tag: "party"
    },
    {
      id: 4,
      name: "Chestnut Formal Set",
      category: "Ethnic Wear",
      price: "PKR 9,800",
      image: "/assets/56d6e1294f3009f3c4a559fbd7d8cef93accbb88.png",
      tag: "party"
    },
    {
      id: 5,
      name: "Emerald Elegance",
      category: "Pakistani Suit",
      price: "PKR 16,500",
      image: "/assets/6c39f865e80859a62255826c54bd32b849dd3ca2.png",
      badge: "New",
      tag: "suits"
    },
    {
      id: 6,
      name: "Ruby Velvet Edit",
      category: "Party Wear",
      price: "PKR 22,000",
      image: "/assets/70b5f877ef1ef7414a1384b3406d6cd1f8083de7.png",
      badge: "Bestseller",
      tag: "party"
    },
    {
      id: 7,
      name: "Sapphire Silk Suit",
      category: "Pakistani Suit",
      price: "PKR 19,500",
      image: "/assets/f1518341f4e01d47c3cac265752092154acdaa3b.png",
      tag: "suits"
    },
    {
      id: 8,
      name: "Forest Green Set",
      category: "Co-ord Set",
      price: "PKR 15,000",
      image: "/assets/5d977febba2763ad18f4d8a4a72993197abe53ac.png",
      tag: "coords"
    },
    {
      id: 9,
      name: "Velvet Evening Suit",
      category: "Party Wear",
      price: "PKR 28,000",
      image: "/assets/70b5f877ef1ef7414a1384b3406d6cd1f8083de7.png",
      badge: "Bestseller",
      tag: "party"
    },
    {
      id: 10,
      name: "Shahi Heritage Hamper",
      category: "Gift Hamper",
      price: "PKR 12,500",
      image: "/assets/bfbf18493c6f15c8b582f56fad304f8de3f26c0f.png",
      badge: "Exclusive",
      tag: "hampers"
    },
    {
      id: 11,
      name: "Darbar Premium Gift Box",
      category: "Gift Hamper",
      price: "PKR 8,500",
      image: "/assets/5d977febba2763ad18f4d8a4a72993197abe53ac.png",
      badge: "New",
      tag: "hampers"
    }
  ];

  // Testimonials dataset matching Figma design
  const testimonials: Testimonial[] = [
    {
      text: "The quality of the lawn and the intricate embroidery exceeded all my expectations. It feels like wearing a piece of art.",
      author: "Mariam K.",
      city: "Karachi"
    },
    {
      text: "Absolutely gorgeous fit. The fabric has a premium weight and the colors are even richer in person. A staple for my festive wardrobe.",
      author: "Sarah A.",
      city: "Lahore"
    },
    {
      text: "I wore the Rose Dust Gharara to a private editorial event and received non-stop compliments. Elegant craftsmanship at its best.",
      author: "Zainab M.",
      city: "Islamabad"
    }
  ];

  // Quick Shop categories list (includes Gift Hampers matching Figma)
  const categories = [
    { id: 'all', name: 'All Collection', emoji: '✨' },
    { id: 'suits', name: 'Pakistani Suits', emoji: '👗' },
    { id: 'coords', name: 'Co-Ord Sets', emoji: '✨' },
    { id: 'party', name: 'Party Wear', emoji: '🌙' },
    { id: 'hampers', name: 'Gift Hampers', emoji: '🎁' }
  ];

  // Functions to handle cart & wishlist updates
  const addToBag = (productId: number) => {
    setCartCount(prev => prev + 1);
    
    // Smooth toast notification fallback
    const alertBox = document.createElement('div');
    alertBox.style.position = 'fixed';
    alertBox.style.bottom = '20px';
    alertBox.style.right = '20px';
    alertBox.style.backgroundColor = '#6b1929';
    alertBox.style.color = '#fffdf8';
    alertBox.style.padding = '12px 24px';
    alertBox.style.borderRadius = '4px';
    alertBox.style.zIndex = '1000';
    alertBox.style.fontFamily = 'var(--font-sans)';
    alertBox.style.fontSize = '0.8rem';
    alertBox.style.fontWeight = 'bold';
    alertBox.style.letterSpacing = '0.1em';
    alertBox.style.textTransform = 'uppercase';
    alertBox.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    alertBox.innerText = 'Added to Bag';
    document.body.appendChild(alertBox);
    setTimeout(() => alertBox.remove(), 2500);
  };

  const toggleWishlist = (productId: number) => {
    if (wishlist.includes(productId)) {
      setWishlist(prev => prev.filter(id => id !== productId));
    } else {
      setWishlist(prev => [...prev, productId]);
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setProductQuantity(1);
    setSelectedColor('Ivory');
    setSelectedSize('M');
    navigateToView('product-detail');
  };

  // Filter products by selected tag
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.tag === activeCategory);

  return (
    <div className={styles.pageContainer}>
      
      {/* 1. Announcement Bar */}
      <div className={styles.announcementBar}>
        <div className={styles.announcementText}>
          ✦ FREE SHIPPING ON ORDERS ABOVE PKR 5,000 · NEW ARRIVALS: THE GULZAR EDIT IS HERE ✦ FREE SHIPPING ON ORDERS ABOVE PKR 5,000 · NEW ARRIVALS: THE GULZAR EDIT IS HERE
        </div>
      </div>

      {/* 2. Header & Sticky Navigation */}
      <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
        <div className={styles.navLeft}>
          {view !== 'home' ? (
            <button 
              className={styles.backButton} 
              onClick={handleBack}
              aria-label="Go back"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
          ) : (
            <button 
              className={styles.menuButton} 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className={styles.menuBar} style={{ transform: mobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}></span>
              <span className={styles.menuBar} style={{ opacity: mobileMenuOpen ? 0 : 1 }}></span>
              <span className={styles.menuBar} style={{ transform: mobileMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }}></span>
            </button>
          )}
          <ul className={styles.navLinks}>
            <li><a href="#collections" onClick={(e) => { e.preventDefault(); navigateToView('home'); setTimeout(() => document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Collections</a></li>
            <li><a href="#featured" onClick={(e) => { e.preventDefault(); navigateToView('home'); setTimeout(() => document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>New Season</a></li>
            <li><a href="#heritage" onClick={(e) => { e.preventDefault(); navigateToView('home'); setTimeout(() => document.getElementById('heritage')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Our Story</a></li>
            <li><a href="#bridal" onClick={(e) => { e.preventDefault(); navigateToView('home'); setTimeout(() => document.getElementById('bridal')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Bridal Edit</a></li>
          </ul>
        </div>

        <div className={styles.logoContainer}>
          <a href="#" onClick={(e) => { e.preventDefault(); navigateToView('home'); }}>
            <Image 
              src="/assets/2d443a0997545c3de1e9383c78565921faa8a0a8.png" 
              alt="Riwaaya Logo" 
              width={110} 
              height={40} 
              className={styles.logoImage}
              priority
            />
          </a>
        </div>

        <div className={styles.navRight}>
          <button className={styles.iconButton} aria-label="Search">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          
          <button className={styles.iconButton} style={{ position: 'relative' }} aria-label="Wishlist">
            <svg width="18" height="18" fill={wishlist.length > 0 ? "var(--primary)" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            {wishlist.length > 0 && (
              <span className={styles.badgeIndicator}>
                {wishlist.length}
              </span>
            )}
          </button>

          <button className={styles.iconButton} style={{ position: 'relative' }} aria-label="Shopping Bag">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {cartCount > 0 && (
              <span className={styles.badgeIndicator} style={{ backgroundColor: 'var(--primary)', color: 'var(--white)' }}>
                {cartCount}
              </span>
            )}
          </button>

          <button className={styles.iconButton} aria-label="Profile" onClick={() => navigateToView('login')}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          inset: '70px 0 0 0',
          backgroundColor: 'var(--background)',
          zIndex: 97,
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          fontFamily: 'var(--font-serif)',
          fontSize: '1.8rem',
          borderBottom: '1px solid rgba(184, 150, 62, 0.2)'
        }}>
          <a href="#collections" onClick={() => { setMobileMenuOpen(false); navigateToView('home'); setTimeout(() => document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Explore Collections</a>
          <a href="#featured" onClick={() => { setMobileMenuOpen(false); navigateToView('home'); setTimeout(() => document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>New Season Arrivals</a>
          <a href="#heritage" onClick={() => { setMobileMenuOpen(false); navigateToView('home'); setTimeout(() => document.getElementById('heritage')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Our Heritage</a>
          <a href="#bridal" onClick={() => { setMobileMenuOpen(false); navigateToView('home'); setTimeout(() => document.getElementById('bridal')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>The Bridal Edit</a>
        </div>
      )}

      {/* 3. Render Home view */}
      {view === 'home' && (
        <>
          {/* Mobile Sticky Quick Shop Bar (Visible only on Mobile, right below Header) */}
          <div className={`${styles.quickShopBar} ${styles.mobileOnly}`}>
            <div className={styles.quickShopContainer}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`${styles.quickShopBtn} ${activeCategory === cat.id ? styles.quickShopBtnActive : ''}`}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    if (cat.id !== 'all') {
                      navigateToView('category');
                    }
                  }}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <div className={styles.heroBadge}>
                The Gulzar Edit — SS 2025
              </div>
              <h1 className={styles.heroHeading}>
                Where Heritage
                <span className={styles.heroHeadingItalic}>Meets Couture</span>
              </h1>
              <p className={styles.heroTagline}>
                Elegance. Tradition. You.
              </p>
              <div className={styles.heroDivider}>
                <svg className={styles.heroDividerSvg} viewBox="0 0 200 15" fill="none">
                  <line x1="0" y1="7.5" x2="70" y2="7.5" stroke="var(--accent-light)" strokeWidth="1" />
                  <polygon points="100,2 105,7.5 100,13 95,7.5" fill="var(--accent)" />
                  <circle cx="85" cy="7.5" r="3" fill="var(--accent-light)" />
                  <circle cx="115" cy="7.5" r="3" fill="var(--accent-light)" />
                  <line x1="130" y1="7.5" x2="200" y2="7.5" stroke="var(--accent-light)" strokeWidth="1" />
                </svg>
              </div>
              <p className={styles.heroDescription}>
                Handcrafted Pakistani suits, co-ord sets & ethnic wear — each piece a testament to South Asia's most treasured textile traditions.
              </p>
              <div className={styles.heroButtons}>
                <a href="#featured" className={styles.btnPrimary} onClick={(e) => { e.preventDefault(); document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' }); }}>
                  Shop Now
                  <Image src="/assets/a54b15b18195425d01105b01fbb0f118fe433cec.svg" alt="" width={12} height={12} />
                </a>
                <a href="#heritage" className={styles.btnSecondary} onClick={(e) => { e.preventDefault(); document.getElementById('heritage')?.scrollIntoView({ behavior: 'smooth' }); }}>
                  Our Story
                </a>
              </div>
            </div>

            <div className={styles.heroImageContainer}>
              <Image 
                src="/assets/2131d28031801befa44bd105ec5914c27b763b64.png" 
                alt="Riwaaya Couture Model" 
                fill
                className={styles.heroImage}
                priority
              />
              <div className={styles.heroImageOverlay}></div>
            </div>
          </section>

          {/* Quick Shop Sticky Filter Bar (Desktop only, below Hero) */}
          <div className={`${styles.quickShopBar} ${styles.desktopOnly}`}>
            <div className={styles.quickShopContainer}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`${styles.quickShopBtn} ${activeCategory === cat.id ? styles.quickShopBtnActive : ''}`}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    if (cat.id !== 'all') {
                      navigateToView('category');
                    }
                  }}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <section id="collections" className={styles.section}>
            <div className={styles.sectionHeader}>
              <p className={styles.sectionSubtitle}>Curated For You</p>
              <h2 className={styles.sectionTitle}>Explore Our Collections</h2>
              <Image 
                src="/assets/5a652244c6f78d4f361e631332767b532cf2e3ff.svg" 
                alt="Leaf divider" 
                width={120} 
                height={20}
                className={styles.leafDivider}
              />
            </div>

            <div className={styles.collectionsGrid}>
              <div className={styles.collectionCard} onClick={() => { setActiveCategory('suits'); navigateToView('category'); }}>
                <Image 
                  src="/assets/e7088a2366cb90adc3302932505be2bc610e9afe.png" 
                  alt="Pakistani Suits" 
                  fill
                  className={styles.collectionCardImage}
                />
                <div className={styles.collectionCardOverlay}>
                  <p className={styles.collectionCardBadge}>Lawn · Chiffon · Organza</p>
                  <h3 className={styles.collectionCardTitle}>Pakistani Suits</h3>
                  <span className={styles.collectionCardLink}>
                    Explore
                    <Image src="/assets/0f2738febdd49311ded35b2152e28e8a2de51f30.svg" alt="" width={12} height={12} className={styles.collectionCardLinkSvg} />
                  </span>
                </div>
              </div>

              <div className={styles.collectionCard} onClick={() => { setActiveCategory('coords'); navigateToView('category'); }}>
                <Image 
                  src="/assets/8cd274c8adf8a9367c11b2f398e872089e3379a0.png" 
                  alt="Co-ord Sets" 
                  fill
                  className={styles.collectionCardImage}
                />
                <div className={styles.collectionCardOverlay}>
                  <p className={styles.collectionCardBadge}>Curated Pairings</p>
                  <h3 className={styles.collectionCardTitle}>Co-ord Sets</h3>
                  <span className={styles.collectionCardLink}>
                    Explore
                    <Image src="/assets/0f2738febdd49311ded35b2152e28e8a2de51f30.svg" alt="" width={12} height={12} className={styles.collectionCardLinkSvg} />
                  </span>
                </div>
              </div>

              <div className={styles.collectionCard} onClick={() => { setActiveCategory('party'); navigateToView('category'); }}>
                <Image 
                  src="/assets/13960744be005aa72595ea1e43c13afca8050ca4.png" 
                  alt="Ethnic Wear" 
                  fill
                  className={styles.collectionCardImage}
                />
                <div className={styles.collectionCardOverlay}>
                  <p className={styles.collectionCardBadge}>Heritage · Festive · Formal</p>
                  <h3 className={styles.collectionCardTitle}>Ethnic Wear</h3>
                  <span className={styles.collectionCardLink}>
                    Explore
                    <Image src="/assets/0f2738febdd49311ded35b2152e28e8a2de51f30.svg" alt="" width={12} height={12} className={styles.collectionCardLinkSvg} />
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section id="featured" className={`${styles.section} ${styles.featuredBg}`}>
            <div className={styles.featuredHeader}>
              <div className={styles.featuredHeaderLeft}>
                <p className={styles.sectionSubtitle}>The Gulzar Edit</p>
                <h2 className={styles.sectionTitle} style={{ margin: 0 }}>New Season Arrivals</h2>
              </div>
              <button onClick={() => { setActiveCategory('all'); navigateToView('category'); }} className={styles.viewAllLink}>
                View All
                <Image src="/assets/750dd64add809a5a7e5023e80377e97b8a6c550b.svg" alt="" width={12} height={12} />
              </button>
            </div>

            <div className={styles.productsGrid}>
              {filteredProducts.slice(0, 8).map((product) => (
                <div key={product.id} className={styles.productCard} onClick={() => handleProductClick(product)}>
                  <div className={styles.productImageWrapper}>
                    <Image 
                      src={product.image} 
                      alt={product.name} 
                      fill
                      className={styles.productImage}
                    />
                    {product.badge && (
                      <span className={styles.productBadge}>{product.badge}</span>
                    )}
                    <button 
                      className={styles.productWishlistBtn}
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                      aria-label="Add to wishlist"
                    >
                      <svg width="14" height="14" fill={wishlist.includes(product.id) ? "var(--primary)" : "none"} stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </button>
                    <button 
                      className={styles.addBagHover}
                      onClick={(e) => { e.stopPropagation(); addToBag(product.id); }}
                    >
                      <span className={styles.addBagText}>Add to Bag</span>
                    </button>
                  </div>
                  <div className={styles.productInfo}>
                    <p className={styles.productCategory}>{product.category}</p>
                    <h4 className={styles.productTitle}>{product.name}</h4>
                    <p className={styles.productPrice}>{product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="heritage" className={`${styles.section} ${styles.heritageSection}`}>
            <div className={styles.heritageContainer}>
              <div className={styles.heritageLeft}>
                <p className={styles.sectionSubtitle}>Heritage Craft</p>
                <h2 className={styles.sectionTitle}>Handloom Tradition,<br />Crafted for Today</h2>
                <p className={styles.heritageParagraph}>
                  Each of our garments tells a story of craftsmanship. Handcrafted in Pakistan, we work closely with master weavers, embroiderers, and artisans to keep centuries-old techniques alive.
                </p>
                <p className={styles.heritageParagraph}>
                  Every thread is spun with love and intention, bringing you a piece of South Asian history designed for the modern woman.
                </p>
                
                <div className={styles.statsGrid}>
                  <div className={styles.statItem}>
                    <div className={styles.statNumber}>1,500+</div>
                    <div className={styles.statLabel}>Happy Customers</div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.statNumber}>250+</div>
                    <div className={styles.statLabel}>Artisans Supported</div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.statNumber}>5+</div>
                    <div className={styles.statLabel}>Cities Represented</div>
                  </div>
                </div>

                <a href="#collections" className={styles.btnSecondary} style={{ width: 'fit-content' }} onClick={(e) => { e.preventDefault(); document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' }); }}>
                  Read Our Story
                </a>
              </div>

              <div className={styles.heritageRight}>
                <div className={styles.mainHeritageImage}>
                  <Image 
                    src="/assets/bfbf18493c6f15c8b582f56fad304f8de3f26c0f.png" 
                    alt="Weaving artisan craft" 
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className={styles.secondaryHeritageImage}>
                  <Image 
                    src="/assets/5d977febba2763ad18f4d8a4a72993197abe53ac.png" 
                    alt="Embroidery detail close-up" 
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section id="bridal" className={styles.bridalBanner}>
            <div className={styles.bridalSubtitle}>Bridal Season 2025</div>
            <h2 className={styles.bridalTitle}>The Bridal Edit is Here</h2>
            <p className={styles.bridalDescription}>For the bride who wears her heritage with pride</p>
            <button className={styles.btnGold} onClick={() => { setActiveCategory('suits'); navigateToView('category'); }}>
              Discover Bridal
              <Image src="/assets/bc9e1c3cb615ac0db4491f7d6ecf0e31942274f9.svg" alt="" width={12} height={12} />
            </button>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader} style={{ marginBottom: 40 }}>
              <p className={styles.sectionSubtitle}>Words from our community</p>
            </div>

            <div className={styles.testimonialSlider}>
              <div className={styles.quoteIcon}>“</div>
              <p className={styles.testimonialText}>
                {testimonials[activeTestimonial].text}
              </p>
              
              <div className={styles.testimonialOrnament}>
                <svg viewBox="0 0 100 10" fill="none" style={{ width: '100px', height: 'auto' }}>
                  <line x1="0" y1="5" x2="35" y2="5" stroke="var(--accent)" strokeWidth="0.8" />
                  <polygon points="50,1 54,5 50,9 46,5" fill="var(--accent)" />
                  <line x1="65" y1="5" x2="100" y2="5" stroke="var(--accent)" strokeWidth="0.8" />
                </svg>
              </div>

              <h4 className={styles.testimonialAuthor}>{testimonials[activeTestimonial].author}</h4>
              <p className={styles.testimonialCity}>{testimonials[activeTestimonial].city}</p>
            </div>

            <div className={styles.carouselDots}>
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.dot} ${activeTestimonial === index ? styles.dotActive : ''}`}
                  onClick={() => setActiveTestimonial(index)}
                  aria-label={`Go to slide ${index + 1}`}
                ></button>
              ))}
            </div>
          </section>

          <section className={`${styles.section} ${styles.newsletterBg}`}>
            <div className={styles.newsletterContent}>
              <Image 
                src="/assets/55c0c32c9f774f2a29a8d721722af55dd46e4f18.svg" 
                alt="Newsletter emblem" 
                width={80} 
                height={40}
                className={styles.newsletterIcon}
              />
              <p className={styles.sectionSubtitle} style={{ marginBottom: 8 }}>Exclusive Access</p>
              <h2 className={styles.sectionTitle}>Join the Inner Circle</h2>
              <p className={styles.newsletterDesc}>
                Be the first to discover new collections, exclusive editorial drops, and private sale events. Curated for the discerning few.
              </p>
              
              {subscribed ? (
                <div style={{
                  color: 'var(--primary)',
                  fontWeight: 'bold',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.2rem',
                  padding: '12px',
                  animation: 'fadeIn 0.5s ease'
                }}>
                  Thank you for joining our Inner Circle. Welcome.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className={styles.newsletterForm}>
                  <input
                    type="email"
                    placeholder="Your email address"
                    required
                    className={styles.newsletterInput}
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                  />
                  <button type="submit" className={styles.newsletterSubmit}>
                    Subscribe
                  </button>
                </form>
              )}

              <p className={styles.newsletterTip}>No spam, ever. Unsubscribe at any time.</p>
            </div>
          </section>
        </>
      )}

      {/* 4. Render Category subpage view */}
      {view === 'category' && (
        <div className={styles.categoryViewContainer}>
          {(() => {
            const banner = categoryBanners[activeCategory] || categoryBanners['suits'];
            return (
              <section className={styles.categoryHero}>
                <div className={styles.categoryHeroContent}>
                  <div className={styles.categoryHeroBadge}>
                    COLLECTION EDIT
                  </div>
                  <h1 className={styles.categoryHeroHeading}>
                    {banner.subtitle}
                    <span className={styles.categoryHeroHeadingItalic}>
                      {banner.title}
                    </span>
                  </h1>
                  <p className={styles.categoryHeroDescription}>
                    {banner.description}
                  </p>
                  <button className={styles.btnPrimary} onClick={() => {
                    const grid = document.getElementById('category-products');
                    grid?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    Explore Collection
                  </button>
                </div>
                <div className={styles.categoryHeroImageContainer}>
                  <Image 
                    src={banner.image} 
                    alt={banner.title}
                    fill
                    className={styles.categoryHeroImage}
                    priority
                  />
                  <div className={styles.categoryHeroImageOverlay}></div>
                </div>
              </section>
            );
          })()}

          <div className={styles.breadcrumbs}>
            <a href="#" onClick={(e) => { e.preventDefault(); navigateToView('home'); }}>Home</a>
            <span className={styles.breadcrumbDivider}>/</span>
            <span>Collections</span>
            <span className={styles.breadcrumbDivider}>/</span>
            <span className={styles.breadcrumbActive}>
              {categories.find(c => c.id === activeCategory)?.name || 'Collection'}
            </span>
          </div>

          <section id="category-products" className={styles.section} style={{ paddingTop: '40px' }}>
            <div className={styles.categoryFilterBar}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`${styles.quickShopBtn} ${activeCategory === cat.id ? styles.quickShopBtnActive : ''}`}
                  onClick={() => {
                    if (cat.id === 'all') {
                      setActiveCategory('all');
                      navigateToView('home');
                    } else {
                      setActiveCategory(cat.id);
                    }
                  }}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            <div className={styles.productsGrid} style={{ marginTop: '40px' }}>
              {filteredProducts.map((product) => (
                <div key={product.id} className={styles.productCard} onClick={() => handleProductClick(product)}>
                  <div className={styles.productImageWrapper}>
                    <Image 
                      src={product.image} 
                      alt={product.name} 
                      fill
                      className={styles.productImage}
                    />
                    {product.badge && (
                      <span className={styles.productBadge}>{product.badge}</span>
                    )}
                    <button 
                      className={styles.productWishlistBtn}
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                      aria-label="Add to wishlist"
                    >
                      <svg width="14" height="14" fill={wishlist.includes(product.id) ? "var(--primary)" : "none"} stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </button>
                    <button 
                      className={styles.addBagHover}
                      onClick={(e) => { e.stopPropagation(); addToBag(product.id); }}
                    >
                      <span className={styles.addBagText}>Add to Bag</span>
                    </button>
                  </div>
                  <div className={styles.productInfo}>
                    <p className={styles.productCategory}>{product.category}</p>
                    <h4 className={styles.productTitle}>{product.name}</h4>
                    <p className={styles.productPrice}>{product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* 5. Render Product Detail page view */}
      {view === 'product-detail' && selectedProduct && (
        <div className={styles.productDetailViewContainer}>
          <div className={styles.breadcrumbs} style={{ padding: '24px 40px 0 40px' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); navigateToView('home'); }}>Home</a>
            <span className={styles.breadcrumbDivider}>/</span>
            <a href="#" onClick={(e) => { e.preventDefault(); navigateToView('category'); }}>Collections</a>
            <span className={styles.breadcrumbDivider}>/</span>
            <span className={styles.breadcrumbActive}>{selectedProduct.name}</span>
          </div>

          <div className={styles.productDetailContent}>
            <div className={styles.productDetailGallery}>
              <div className={styles.mainDetailImageWrapper}>
                <Image 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name}
                  fill
                  className={styles.mainDetailImage}
                  priority
                />
              </div>
              <div className={styles.thumbnailList}>
                <button className={`${styles.thumbnailBtn} ${styles.thumbnailActive}`}>
                  <Image src={selectedProduct.image} alt="" fill style={{ objectFit: 'cover' }} />
                </button>
                <button className={styles.thumbnailBtn}>
                  <Image src="/assets/5d977febba2763ad18f4d8a4a72993197abe53ac.png" alt="" fill style={{ objectFit: 'cover' }} />
                </button>
                <button className={styles.thumbnailBtn}>
                  <Image src="/assets/bfbf18493c6f15c8b582f56fad304f8de3f26c0f.png" alt="" fill style={{ objectFit: 'cover' }} />
                </button>
              </div>
            </div>

            <div className={styles.productDetailInfo}>
              <span className={styles.detailBrandName}>RIWAAYA THREADS · {selectedProduct.category.toUpperCase()}</span>
              <h1 className={styles.detailProductName}>{selectedProduct.name}</h1>
              
              <div className={styles.reviewsRow}>
                <div className={styles.starsContainer}>
                  {[1, 2, 3, 4].map(s => (
                    <span key={s} className={styles.starFilled}>★</span>
                  ))}
                  <span className={styles.starEmpty}>☆</span>
                </div>
                <span className={styles.reviewsCount}>4.0 (128 reviews)</span>
              </div>

              <div className={styles.detailProductPrice}>{selectedProduct.price}</div>

              <div className={styles.detailOptionSection}>
                <label className={styles.detailOptionLabel}>COLOUR — {selectedColor.toUpperCase()}</label>
                <div className={styles.colorSelectorList}>
                  {[
                    { name: 'Ivory', hex: '#fbf6ee' },
                    { name: 'Maroon', hex: '#6b1929' },
                    { name: 'Gold', hex: '#b8963e' },
                    { name: 'Navy', hex: '#1a2a3e' },
                    { name: 'Rose', hex: '#e8c9b2' }
                  ].map((color) => (
                    <button
                      key={color.name}
                      className={`${styles.colorCircle} ${selectedColor === color.name ? styles.colorCircleActive : ''}`}
                      style={{ backgroundColor: color.hex }}
                      onClick={() => setSelectedColor(color.name)}
                      title={color.name}
                      aria-label={`Select color ${color.name}`}
                    />
                  ))}
                </div>
              </div>

              <div className={styles.detailOptionSection}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <label className={styles.detailOptionLabel}>SIZE — {selectedSize}</label>
                  <button className={styles.sizeGuideLink}>Size Guide</button>
                </div>
                <div className={styles.sizeSelectorList}>
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                    <button
                      key={size}
                      className={`${styles.sizeBox} ${selectedSize === size ? styles.sizeBoxActive : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.purchaseActionRow}>
                <div className={styles.quantityCounter}>
                  <button 
                    onClick={() => setProductQuantity(prev => Math.max(1, prev - 1))}
                    className={styles.quantityBtn}
                  >
                    -
                  </button>
                  <span className={styles.quantityValue}>{productQuantity}</span>
                  <button 
                    onClick={() => setProductQuantity(prev => prev + 1)}
                    className={styles.quantityBtn}
                  >
                    +
                  </button>
                </div>

                <button 
                  className={styles.btnPrimary} 
                  style={{ flexGrow: 1, padding: '16px 24px', display: 'flex', justifyContent: 'center' }}
                  onClick={() => {
                    for(let i=0; i<productQuantity; i++) {
                      addToBag(selectedProduct.id);
                    }
                  }}
                >
                  ADD TO BAG
                </button>
              </div>

              <div className={styles.assurancesRow}>
                <span>✦ Free Shipping</span>
                <span>✦ Easy Returns</span>
                <span>✦ Secure Payment</span>
              </div>

              <div className={styles.accordionSection}>
                <div className={styles.accordionItem}>
                  <button 
                    className={styles.accordionHeader} 
                    onClick={() => setActiveDetailTab(activeDetailTab === 'details' ? '' as any : 'details')}
                  >
                    <span>DETAILS</span>
                    <span>{activeDetailTab === 'details' ? '−' : '+'}</span>
                  </button>
                  <div className={`${styles.accordionContent} ${activeDetailTab === 'details' ? styles.accordionOpen : ''}`}>
                    <p>
                      Plush {selectedProduct.name.toLowerCase()} with gold piping and tassel detail. This exquisite piece is crafted by master artisans using traditional techniques passed down through generations. Each garment undergoes rigorous quality checks before it reaches your hands.
                    </p>
                  </div>
                </div>

                <div className={styles.accordionItem}>
                  <button 
                    className={styles.accordionHeader} 
                    onClick={() => setActiveDetailTab(activeDetailTab === 'materials' ? '' as any : 'materials')}
                  >
                    <span>MATERIALS</span>
                    <span>{activeDetailTab === 'materials' ? '−' : '+'}</span>
                  </button>
                  <div className={`${styles.accordionContent} ${activeDetailTab === 'materials' ? styles.accordionOpen : ''}`}>
                    <p>
                      Crafted from pure organic premium threads, featuring high-quality handloom weave, refined zari embroidery, and durable cotton-silk backing for premium comfort and structural drape.
                    </p>
                  </div>
                </div>

                <div className={styles.accordionItem}>
                  <button 
                    className={styles.accordionHeader} 
                    onClick={() => setActiveDetailTab(activeDetailTab === 'shipping' ? '' as any : 'shipping')}
                  >
                    <span>SHIPPING & RETURNS</span>
                    <span>{activeDetailTab === 'shipping' ? '−' : '+'}</span>
                  </button>
                  <div className={`${styles.accordionContent} ${activeDetailTab === 'shipping' ? styles.accordionOpen : ''}`}>
                    <p>
                      We offer free shipping on all orders above PKR 5,000. For orders under PKR 5,000, a standard delivery charge of PKR 250 applies. Deliveries take 3-5 business days across Pakistan. We accept hassle-free returns and exchanges within 7 days of delivery.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Render Login page view */}
      {view === 'login' && (
        <div className={styles.loginViewContainer}>
          <div className={styles.loginOverlayBackground}>
            <Image 
              src="/assets/2131d28031801befa44bd105ec5914c27b763b64.png"
              alt=""
              fill
              style={{ objectFit: 'cover', filter: 'blur(15px) brightness(0.6)' }}
            />
          </div>
          <div className={styles.loginCard}>
            <div className={styles.loginLogoWrapper}>
              <Image 
                src="/assets/2d443a0997545c3de1e9383c78565921faa8a0a8.png" 
                alt="Riwaaya Logo" 
                width={140} 
                height={50} 
                className={styles.loginLogo}
              />
            </div>
            <h1 className={styles.loginTitle}>Welcome Back</h1>
            <p className={styles.loginSubtitle}>
              Continue your journey with timeless fashion, handcrafted luxury & elegant gifting.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); alert('Verification code sent!'); }} className={styles.loginForm}>
              <div className={styles.phoneInputContainer}>
                <div className={styles.countryCodeSelector}>
                  <span>🇵🇰 +92</span>
                  <span style={{ fontSize: '0.6rem', marginLeft: '4px' }}>▼</span>
                </div>
                <input 
                  type="tel" 
                  placeholder="300 000 0000" 
                  required
                  pattern="[0-9]{10}"
                  className={styles.phoneInput} 
                />
              </div>

              <button type="submit" className={styles.loginSubmitBtn}>
                <span>CONTINUE</span>
                <span style={{ marginLeft: '8px' }}>➔</span>
              </button>
            </form>

            <div className={styles.loginDivider}>
              <span className={styles.dividerLine}></span>
              <span className={styles.dividerText}>OR</span>
              <span className={styles.dividerLine}></span>
            </div>

            <button className={styles.googleLoginBtn} onClick={() => alert('Signing in with Google...')}>
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '10px' }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.79-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <button className={styles.loginEmailBtn} onClick={() => alert('Email login coming soon!')}>
              Login with Email instead
            </button>
          </div>
        </div>
      )}

      {/* 7. Footer Section (rendered on Home & Category views) */}
      {(view === 'home' || view === 'category') && (
        <footer className={styles.footer}>
          <div className={styles.footerDivider}></div>
          <div className={styles.footerGrid}>
            
            <div className={styles.footerBrandColumn}>
              <Image 
                src="/assets/2d443a0997545c3de1e9383c78565921faa8a0a8.png" 
                alt="Riwaaya Logo" 
                width={110} 
                height={40} 
                className={styles.footerLogo}
                style={{ filter: 'brightness(0) invert(1)' }} // Invert to white logo for dark footer
              />
              <p className={styles.footerBio}>
                Pakistani Suits · Co-ord Sets · Ethnic Wear. Crafted with heritage, worn with pride.
              </p>
              <div className={styles.socialLinks}>
                <a href="#" className={styles.socialBtn} aria-label="Instagram">
                  <Image src="/assets/7c10c71364610cb0db8ddcc4cd844e5469483552.svg" alt="" width={14} height={14} className={styles.socialIcon} />
                </a>
                <a href="#" className={styles.socialBtn} aria-label="Pinterest">
                  <Image src="/assets/82c804253c7c7e6dcf81ecdc39f2954dd1b6adc3.svg" alt="" width={14} height={14} className={styles.socialIcon} />
                </a>
                <a href="#" className={styles.socialBtn} aria-label="Facebook">
                  <Image src="/assets/53b45d88dd6db26bbc4db4fd22ce945fc4900879.svg" alt="" width={14} height={14} className={styles.socialIcon} />
                </a>
              </div>
            </div>

            <div>
              <h4 className={styles.footerColTitle}>Collections</h4>
              <ul className={styles.footerLinks}>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveCategory('suits'); navigateToView('category'); }}>Pakistani Suits</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveCategory('coords'); navigateToView('category'); }}>Co-ord Sets</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveCategory('party'); navigateToView('category'); }}>Ethnic Wear</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigateToView('home'); setTimeout(() => document.getElementById('bridal')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Bridal Edit</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigateToView('home'); setTimeout(() => document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>New Season Arrivals</a></li>
              </ul>
            </div>

            <div>
              <h4 className={styles.footerColTitle}>Information</h4>
              <ul className={styles.footerLinks}>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigateToView('home'); setTimeout(() => document.getElementById('heritage')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Our Story</a></li>
                <li><a href="#">Artisan Program</a></li>
                <li><a href="#">Sustainability</a></li>
                <li><a href="#">Shipping & Returns</a></li>
                <li><a href="#">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className={styles.footerColTitle}>Get in touch</h4>
              <ul className={styles.contactInfo}>
                <li className={styles.contactItem}>
                  <span className={styles.contactLabel}>Address</span>
                  <span className={styles.contactValue}>12C, Lane 5, Bukhari Commercial, Phase VI, DHA, Karachi, Pakistan</span>
                </li>
                <li className={styles.contactItem}>
                  <span className={styles.contactLabel}>Phone</span>
                  <span className={styles.contactValue}>+92 21 3524 8831</span>
                </li>
                <li className={styles.contactItem}>
                  <span className={styles.contactLabel}>Email</span>
                  <span className={styles.contactValue}>info@riwaayathreads.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p className={styles.copyright}>© 2026 Riwaaya Threads. All Rights Reserved.</p>
            <div className={styles.footerLegalLinks}>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </footer>
      )}

      {/* 8. Bottom Navigation Bar for Mobile */}
      <nav className={styles.bottomNav}>
        <a href="#" onClick={(e) => { e.preventDefault(); navigateToView('home'); setTimeout(() => document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className={styles.bottomNavItem}>
          <div className={styles.bottomNavIcon}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <span>Shop</span>
        </a>
        
        <a href="#" onClick={(e) => { e.preventDefault(); navigateToView('home'); setTimeout(() => document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className={styles.bottomNavItem}>
          <div className={styles.bottomNavIcon}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </div>
          <span>Collections</span>
        </a>

        <a href="#" onClick={(e) => { e.preventDefault(); navigateToView('home'); setTimeout(() => document.getElementById('bridal')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className={styles.bottomNavItem}>
          <div className={styles.bottomNavIcon}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
            </svg>
          </div>
          <span>Bridal</span>
        </a>

        <a href="#" onClick={(e) => { e.preventDefault(); navigateToView('home'); setTimeout(() => document.getElementById('heritage')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className={styles.bottomNavItem}>
          <div className={styles.bottomNavIcon}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <span>Story</span>
        </a>

        <a href="#" onClick={(e) => { e.preventDefault(); navigateToView('login'); }} className={styles.bottomNavItem}>
          <div className={styles.bottomNavIcon}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <span>Profile</span>
        </a>
      </nav>
    </div>
  );
}
