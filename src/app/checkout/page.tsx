'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Script from 'next/script';
import { fetchCart, clearCart, CartData } from '@/lib/api';
import styles from '@/app/page.module.css';
import { createOrder } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('riwaaya_token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Auto-fill user data if available
    const userData = localStorage.getItem('riwaaya_user');
    if (userData) {
      const user = JSON.parse(userData);
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        phone: user.phone || ''
      }));
    }

    loadCart();
  }, [router]);

  const loadCart = async () => {
    try {
      const data = await fetchCart();
      setCart(data);
      if (!data.items || data.items.length === 0) {
        router.push('/cart'); // Redirect to cart if empty
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0) return;

    setSubmitting(true);
    setError('');

    try {
      // 1. Format items for the backend
      const orderItems = cart.items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        size: item.size,
        color: item.color
      }));

      // 2. Initialize Razorpay order
      const { createRazorpayOrder, verifyRazorpayPayment } = await import('@/lib/api');
      const rzpOrder = await createRazorpayOrder(cart.grandTotal);

      // If backend returned a dummy order because of missing/invalid keys, just mock success
      if (rzpOrder.isDummy) {
        console.warn('Using dummy Razorpay flow because backend keys are missing or invalid.');
        await createOrder({
          orderItems,
          shippingAddress: formData,
          paymentMethod: 'RAZORPAY',
          razorpayOrderId: rzpOrder.orderId,
          razorpayPaymentId: `pay_dummy_${Date.now()}`,
          razorpaySignature: 'dummy_signature'
        } as any);

        await clearCart();
        setToastMessage('Dummy Payment Successful! Redirecting to your orders...');
        setTimeout(() => {
          router.push('/profile/orders');
        }, 2500);
        return;
      }

      // 3. Open Razorpay Checkout modal
      let rzpKey = rzpOrder.keyId;
      if (!rzpKey || rzpKey === 'undefined') {
        const envKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        rzpKey = (envKey && envKey !== 'undefined') ? envKey : 'rzp_test_dummy_key';
      }

      const options = {
        key: rzpKey,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'Riwaaya Threads',
        description: 'Secure Checkout',
        image: '/assets/logo.png', // Add your logo here if you have one
        order_id: rzpOrder.orderId,
        handler: async function (response: any) {
          try {
            // 4. Verify payment
            await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            // 5. Create Database Order
            await createOrder({
              orderItems,
              shippingAddress: formData,
              paymentMethod: 'RAZORPAY',
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            } as any);

            // 6. Clear cart and redirect
            await clearCart();
            setToastMessage('Payment Successful! Redirecting to your orders...');
            setTimeout(() => {
              router.push('/profile/orders');
            }, 2500);
          } catch (err: any) {
            setError(err.message || 'Verification or Order creation failed');
            setSubmitting(false);
          }
        },
        prefill: {
          name: formData.fullName,
          contact: formData.phone
        },
        theme: {
          color: '#6b1929'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        setError('Payment Failed: ' + response.error.description);
        setSubmitting(false);
      });

      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment. Please try again.');
      setSubmitting(false);
    }
  };
  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading checkout...</div>;
  }

  return (
    <div style={{ backgroundColor: '#fffdf8', minHeight: '100vh', padding: '20px 16px', paddingBottom: '100px', position: 'relative' }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      {/* Toast Message UI */}
      {toastMessage && (
        <div style={{ 
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', 
          backgroundColor: '#16a34a', color: 'white', padding: '16px 24px', 
          borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
          zIndex: 9999, fontWeight: 500, display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <span>✅</span> {toastMessage}
        </div>
      )}

      <header style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ justifySelf: 'start' }}>
          <button 
            onClick={() => router.back()} 
            style={{ background: '#f5f5f5', border: '1px solid #ebebeb', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', color: '#444', transition: 'all 0.2s ease' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#6b1929', margin: 0, textAlign: 'center' }}>Checkout</h1>
        <div style={{ justifySelf: 'end' }}></div>
      </header>

      {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Shipping Form */}
        <section style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <h2 style={{ fontSize: '1.1rem', color: '#2c2c2c', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📍</span> Shipping Address
          </h2>
          
          <form id="checkout-form" onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#666', marginBottom: '6px' }}>FULL NAME</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required style={{ width: '100%', padding: '12px', border: '1px solid #e0d5c1', borderRadius: '8px', fontSize: '0.9rem' }} />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#666', marginBottom: '6px' }}>PHONE NUMBER</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required style={{ width: '100%', padding: '12px', border: '1px solid #e0d5c1', borderRadius: '8px', fontSize: '0.9rem' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#666', marginBottom: '6px' }}>FULL ADDRESS</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} required placeholder="House No, Street, Landmark" style={{ width: '100%', padding: '12px', border: '1px solid #e0d5c1', borderRadius: '8px', fontSize: '0.9rem' }} />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#666', marginBottom: '6px' }}>CITY</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} required style={{ width: '100%', padding: '12px', border: '1px solid #e0d5c1', borderRadius: '8px', fontSize: '0.9rem' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#666', marginBottom: '6px' }}>PINCODE</label>
                <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} required style={{ width: '100%', padding: '12px', border: '1px solid #e0d5c1', borderRadius: '8px', fontSize: '0.9rem' }} />
              </div>
            </div>
          </form>
        </section>

        {/* Order Summary */}
        <section style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <h2 style={{ fontSize: '1.1rem', color: '#2c2c2c', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🛍️</span> Order Summary
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {cart?.items.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}>
                <div style={{ width: '60px', height: '80px', position: 'relative', borderRadius: '6px', overflow: 'hidden' }}>
                  <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: '0.9rem', color: '#2c2c2c' }}>{item.name}</h3>
                  <p style={{ margin: '0 0 4px', fontSize: '0.75rem', color: '#666' }}>Size: {item.size} | Qty: {item.quantity}</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#6b1929' }}>₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.85rem', color: '#666' }}>
            <span>Subtotal</span>
            <span>₹{cart?.subtotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.85rem', color: '#666' }}>
            <span>Shipping</span>
            <span>{cart?.shipping === 0 ? 'FREE' : `₹${cart?.shipping.toLocaleString()}`}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px dashed rgba(184, 150, 62, 0.3)', fontSize: '1.1rem', fontWeight: 700, color: '#2c2c2c' }}>
            <span>Total to Pay</span>
            <span style={{ color: '#6b1929' }}>₹{cart?.grandTotal.toLocaleString()}</span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#16a34a', textAlign: 'right', fontWeight: 600 }}>
            Cash on Delivery (COD)
          </div>
        </section>
      </div>

      {/* Fixed Bottom Dock for Submission */}
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        backgroundColor: '#fff', 
        padding: '16px 20px', 
        borderTop: '1px solid rgba(184, 150, 62, 0.15)', 
        boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
        zIndex: 100
      }}>
        <button 
          form="checkout-form"
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: submitting ? '#999' : '#6b1929',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            cursor: submitting ? 'not-allowed' : 'pointer'
          }}
        >
          {submitting ? 'PROCESSING...' : `PLACE ORDER • ₹${cart?.grandTotal.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
}
