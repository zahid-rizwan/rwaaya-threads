'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getProducts, fetchCart, addCartItem, Product } from '@/lib/api';
import styles from './page.module.css';

interface Testimonial {
  text: string;
  author: string;
  city: string;
}

const categoryBanners: Record<string, { title: string; subtitle: string; description: string; image: string }> = {
  all: {
    title: "Pakistani Suits",
    subtitle: "Discover timeless silhouettes",
    description: "Discover timeless silhouettes crafted with elegance, tradition, and contemporary luxury.",
    image: "/assets/2131d28031801befa44bd105ec5914c27b763b64.png"
  },
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

const defaultHomeProducts: Product[] = [
  { id: '1', name: "Gulzar Ivory Suit", category: "Pakistani Suit", price: "₹18,500", image: "/assets/1540aab590cd7d478ad01cdb1a615d469ef2a808.png", images: ["/assets/1540aab590cd7d478ad01cdb1a615d469ef2a808.png"], badge: "New", tag: "suits", description: "Intricately embroidered ivory lawn suit with pure silk dupatta." },
  { id: '2', name: "Amber Heritage Lawn", category: "Co-Ord Set", price: "₹14,200", image: "/assets/f5033b1a4ddb926f41bc87a1c3a2f99082eaa624.png", images: ["/assets/f5033b1a4ddb926f41bc87a1c3a2f99082eaa624.png"], badge: "Bestseller", tag: "coords", description: "2-piece curated lawn co-ord set with handcrafted threadwork." },
  { id: '3', name: "Rose Dust Gharara", category: "Party Wear", price: "₹24,500", image: "/assets/14b11c8de3394bd25477cfb02149a056c046d507.png", images: ["/assets/14b11c8de3394bd25477cfb02149a056c046d507.png"], badge: "Limited", tag: "party", description: "Bridal ready formal gharara set with tilla & sequin work." },
  { id: '4', name: "Shahi Heritage Hamper", category: "Gift Hamper", price: "₹12,500", image: "/assets/bfbf18493c6f15c8b582f56fad304f8de3f26c0f.png", images: ["/assets/bfbf18493c6f15c8b582f56fad304f8de3f26c0f.png"], badge: "Exclusive", tag: "hampers", description: "Luxury gift hamper including handcrafted shawl, perfume, and dried fruits box." }
];

export default function Home() {
  const router = useRouter();

  const [productsList, setProductsList] = useState<Product[]>(defaultHomeProducts);
  const [activeTestimonial, setActiveTestimonial] = useState<number>(0);
  const [cartCount, setCartCount] = useState<number>(0);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    getProducts().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setProductsList(data);
      }
    });
    fetchCart().then((c) => {
      if (c && c.items) setCartCount(c.items.length);
    });
  }, []);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);



  const testimonials: Testimonial[] = [
    { text: "The quality of the lawn and the intricate embroidery exceeded all my expectations. It feels like wearing a piece of art.", author: "Mariam K.", city: "Karachi" },
    { text: "Absolutely gorgeous fit. The fabric has a premium weight and the colors are even richer in person. A staple for my festive wardrobe.", author: "Sarah A.", city: "Lahore" },
    { text: "I wore the Rose Dust Gharara to a private editorial event and received non-stop compliments. Elegant craftsmanship at its best.", author: "Zainab M.", city: "Islamabad" }
  ];

  const circularCategories = [
    { id: 'suits', name: 'Pakistani Suits', image: '/assets/e7088a2366cb90adc3302932505be2bc610e9afe.png' },
    { id: 'coords', name: 'Co-Ord Sets', image: '/assets/8cd274c8adf8a9367c11b2f398e872089e3379a0.png' },
    { id: 'party', name: 'Party Wear', image: '/assets/13960744be005aa72595ea1e43c13afca8050ca4.png' },
    { id: 'hampers', name: 'Gift Hampers', image: '/assets/bfbf18493c6f15c8b582f56fad304f8de3f26c0f.png' }
  ];

  const categories = [
    { id: 'all', name: 'All Collection', emoji: '✨' },
    { id: 'suits', name: 'Pakistani Suits', emoji: '👗' },
    { id: 'coords', name: 'Co-Ord Sets', emoji: '✨' },
    { id: 'party', name: 'Party Wear', emoji: '🌙' },
    { id: 'hampers', name: 'Gift Hampers', emoji: '🎁' }
  ];

  const promiseList = [
    { title: "Premium Craftsmanship", desc: "Every piece crafted by master artisans" },
    { title: "Handpicked Designs", desc: "Curated with luxury in mind" },
    { title: "Easy Returns", desc: "Hassle-free 14-day returns" },
    { title: "Secure Payments", desc: "100% safe & encrypted checkout" },
    { title: "Fast Delivery", desc: "Delivered to your doorstep" },
    { title: "Trusted by Thousands", desc: "5,000+ happy customers" }
  ];

  const exploreCollections = [
    { title: "Co-Ord Sets", subtitle: "EXPLORE COLLECTION", image: "/assets/8cd274c8adf8a9367c11b2f398e872089e3379a0.png", tag: "coords" },
    { title: "Bridal Collection", subtitle: "EXPLORE COLLECTION", image: "/assets/13960744be005aa72595ea1e43c13afca8050ca4.png", tag: "party" },
    { title: "Gift Hampers", subtitle: "EXPLORE COLLECTION", image: "/assets/bfbf18493c6f15c8b582f56fad304f8de3f26c0f.png", tag: "hampers" }
  ];

  const heroSlides = [
    {
      tag: "suits",
      title: "Pakistani Suits",
      subtitle: "Discover timeless silhouettes",
      description: "Discover timeless silhouettes crafted with elegance, tradition, and contemporary luxury.",
      image: "/assets/e7088a2366cb90adc3302932505be2bc610e9afe.png"
    },
    {
      tag: "coords",
      title: "Co-Ord Sets",
      subtitle: "Curated Pairings",
      description: "Effortlessly curated pairings for the modern South Asian woman.",
      image: "/assets/8cd274c8adf8a9367c11b2f398e872089e3379a0.png"
    },
    {
      tag: "party",
      title: "Party Wear",
      subtitle: "Heritage & Festive",
      description: "Evening glamour for every occasion — from intimate dinners to grand celebrations.",
      image: "/assets/13960744be005aa72595ea1e43c13afca8050ca4.png"
    },
    {
      tag: "hampers",
      title: "Gift Hampers",
      subtitle: "Exclusive Gifting",
      description: "Luxuriously curated gifts for the most cherished and memorable moments.",
      image: "/assets/bfbf18493c6f15c8b582f56fad304f8de3f26c0f.png"
    }
  ];

  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, [heroSlides.length]);

  const nextHeroSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
  };

  const prevHeroSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const currentHeroSlide = heroSlides[currentSlideIndex];

  const addToBag = (productId: string | number) => {
    addCartItem(String(productId), 'M', 1);
    setCartCount(prev => prev + 1);
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

  const toggleWishlist = (productId: string | number) => {
    const idStr = String(productId);
    if (wishlist.includes(idStr)) {
      setWishlist(prev => prev.filter(id => id !== idStr));
    } else {
      setWishlist(prev => [...prev, idStr]);
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

  return (
    <div className={styles.pageContainer}>
      
      {/* 1. Announcement Bar */}
      <div className={styles.announcementBar}>
        <div className={styles.announcementText}>
          ✦ FREE SHIPPING ON ORDERS ABOVE ₹5,000 · NEW ARRIVALS: THE GULZAR EDIT IS HERE ✦ FREE SHIPPING ON ORDERS ABOVE ₹5,000 · NEW ARRIVALS: THE GULZAR EDIT IS HERE
        </div>
      </div>

      {/* 2. Top Header Navigation */}
      <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
        <div className={styles.logoContainer}>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/'); }}>
            <Image 
              src="/assets/logo.svg" 
              alt="Riwaaya Threads Logo" 
              width={180} 
              height={25} 
              className={styles.logoImage}
              priority
            />
          </a>
        </div>

        <div className={styles.navRight} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className={styles.iconButton} aria-label="Search">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>

          <button 
            className={styles.iconButton} 
            aria-label="Shopping Bag"
            onClick={() => router.push('/cart')}
            style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 21h12a2 2 0 0 0 2-2V8H4v11a2 2 0 0 0 2 2z"></path>
              <path d="M16 8V6a4 4 0 0 0-8 0v2"></path>
            </svg>
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-6px',
              backgroundColor: '#6b1929',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: 700,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid #fff'
            }}>
              {cartCount}
            </span>
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
          <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); router.push('/collections/suits'); }}>Explore Collections</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); router.push('/collections/all'); }}>New Season Arrivals</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); document.getElementById('heritage-section')?.scrollIntoView({ behavior: 'smooth' }); }}>Our Heritage</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); router.push('/collections/party'); }}>The Bridal Edit</a>
        </div>
      )}

      {/* Category Cards Carousel (Commented out for now) */}
      {/* 
      <div className={styles.circleCarousel}>
        {circularCategories.map((cat) => {
          return (
            <button 
              type="button"
              key={cat.id} 
              className={styles.circleItem}
              onClick={() => router.push(`/collections/${cat.id}`)}
              aria-label={`Select ${cat.name}`}
            >
              <div className={styles.circleImageWrapper}>
                <Image src={cat.image} alt={cat.name} fill style={{ objectFit: 'cover' }} />
                <div className={styles.cardOverlay} />
                <div className={styles.cardContent}>
                  <span className={styles.circleLabel}>{cat.name}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      */}

      {/* Collection Hero Banner Carousel */}
      <section 
        id="collection-banner" 
        className={styles.categoryHero}
        onClick={() => router.push(`/collections/${currentHeroSlide.tag}`)}
        style={{ cursor: 'pointer' }}
      >
        <div className={styles.categoryHeroContent}>
          <div className={styles.categoryHeroBadge}>
            COLLECTION EDIT
          </div>
          <h1 className={styles.categoryHeroHeading}>
            {currentHeroSlide.subtitle}
            <span className={styles.categoryHeroHeadingItalic}>
              {currentHeroSlide.title}
            </span>
          </h1>
          <p className={styles.categoryHeroDescription}>
            {currentHeroSlide.description}
          </p>
          <button 
            className={styles.btnPrimary} 
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/collections/${currentHeroSlide.tag}`);
            }}
          >
            EXPLORE COLLECTION ➔
          </button>
        </div>
        <div className={styles.categoryHeroImageContainer}>
          <Image 
            src={currentHeroSlide.image} 
            alt={currentHeroSlide.title}
            fill
            className={styles.categoryHeroImage}
            priority
          />
          <div className={styles.categoryHeroImageOverlay}></div>
        </div>

        {/* Carousel Indicators & Controls */}
        <div className={styles.heroCarouselControls} onClick={(e) => e.stopPropagation()}>
          <button 
            type="button" 
            className={styles.heroArrowBtn} 
            onClick={prevHeroSlide}
            aria-label="Previous Slide"
          >
            ❮
          </button>
          
          <div className={styles.heroDotsContainer}>
            {heroSlides.map((slide, idx) => (
              <button
                key={slide.tag}
                type="button"
                className={`${styles.heroDot} ${idx === currentSlideIndex ? styles.heroDotActive : ''}`}
                onClick={() => setCurrentSlideIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button 
            type="button" 
            className={styles.heroArrowBtn} 
            onClick={nextHeroSlide}
            aria-label="Next Slide"
          >
            ❯
          </button>
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className={styles.breadcrumbs}>
        <span style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>Home</span>
        <span className={styles.breadcrumbDivider}>/</span>
        <span>Curated Collections</span>
      </div>

      {/* Category Description */}
      <div className={styles.categoryDescContainer}>
        <p className={styles.categoryDescText}>
          Explore our curated mix of luxury Pakistani Suits, Co-Ord Sets, Festive Party Wear, and Royal Gift Hampers — crafted with timeless heritage and contemporary elegance.
        </p>
      </div>

      {/* Products Grid Section (Mixed Products on Home) */}
      <section id="products-section" className={styles.section} style={{ paddingTop: '20px' }}>
        <div className={styles.productsGrid}>
          {productsList.map((product) => (
            <div key={product.id} className={styles.productCard} onClick={() => router.push(`/product/${product.id}`)}>
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
                  <svg width="14" height="14" fill={wishlist.includes(String(product.id)) ? "var(--primary)" : "none"} stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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

      {/* Exclusive New Festive Collection Banner */}
      <section id="bridal-section" className={styles.festiveBannerContainer}>
        <div className={styles.festiveCard}>
          <p className={styles.festiveSubtitle}>EXCLUSIVE</p>
          <h2 className={styles.festiveTitle}>
            <span className={styles.festiveSparkle}>✨</span>
            New Festive Collection
          </h2>
          <p className={styles.festiveDescription}>
            Limited edition embroidered pieces — crafted for the discerning few.
          </p>
          <button className={styles.festiveBtnGold} onClick={() => router.push('/collections/party')}>
            SHOP NOW ➔
          </button>
        </div>
      </section>

      {/* OUR PROMISE / Why RIWAAYA THREADS Section */}
      <section className={styles.promiseSection}>
        <div className={styles.promiseHeader}>
          <p className={styles.promiseSubtitle}>OUR PROMISE</p>
          <h2 className={styles.promiseTitle}>Why RIWAAYA THREADS</h2>
          <div className={styles.promiseDivider}>
            <svg width="180" height="16" viewBox="0 0 180 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="8" x2="72" y2="8" stroke="#B8963E" strokeWidth="0.8" opacity="0.6" />
              <path d="M84 8C82 4 77 5 77 8C77 11 82 12 84 8Z" fill="#B8963E" />
              <path d="M96 8C98 4 103 5 103 8C103 11 98 12 96 8Z" fill="#B8963E" />
              <circle cx="90" cy="8" r="2" fill="#B8963E" />
              <line x1="108" y1="8" x2="180" y2="8" stroke="#B8963E" strokeWidth="0.8" opacity="0.6" />
            </svg>
          </div>
        </div>

        <div className={styles.promiseGrid}>
          {promiseList.map((item, idx) => (
            <div key={idx} className={styles.promiseItem}>
              <div className={styles.promiseIconBox}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#B8963E">
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
              </div>
              <h3 className={styles.promiseItemTitle}>{item.title}</h3>
              <p className={styles.promiseItemDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.section} style={{ paddingTop: '40px' }}>
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

      {/* Explore More / You May Also Like Section */}
      <section id="heritage-section" className={styles.section} style={{ backgroundColor: 'var(--background)' }}>
        <div className={styles.exploreHeader}>
          <p className={styles.exploreSubtitle}>EXPLORE MORE</p>
          <h2 className={styles.exploreTitle}>You May Also Like</h2>
        </div>
        
        <div className={styles.collectionsGrid}>
          {exploreCollections.map((col, idx) => (
            <div key={idx} className={styles.collectionCard} onClick={() => router.push(`/collections/${col.tag}`)}>
              <Image src={col.image} alt={col.title} fill className={styles.collectionCardImage} />
              <div className={styles.collectionCardOverlay}>
                <div className={styles.collectionCardContentLeft}>
                  <p className={styles.collectionCardBadge}>{col.subtitle}</p>
                  <h3 className={styles.collectionCardTitle}>{col.title}</h3>
                </div>
                <div className={styles.collectionCardArrow}>➔</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
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
            Be the first to discover new collections, exclusiveDrops, and private sale events. Curated for the discerning few.
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

      {/* Footer Section */}
      <footer className={styles.footer}>
        <div className={styles.footerDivider}></div>
        <div className={styles.footerGrid}>
          
          <div className={styles.footerBrandColumn}>
            <Image 
              src="/assets/logo.svg" 
              alt="Riwaaya Threads Logo" 
              width={160} 
              height={22} 
              className={styles.footerLogo}
              style={{ filter: 'brightness(0) invert(1)' }} 
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
              <li><a href="#" onClick={(e) => { e.preventDefault(); router.push('/collections/suits'); }}>Pakistani Suits</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); router.push('/collections/coords'); }}>Co-ord Sets</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); router.push('/collections/party'); }}>Ethnic Wear</a></li>
              <li><a href="#">Bridal Edit</a></li>
              <li><a href="#">New Season Arrivals</a></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.footerColTitle}>Information</h4>
            <ul className={styles.footerLinks}>
              <li><a href="#">Our Story</a></li>
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
                <span className={styles.contactLabel}>Primary Address</span>
                <span className={styles.contactValue}>36/1/H /2 Bright Street, Kolkata - 700017</span>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactLabel}>Secondary Address</span>
                <span className={styles.contactValue}>40 Foota Road, Shaheen Bagh, Delhi - 110025</span>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactLabel}>Phone</span>
                <span className={styles.contactValue}>+9172775060, +917250846963, +919163037924</span>
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

      {/* Bottom Navigation Bar (Matching Image 2) */}
      <nav className={styles.bottomNav}>
        <button 
          type="button"
          onClick={() => router.push('/')} 
          className={`${styles.bottomNavItem} ${styles.bottomNavItemActive}`}
        >
          <div className={styles.bottomNavActiveLine} />
          <div className={styles.bottomNavIcon}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M3 9.5L12 3l9 6.5V20a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 13 20v-5h-2v5A1.5 1.5 0 0 1 9.5 21.5h-5A1.5 1.5 0 0 1 3 20V9.5z"></path>
            </svg>
          </div>
          <span>HOME</span>
        </button>
        
        <button 
          type="button"
          onClick={() => router.push('/collections/suits')} 
          className={styles.bottomNavItem}
        >
          <div className={styles.bottomNavIcon}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M3 9l1-5h16l1 5"></path>
              <path d="M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9"></path>
              <path d="M9 21V12h6v9"></path>
            </svg>
          </div>
          <span>SHOP</span>
        </button>

        <button 
          type="button"
          onClick={() => router.push('/collections/all')} 
          className={styles.bottomNavItem}
        >
          <div className={styles.bottomNavIcon}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            {wishlist.length > 0 && <span className={styles.bottomNavBadge}>{wishlist.length}</span>}
          </div>
          <span>WISHLIST</span>
        </button>

        <button 
          type="button"
          onClick={() => router.push('/cart')} 
          className={styles.bottomNavItem}
        >
          <div className={styles.bottomNavIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 21h12a2 2 0 0 0 2-2V8H4v11a2 2 0 0 0 2 2z"></path>
              <path d="M16 8V6a4 4 0 0 0-8 0v2"></path>
            </svg>
            {cartCount > 0 && <span className={styles.bottomNavBadge}>{cartCount}</span>}
          </div>
          <span>CART</span>
        </button>

        <button 
          type="button"
          onClick={() => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('riwaaya_token') : null;
            if (token) {
              router.push('/profile');
            } else {
              router.push('/login');
            }
          }} 
          className={styles.bottomNavItem}
        >
          <div className={styles.bottomNavIcon}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <span>PROFILE</span>
        </button>
      </nav>
    </div>
  );
}
