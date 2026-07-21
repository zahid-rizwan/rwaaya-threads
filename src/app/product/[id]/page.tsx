'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import styles from '@/app/page.module.css';

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
  badge?: string;
  tag: string;
}

interface Testimonial {
  text: string;
  author: string;
  city: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const productId = parseInt(params.id as string) || 9; // Default to Velvet Evening Suit (9) if none
  
  const [selectedColor, setSelectedColor] = useState<string>('Ivory');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [productQuantity, setProductQuantity] = useState<number>(1);
  const [activeDetailTab, setActiveDetailTab] = useState<'details' | 'materials' | 'shipping'>('details');

  const [activeTestimonial, setActiveTestimonial] = useState<number>(0);
  const [cartCount, setCartCount] = useState<number>(0);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

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

  const products: Product[] = [
    { id: 1, name: "Gulzar Ivory Suit", category: "Pakistani Suit", price: "PKR 18,500", image: "/assets/1540aab590cd7d478ad01cdb1a615d469ef2a808.png", badge: "New", tag: "suits" },
    { id: 2, name: "Amber Heritage Lawn", category: "Co-ord Set", price: "PKR 14,200", image: "/assets/f5033b1a4ddb926f41bc87a1c3a2f99082eaa624.png", badge: "Bestseller", tag: "coords" },
    { id: 3, name: "Rose Dust Gharara", category: "Bridal Ready", price: "PKR 24,500", image: "/assets/14b11c8de3394bd25477cfb02149a056c046d507.png", badge: "Limited", tag: "party" },
    { id: 4, name: "Chestnut Formal Set", category: "Ethnic Wear", price: "PKR 9,800", image: "/assets/56d6e1294f3009f3c4a559fbd7d8cef93accbb88.png", tag: "party" },
    { id: 5, name: "Emerald Elegance", category: "Pakistani Suit", price: "PKR 16,500", image: "/assets/6c39f865e80859a62255826c54bd32b849dd3ca2.png", badge: "New", tag: "suits" },
    { id: 6, name: "Ruby Velvet Edit", category: "Party Wear", price: "PKR 22,000", image: "/assets/70b5f877ef1ef7414a1384b3406d6cd1f8083de7.png", badge: "Bestseller", tag: "party" },
    { id: 7, name: "Sapphire Silk Suit", category: "Pakistani Suit", price: "PKR 19,500", image: "/assets/f1518341f4e01d47c3cac265752092154acdaa3b.png", tag: "suits" },
    { id: 8, name: "Forest Green Set", category: "Co-ord Set", price: "PKR 15,000", image: "/assets/5d977febba2763ad18f4d8a4a72993197abe53ac.png", tag: "coords" },
    { id: 9, name: "Velvet Evening Suit", category: "Party Wear", price: "PKR 28,000", image: "/assets/70b5f877ef1ef7414a1384b3406d6cd1f8083de7.png", badge: "Bestseller", tag: "party" },
    { id: 10, name: "Shahi Heritage Hamper", category: "Gift Hamper", price: "PKR 12,500", image: "/assets/bfbf18493c6f15c8b582f56fad304f8de3f26c0f.png", badge: "Exclusive", tag: "hampers" },
    { id: 11, name: "Darbar Premium Gift Box", category: "Gift Hamper", price: "PKR 8,500", image: "/assets/5d977febba2763ad18f4d8a4a72993197abe53ac.png", badge: "New", tag: "hampers" },
    { id: 12, name: "Midnight Zari Lehenga", category: "Silk Suite", price: "PKR 38,500", image: "/assets/bfbf18493c6f15c8b582f56fad304f8de3f26c0f.png", badge: "Limited", tag: "party" },
    { id: 13, name: "Crimson Party Suit", category: "Organza Suit", price: "PKR 22,000", image: "/assets/6c39f865e80859a62255826c54bd32b849dd3ca2.png", badge: "New", tag: "party" },
    { id: 14, name: "Gold Organza Party Set", category: "Organza Suit", price: "PKR 26,500", image: "/assets/f5033b1a4ddb926f41bc87a1c3a2f99082eaa624.png", badge: "Limited", tag: "party" }
  ];

