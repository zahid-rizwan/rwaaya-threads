'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import styles from '@/app/page.module.css';

import { getProductById, getProducts, fetchCart, addCartItem, Product } from '@/lib/api';

interface Testimonial {
  text: string;
  author: string;
  city: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const rawId = (params.id as string) || '1';
  
  const [loading, setLoading] = useState<boolean>(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>('Ivory');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [productQuantity, setProductQuantity] = useState<number>(1);
  const [activeDetailTab, setActiveDetailTab] = useState<'details' | 'materials' | 'shipping'>('details');

  const [cartCount, setCartCount] = useState<number>(0);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [activeTestimonial, setActiveTestimonial] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    setProduct(null);
    setSelectedImageIndex(0);

    getProductById(rawId).then(data => {
      if (data) {
        setProduct(data);
        if (data.colors && data.colors.length > 0) {
          const avail = data.colors.find(c => c.inStock !== false);
          if (avail) setSelectedColor(avail.name);
        }
      }
      setLoading(false);
    }).catch(() => setLoading(false));

    getProducts().then(list => setRelatedProducts(list.slice(0, 4)));
    fetchCart().then(c => {
      if (c && c.items) setCartCount(c.items.length);
    });
  }, [rawId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(interval);
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

  const addToBag = (productId: string | number) => {
    addCartItem(String(productId), selectedSize, productQuantity, selectedColor);
    setCartCount(prev => prev + productQuantity);
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

  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  if (loading) {
    return (
      <div className={styles.pageContainer} style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--accent)' }}>Loading Atelier Details...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.pageContainer} style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '40px 20px' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--primary)' }}>Product Not Found</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>The requested product listing could not be retrieved from the catalog.</p>
        <button className={styles.btnGold} onClick={() => router.push('/')} style={{ marginTop: '12px' }}>
          Return to Atelier Storefront
        </button>
      </div>
    );
  }

  const selectedProduct = product;

  const productImages = (selectedProduct.images && selectedProduct.images.length > 0)
    ? selectedProduct.images
    : [selectedProduct.image];

  const currentMainImage = productImages[selectedImageIndex] || productImages[0] || selectedProduct.image;

  const allSizesList = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const getSizeStatus = (sizeName: string) => {
    if (!selectedProduct.variants || selectedProduct.variants.length === 0) {
      return { isAvailable: true, isOutOfStock: false };
    }
    const match = selectedProduct.variants.find(
      v => v.size?.toUpperCase() === sizeName.toUpperCase()
    );
    if (!match) {
      return { isAvailable: false, isOutOfStock: true };
    }
    if (match.stock <= 0) {
      return { isAvailable: true, isOutOfStock: true };
    }
    return { isAvailable: true, isOutOfStock: false };
  };

  const isCurrentSizeOutOfStock = getSizeStatus(selectedSize).isOutOfStock;

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
            <Image src="/assets/logo.svg" alt="Riwaaya Threads Logo" width={180} height={25} className={styles.logoImage} priority />
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
            <Image src={currentMainImage} alt={selectedProduct.name} fill className={styles.mainDetailImage} priority />
          </div>
          <div className={styles.thumbnailList}>
            {productImages.map((imgUrl, idx) => (
              <button 
                key={idx} 
                className={`${styles.thumbnailBtn} ${selectedImageIndex === idx ? styles.thumbnailActive : ''}`}
                onClick={() => setSelectedImageIndex(idx)}
              >
                <Image src={imgUrl} alt={`${selectedProduct.name} view ${idx + 1}`} fill style={{ objectFit: 'cover' }} />
              </button>
            ))}
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

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap', margin: '16px 0 20px 0' }}>
            <span className={styles.detailProductPrice} style={{ margin: 0 }}>{selectedProduct.price}</span>
            {selectedProduct.originalPrice && (
              <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '1.25rem', fontFamily: 'var(--font-serif)' }}>
                {selectedProduct.originalPrice}
              </span>
            )}
            {Boolean(selectedProduct.discountPercent) && (
              <span style={{ backgroundColor: 'var(--accent, #b8963e)', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', letterSpacing: '0.05em' }}>
                {selectedProduct.discountPercent}% OFF
              </span>
            )}
          </div>

          {selectedProduct.colors && selectedProduct.colors.filter(c => c.inStock !== false).length > 0 && (
            <div className={styles.detailOptionSection}>
              <label className={styles.detailOptionLabel}>COLOUR — {selectedColor.toUpperCase()}</label>
              <div className={styles.colorSelectorList}>
                {selectedProduct.colors.filter(c => c.inStock !== false).map((color) => (
                  <button
                    key={color.name}
                    className={`${styles.colorCircle} ${selectedColor.toLowerCase() === color.name.toLowerCase() ? styles.colorCircleActive : ''}`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => setSelectedColor(color.name)}
                    title={color.name}
                    aria-label={`Select color ${color.name}`}
                  />
                ))}
              </div>
            </div>
          )}

          <div className={styles.detailOptionSection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <label className={styles.detailOptionLabel}>
                SIZE — {selectedSize}
                {isCurrentSizeOutOfStock && (
                  <span style={{ color: 'var(--color-danger, #dc3545)', marginLeft: '8px', fontSize: '0.72rem', fontWeight: 600 }}>
                    (OUT OF STOCK)
                  </span>
                )}
              </label>
              <button className={styles.sizeGuideLink}>Size Guide</button>
            </div>
            <div className={styles.sizeSelectorList}>
              {allSizesList.map((size) => {
                const { isAvailable, isOutOfStock } = getSizeStatus(size);
                const disabled = !isAvailable || isOutOfStock;
                return (
                  <button
                    key={size}
                    disabled={disabled}
                    className={`${styles.sizeBox} ${selectedSize === size ? styles.sizeBoxActive : ''} ${disabled ? styles.sizeBoxDisabled : ''}`}
                    onClick={() => !disabled && setSelectedSize(size)}
                    title={disabled ? `${size} - Out of Stock / Unavailable` : `Select Size ${size}`}
                  >
                    {size}
                  </button>
                );
              })}
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
              disabled={isCurrentSizeOutOfStock}
              style={{ 
                flexGrow: 1, 
                padding: '16px 24px', 
                display: 'flex', 
                justifyContent: 'center',
                opacity: isCurrentSizeOutOfStock ? 0.5 : 1,
                cursor: isCurrentSizeOutOfStock ? 'not-allowed' : 'pointer',
                backgroundColor: isCurrentSizeOutOfStock ? 'var(--text-muted, #777)' : undefined
              }}
              onClick={() => {
                if (!isCurrentSizeOutOfStock) {
                  for(let i=0; i<productQuantity; i++) {
                    addToBag(selectedProduct.id);
                  }
                }
              }}
            >
              {isCurrentSizeOutOfStock ? "OUT OF STOCK" : "ADD TO BAG"}
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
              <p>{selectedProduct.description || "Plush velvet with gold piping and tassel detail. This exquisite piece is crafted by master artisans using traditional techniques passed down through generations. Each set undergoes rigorous quality checks before it reaches your hands."}</p>
            )}
            {activeDetailTab === 'materials' && (
              <p>{selectedProduct.materials || "Pure handloom organic threads, 100% premium silk, cotton-velvet fabric base, and natural dye embellishments."}</p>
            )}
            {activeDetailTab === 'shipping' && (
              <p>{selectedProduct.shipping || "Free delivery on orders over PKR 5,000. 7-day hassle-free return window and quick exchanges."}</p>
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
              <li className={styles.contactItem}><span className={styles.contactLabel}>Primary Address</span><span className={styles.contactValue}>36/1/H /2 Bright Street, Kolkata - 700017</span></li>
              <li className={styles.contactItem}><span className={styles.contactLabel}>Secondary Address</span><span className={styles.contactValue}>40 Foota Road, Shaheen Bagh, Delhi - 110025</span></li>
              <li className={styles.contactItem}><span className={styles.contactLabel}>Phone</span><span className={styles.contactValue}>+9172775060, +917250846963, +919163037924</span></li>
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
