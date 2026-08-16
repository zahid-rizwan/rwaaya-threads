'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from '@/app/page.module.css';
import { fetchCart, updateCartItemQty, removeCartItem, CartData } from '@/lib/api';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartData | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

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

  // Toggle Single Item Selection
  const toggleSelectItem = (itemId: string) => {
    if (selectedItemIds.includes(itemId)) {
      setSelectedItemIds(prev => prev.filter(id => id !== itemId));
    } else {
      setSelectedItemIds(prev => [...prev, itemId]);
    }
  };

  // Toggle All Items Selection
  const toggleSelectAll = () => {
    if (!cart) return;
    if (selectedItemIds.length === cart.items.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(cart.items.map(item => item.id));
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

  // Dynamic Calculations ONLY for Checked/Selected Items
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
    <div className={styles.pageContainer} style={{ paddingBottom: '100px' }}>
      
      {/* 1. Announcement Bar */}
      <div className={styles.announcementBar}>
        <div className={styles.announcementText}>
          ✦ FREE EXPRESS SHIPPING ON ORDERS ABOVE ₹5,000 · COMPLIMENTARY ROYAL GIFT PACKAGING ON ALL ORDERS ✦ FREE EXPRESS SHIPPING ON ORDERS ABOVE ₹5,000 · COMPLIMENTARY ROYAL GIFT PACKAGING ON ALL ORDERS
        </div>
      </div>

      {/* 2. Top Header Navigation (Storefront Navigation) */}
      <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
        <div className={styles.navLeft}>
          <button 
            className={`${styles.iconButton} ${styles.mobileOnly}`} 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            <div className={styles.menuButton}>
              <span className={styles.menuBar}></span>
              <span className={styles.menuBar}></span>
              <span className={styles.menuBar}></span>
            </div>
          </button>
          
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/'); }}>
            <Image src="/assets/logo.svg" alt="Riwaaya Threads Logo" width={180} height={25} className={styles.logoImage} priority />
          </a>

          <ul className={`${styles.navLinks} ${styles.desktopOnly}`} style={{ marginLeft: '32px' }}>
            <li><a href="#" onClick={(e) => { e.preventDefault(); router.push('/collections/suits'); }}>Pakistani Suits</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); router.push('/collections/coords'); }}>Co-Ord Sets</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); router.push('/collections/party'); }}>Bridal Edit</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); router.push('/collections/hampers'); }}>Gift Hampers</a></li>
          </ul>
        </div>

        <div className={styles.navRight} style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
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
              {cart?.items.length || 0}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          inset: '70px 0 0 0',
          backgroundColor: 'var(--background, #fffdf8)',
          zIndex: 97,
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          fontFamily: 'var(--font-serif, Georgia, serif)',
          fontSize: '1.6rem',
          borderBottom: '1px solid rgba(184, 150, 62, 0.2)'
        }}>
          <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); router.push('/collections/suits'); }}>Pakistani Suits</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); router.push('/collections/coords'); }}>Co-Ord Sets</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); router.push('/collections/party'); }}>Bridal & Festive Edit</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); router.push('/collections/hampers'); }}>Gift Hampers</a>
        </div>
      )}

      {/* Breadcrumbs Navigation */}
      <div className={styles.breadcrumbs} style={{ padding: '20px 20px 0 20px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <a href="#" onClick={(e) => { e.preventDefault(); router.push('/'); }}>Home</a>
        <span className={styles.breadcrumbDivider}>/</span>
        <span className={styles.breadcrumbActive}>Shopping Bag ({cart?.items.length || 0})</span>
      </div>

      {/* Cart Container Workspace */}
      <div style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '16px 20px 60px' }}>
        
        {/* Page Title & Luxury Header Card */}
        <div className={styles.cartHeaderCard} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em', color: 'var(--accent, #b8963e)', textTransform: 'uppercase' }}>
              ✦ RIWAAYA THREADS COUTURE
            </span>
            <h1 style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: '1.8rem', color: 'var(--primary, #6b1929)', margin: '2px 0 0', fontWeight: 600 }}>
              Your Curated Shopping Bag
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ padding: '6px 14px', borderRadius: '30px', backgroundColor: '#6b1929', color: '#fffdf8', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.05em' }}>
              {selectedItems.length} of {cart?.items.length || 0} Items Selected
            </span>
          </div>
        </div>

        {/* Free Shipping Progress Bar Widget */}
        <div style={{ backgroundColor: '#ffffff', border: '1.5px solid rgba(184, 150, 62, 0.28)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', boxShadow: '0 4px 18px rgba(107, 25, 41, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: '#2c2c2c', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem' }}>🚚</span>
              {selectedItems.length === 0 ? (
                <span style={{ color: '#666' }}>Select items below to calculate express shipping threshold</span>
              ) : amountNeededForFreeShipping === 0 ? (
                <span style={{ color: '#10b981', fontWeight: 700 }}>🎉 Congratulations! You unlocked <strong>FREE Express Shipping</strong></span>
              ) : (
                <span>Add <strong>₹{amountNeededForFreeShipping.toLocaleString()}</strong> more to unlock <strong>FREE Express Shipping</strong></span>
              )}
            </span>
            <span style={{ color: '#b8963e', fontWeight: 700 }}>{Math.round(shippingProgress)}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#f5eee4', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{ 
                width: `${shippingProgress}%`, 
                height: '100%', 
                background: amountNeededForFreeShipping === 0 ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)' : 'linear-gradient(90deg, #b8963e 0%, #d4af37 100%)', 
                transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' 
              }} 
            />
          </div>
        </div>

        {/* Main Cart Workspace Grid */}
        {!cart || cart.items.length === 0 ? (
          /* Empty Cart State */
          <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1.5px dashed rgba(184, 150, 62, 0.35)', boxShadow: '0 8px 30px rgba(107, 25, 41, 0.04)' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🛍️</div>
            <h2 style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: '1.8rem', color: 'var(--primary, #6b1929)', marginBottom: '10px' }}>
              Your Bag is Currently Empty
            </h2>
            <p style={{ color: '#666', fontSize: '0.98rem', maxWidth: '440px', margin: '0 auto 32px', lineHeight: 1.6 }}>
              Discover our latest handcrafted pret collections, luxury lawn suits, and festive bridal edits.
            </p>
            <button 
              className={styles.btnPrimary} 
              style={{ padding: '16px 42px', fontSize: '0.85rem', letterSpacing: '0.12em' }}
              onClick={() => router.push('/collections/all')}
            >
              EXPLORE COLLECTIONS ➔
            </button>
          </div>
        ) : (
          <div className={styles.cartWorkspace}>
            
            {/* Left Column: Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Select All Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', border: '1.5px solid rgba(184, 150, 62, 0.22)', padding: '12px 18px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#2c2c2c' }}>
                  <input 
                    type="checkbox" 
                    checked={allSelected} 
                    onChange={toggleSelectAll} 
                    className={styles.cartCheckbox} 
                  />
                  <span>Select All ({selectedItemIds.length}/{cart.items.length} items for checkout)</span>
                </label>
                {selectedItemIds.length < cart.items.length && (
                  <button 
                    style={{ background: 'none', border: 'none', color: '#b8963e', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={toggleSelectAll}
                  >
                    Select All
                  </button>
                )}
              </div>

              {/* Items List Cards (Myntra-Inspired Mobile & Desktop Luxury Layout) */}
              {cart.items.map((item) => {
                const isSelected = selectedItemIds.includes(item.id);
                const mrpPrice = item.price + 4500;
                const savings = 4500;

                return (
                  <div 
                    key={item.id} 
                    className={styles.myntraCartCard}
                    style={{ 
                      opacity: updatingId === item.id ? 0.6 : isSelected ? 1 : 0.75,
                      borderColor: isSelected ? 'rgba(107, 25, 41, 0.35)' : 'rgba(184, 150, 62, 0.2)',
                      backgroundColor: isSelected ? '#ffffff' : '#fafafa'
                    }}
                  >
                    {/* Left Column: Image with Overlaid Round Checkmark Badge */}
                    <div 
                      className={styles.myntraImgWrapper} 
                      onClick={() => toggleSelectItem(item.id)}
                      title="Click to select/unselect item"
                    >
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill 
                        style={{ objectFit: 'cover' }} 
                      />
                      <div className={`${styles.myntraCheckCircle} ${isSelected ? styles.myntraCheckActive : ''}`}>
                        {isSelected ? '✓' : ''}
                      </div>
                    </div>

                    {/* Right Column: Card Content Body */}
                    <div className={styles.myntraCardBody}>
                      
                      {/* Brand Title & Top Right Remove Icon */}
                      <div className={styles.myntraCardHeader}>
                        <div>
                          <h3 className={styles.myntraBrandTitle}>Riwaaya Threads</h3>
                          <p className={styles.myntraProductSubtitle}>{item.name}</p>
                        </div>
                        <button 
                          className={styles.myntraCloseBtn} 
                          onClick={() => handleRemove(item.id)}
                          disabled={updatingId === item.id}
                          title="Remove Item"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Pill Controls Row: Size Dropdown, Qty Stepper, Urgency */}
                      <div className={styles.myntraPillRow}>
                        <div className={styles.myntraSelectPill}>
                          <span>Size: <strong>{item.size}</strong></span>
                          <span style={{ fontSize: '0.65rem', color: '#888' }}>▼</span>
                        </div>

                        <div className={styles.myntraQtyPill}>
                          <span>Qty:</span>
                          <button 
                            className={styles.miniStepBtn} 
                            onClick={(e) => { e.stopPropagation(); handleQtyChange(item.id, item.quantity - 1); }}
                            disabled={updatingId === item.id}
                          >
                            -
                          </button>
                          <span style={{ fontWeight: 700 }}>{item.quantity}</span>
                          <button 
                            className={styles.miniStepBtn} 
                            onClick={(e) => { e.stopPropagation(); handleQtyChange(item.id, item.quantity + 1); }}
                            disabled={updatingId === item.id}
                          >
                            +
                          </button>
                        </div>

                        <span className={styles.stockUrgencyTag}>2 left</span>
                      </div>

                      {/* Price Row: Current Price, MRP Strikethrough, Discount */}
                      <div className={styles.myntraPriceRow}>
                        <span className={styles.currentPrice}>₹{(item.price * item.quantity).toLocaleString()}</span>
                        <span className={styles.mrpPrice}>₹{(mrpPrice * item.quantity).toLocaleString()}</span>
                        <span className={styles.savingsTag}>₹{(savings * item.quantity).toLocaleString()} Off</span>
                        <span style={{ fontSize: '0.72rem', color: '#999', cursor: 'pointer' }} title="Tax inclusive">ⓘ</span>
                      </div>

                      {/* Return & Shipping Trust Details */}
                      <div className={styles.myntraDeliveryInfo}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>↩</span>
                          <span><strong>7 days</strong> return available</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>🚚</span>
                          <span>Express Delivery by <strong>18 Aug - 20 Aug</strong></span>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Summary Sidebar (Ultra-Luxury Sidebar) */}
            <div className={styles.cartSummaryCard}>
              <h3 style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: '1.3rem', color: '#6b1929', borderBottom: '1px solid rgba(184, 150, 62, 0.25)', paddingBottom: '12px', marginBottom: '18px', fontWeight: 600 }}>
                Order Summary
              </h3>

              {/* Delivery Guarantee Box */}
              <div style={{ backgroundColor: 'rgba(247, 239, 227, 0.5)', border: '1px solid rgba(184, 150, 62, 0.2)', borderRadius: '8px', padding: '12px 14px', marginBottom: '18px', fontSize: '0.8rem', color: '#333' }}>
                <span style={{ fontWeight: 700, color: '#6b1929' }}>🚚 Express Delivery Guarantee</span>
                <p style={{ margin: '3px 0 0', color: '#666', fontSize: '0.76rem' }}>Estimated Delivery: <strong>3 - 5 Business Days</strong> across India & International.</p>
              </div>

              {/* Price Breakdown Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem', color: '#555', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Selected Items ({selectedItems.length})</span>
                  <span style={{ fontWeight: 700, color: '#2c2c2c', fontFamily: 'var(--font-serif, Georgia, serif)' }}>₹{selectedSubtotal.toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Estimated Express Shipping</span>
                  <span style={{ fontWeight: 700, color: shippingCost === 0 ? '#10b981' : '#2c2c2c' }}>
                    {selectedItems.length === 0 ? '₹0' : shippingCost === 0 ? 'FREE' : `₹${shippingCost.toLocaleString()}`}
                  </span>
                </div>

                {appliedPromo && selectedItems.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 600 }}>
                    <span>Promo Code ({appliedPromo})</span>
                    <span>- ₹1,000</span>
                  </div>
                )}
              </div>

              {/* Promo Code Drawer */}
              <form onSubmit={handleApplyPromo} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <input 
                  type="text" 
                  placeholder="Promo or Voucher Code" 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  style={{ flex: 1, padding: '10px 12px', border: '1px solid rgba(184, 150, 62, 0.35)', borderRadius: '6px', fontSize: '0.82rem', outline: 'none', background: '#fffdf8' }}
                />
                <button 
                  type="submit" 
                  style={{ backgroundColor: '#6b1929', color: '#fffdf8', border: 'none', borderRadius: '6px', padding: '0 16px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.08em' }}
                >
                  APPLY
                </button>
              </form>

              {/* Grand Total */}
              <div style={{ borderTop: '2px solid rgba(184, 150, 62, 0.25)', paddingTop: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2c2c2c' }}>Grand Total</span>
                <span style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: '1.5rem', fontWeight: 700, color: '#6b1929' }}>
                  ₹{selectedItems.length === 0 ? '0' : grandTotal.toLocaleString()}
                </span>
              </div>



              {/* Certified Brand Assurances */}
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed rgba(184, 150, 62, 0.25)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className={styles.cartTrustBadge}>
                  <span style={{ fontSize: '1.05rem' }}>👑</span>
                  <span>100% Authentic Artisanal Pret & Formal Couture</span>
                </div>
                <div className={styles.cartTrustBadge}>
                  <span style={{ fontSize: '1.05rem' }}>🛡️</span>
                  <span>7-Day Hassle-Free Exchange & Return Policy</span>
                </div>
                <div className={styles.cartTrustBadge}>
                  <span style={{ fontSize: '1.05rem' }}>🔒</span>
                  <span>256-Bit SSL Encrypted Payment & Doorstep COD</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* MOBILE STICKY FLOATING CHECKOUT DOCK (Shown only on Mobile < 768px) */}
      {cart && cart.items.length > 0 && (
        <div className={styles.mobileOnly} style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 99,
          backgroundColor: '#ffffff',
          borderTop: '1.5px solid rgba(184, 150, 62, 0.3)',
          padding: '12px 20px',
          boxShadow: '0 -6px 20px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: '#666', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total ({selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'})
            </span>
            <span style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: '1.3rem', fontWeight: 700, color: '#6b1929' }}>
              ₹{selectedItems.length === 0 ? '0' : grandTotal.toLocaleString()}
            </span>
          </div>

          <button 
            className={styles.btnPrimary} 
            disabled={selectedItems.length === 0}
            style={{ 
              padding: '12px 24px', 
              fontSize: '0.8rem', 
              letterSpacing: '0.1em', 
              opacity: selectedItems.length === 0 ? 0.5 : 1,
              backgroundColor: selectedItems.length === 0 ? '#888' : '#6b1929'
            }}
            onClick={() => {
              if (selectedItems.length > 0) {
                router.push('/checkout');
              }
            }}
          >
            PLACE ORDER ➔
          </button>
        </div>
      )}
    </div>
  );
}