  const testimonials: Testimonial[] = [
    { text: "The quality of the lawn and the intricate embroidery exceeded all my expectations. It feels like wearing a piece of art.", author: "Mariam K.", city: "Karachi" },
    { text: "Absolutely gorgeous fit. The fabric has a premium weight and the colors are even richer in person. A staple for my festive wardrobe.", author: "Sarah A.", city: "Lahore" },
    { text: "I wore the Rose Dust Gharara to a private editorial event and received non-stop compliments. Elegant craftsmanship at its best.", author: "Zainab M.", city: "Islamabad" }
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

  const selectedProduct = products.find(p => p.id === productId) || products[8];

  const addToBag = (productId: number) => {
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

  // Filter 4 related products for "You May Also Like"
  const relatedProducts = products
    .filter(p => p.id !== selectedProduct.id && (p.tag === selectedProduct.tag || p.badge === 'Limited'))
    .slice(0, 4);

  return (
    <div className={styles.pageContainer}>
      
      {/* 1. Announcement Bar */}
      <div className={styles.announcementBar}>
        <div className={styles.announcementText}>
          ✦ FREE SHIPPING ON ORDERS ABOVE PKR 5,000 · NEW ARRIVALS: THE GULZAR EDIT IS HERE ✦ FREE SHIPPING ON ORDERS ABOVE PKR 5,000 · NEW ARRIVALS: THE GULZAR EDIT IS HERE
        </div>
      </div>

      {/* 2. Top Header Navigation */}
      <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
        <div className={styles.logoContainer}>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/'); }}>
            <Image src="/assets/logo.svg" alt="Riwaaya Threads Logo" width={180} height={25} className={styles.logoImage} priority />
          </a>
        </div>

        <div className={styles.navRight}>
          <button className={styles.iconButton} aria-label="Search">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className={styles.breadcrumbs} style={{ padding: '24px 40px 0 40px' }}>
        <a href="#" onClick={(e) => { e.preventDefault(); router.push('/'); }}>Home</a>
        <span className={styles.breadcrumbDivider}>/</span>
        <a href="#" onClick={(e) => { e.preventDefault(); router.push('/collections/suits'); }}>Collections</a>
        <span className={styles.breadcrumbDivider}>/</span>
        <span className={styles.breadcrumbActive}>{selectedProduct.name}</span>
      </div>

      {/* Main product detail content block */}
      <div className={styles.productDetailContent}>
        <div className={styles.productDetailGallery}>
          <div className={styles.mainDetailImageWrapper}>
            <Image src={selectedProduct.image} alt={selectedProduct.name} fill className={styles.mainDetailImage} priority />
          </div>
          <div className={styles.thumbnailList}>
            <button className={`${styles.thumbnailBtn} ${styles.thumbnailActive}`}>
              <Image src={selectedProduct.image} alt="" fill style={{ objectFit: 'cover' }} />
            </button>
            <button className={styles.thumbnailBtn}>
              <Image src="/assets/bfbf18493c6f15c8b582f56fad304f8de3f26c0f.png" alt="" fill style={{ objectFit: 'cover' }} />
            </button>
            <button className={styles.thumbnailBtn}>
              <Image src="/assets/e7088a2366cb90adc3302932505be2bc610e9afe.png" alt="" fill style={{ objectFit: 'cover' }} />
            </button>
            <button className={styles.thumbnailBtn}>
              <Image src="/assets/1540aab590cd7d478ad01cdb1a615d469ef2a808.png" alt="" fill style={{ objectFit: 'cover' }} />
            </button>
          </div>
        </div>

        <div className={styles.productDetailInfo}>
          <span className={styles.detailBrandName}>RIWAAYA THREADS · {selectedProduct.category.toUpperCase()}</span>
          <h1 className={styles.detailProductName}>{selectedProduct.name}</h1>
          
          <div className={styles.reviewsRow}>
            <div className={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map(s => (
                <span key={s} className={styles.starFilled}>★</span>
              ))}
            </div>
            <span className={styles.reviewsCount}>(128 reviews)</span>
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
              <button onClick={() => setProductQuantity(prev => Math.max(1, prev - 1))} className={styles.quantityBtn}>-</button>
              <span className={styles.quantityValue}>{productQuantity}</span>
              <button onClick={() => setProductQuantity(prev => prev + 1)} className={styles.quantityBtn}>+</button>
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

          {/* Tabs Bar (Figma ID: 41:5700) */}
          <div className={styles.detailTabsBar}>
            <button 
              className={`${styles.detailTabBtn} ${activeDetailTab === 'details' ? styles.detailTabBtnActive : ''}`}
              onClick={() => setActiveDetailTab('details')}
            >
              DETAILS
            </button>
            <button 
              className={`${styles.detailTabBtn} ${activeDetailTab === 'materials' ? styles.detailTabBtnActive : ''}`}
              onClick={() => setActiveDetailTab('materials')}
            >
              MATERIALS
            </button>
            <button 
              className={`${styles.detailTabBtn} ${activeDetailTab === 'shipping' ? styles.detailTabBtnActive : ''}`}
              onClick={() => setActiveDetailTab('shipping')}
            >
              SHIPPING & RETURNS
            </button>
          </div>

          <div className={styles.detailTabContent}>
            {activeDetailTab === 'details' && (
              <p>Plush velvet with gold piping and tassel detail. This exquisite piece is crafted by master artisans using traditional techniques passed down through generations. Each set undergoes rigorous quality checks before it reaches your hands.</p>
            )}
            {activeDetailTab === 'materials' && (
              <p>Pure handloom organic threads, 100% premium silk, cotton-velvet fabric base, and natural dye embellishments.</p>
            )}
            {activeDetailTab === 'shipping' && (
              <p>Free delivery on orders over PKR 5,000. 7-day hassle-free return window and quick exchanges.</p>
            )}
          </div>
        </div>

        {/* You May Also Like Section (Figma ID: 41:6758) */}
        <div className={styles.relatedProductsSection}>
          <div className={styles.relatedHeader}>
            <h2 className={styles.relatedTitle}>You May Also Like</h2>
            <button className={styles.viewAllLink} onClick={() => router.push('/collections/all')}>View All</button>
          </div>
          <div className={styles.relatedGrid}>
            {relatedProducts.map((product) => (
              <div key={product.id} className={styles.productCard} onClick={() => router.push(`/product/${product.id}`)}>
                <div className={styles.productImageWrapper}>
                  <Image src={product.image} alt={product.name} fill className={styles.productImage} />
                  {product.badge && <span className={styles.productBadge}>{product.badge}</span>}
                </div>
                <div className={styles.productInfo}>
                  <p className={styles.productCategory}>{product.category}</p>
                  <h4 className={styles.productTitle}>{product.name}</h4>
                  <p className={styles.productPrice}>{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
          <p className={styles.testimonialText}>{testimonials[activeTestimonial].text}</p>
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
            <button key={index} className={`${styles.dot} ${activeTestimonial === index ? styles.dotActive : ''}`} onClick={() => setActiveTestimonial(index)}></button>
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
          <Image src="/assets/55c0c32c9f774f2a29a8d721722af55dd46e4f18.svg" alt="Newsletter emblem" width={80} height={40} className={styles.newsletterIcon} />
          <p className={styles.sectionSubtitle} style={{ marginBottom: 8 }}>Exclusive Access</p>
          <h2 className={styles.sectionTitle}>Join the Inner Circle</h2>
          <p className={styles.newsletterDesc}>Be the first to discover new collections, exclusive Drops, and private sale events.</p>
          {subscribed ? (
            <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontFamily: 'var(--font-serif)', fontSize: '1.2rem', padding: '12px' }}>
              Thank you for joining our Inner Circle. Welcome.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className={styles.newsletterForm}>
              <input type="email" placeholder="Your email address" required className={styles.newsletterInput} value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
              <button type="submit" className={styles.newsletterSubmit}>Subscribe</button>
            </form>
          )}
          <p className={styles.newsletterTip}>No spam, ever. Unsubscribe at any time.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerDivider}></div>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrandColumn}>
            <Image src="/assets/2d443a0997545c3de1e9383c78565921faa8a0a8.png" alt="Riwaaya Logo" width={110} height={40} className={styles.footerLogo} style={{ filter: 'brightness(0) invert(1)' }} />
            <p className={styles.footerBio}>Pakistani Suits · Co-ord Sets · Ethnic Wear. Crafted with heritage, worn with pride.</p>
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
              <li className={styles.contactItem}><span className={styles.contactLabel}>Address</span><span className={styles.contactValue}>12C, Lane 5, DHA, Karachi, Pakistan</span></li>
              <li className={styles.contactItem}><span className={styles.contactLabel}>Phone</span><span className={styles.contactValue}>+92 21 3524 8831</span></li>
              <li className={styles.contactItem}><span className={styles.contactLabel}>Email</span><span className={styles.contactValue}>info@riwaayathreads.com</span></li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>© 2026 Riwaaya Threads. All Rights Reserved.</p>
          <div className={styles.footerLegalLinks}><a href="#">Privacy Policy</a><a href="#">Terms of Service</a></div>
        </div>
      </footer>

      {/* Bottom Navigation Bar (Matching Image 2) */}
      <nav className={styles.bottomNav}>
        <button 
          type="button"
          onClick={() => router.push('/')} 
          className={styles.bottomNavItem}
        >
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
          onClick={() => router.push('/collections/suits')} 
          className={styles.bottomNavItem}
        >
          <div className={styles.bottomNavIcon}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {cartCount > 0 && <span className={styles.bottomNavBadge}>{cartCount}</span>}
          </div>
          <span>CART</span>
        </button>

        <button 
          type="button"
          onClick={() => router.push('/login')} 
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
