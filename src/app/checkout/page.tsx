'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { fetchCart, createOrder, clearCart, createRazorpayOrder, verifyRazorpayPayment, CartData } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [placingOrder, setPlacingOrder] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'RAZORPAY'>('COD');
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);

  // Address State
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [street, setStreet] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');

  useEffect(() => {
    // Check Auth
    const token = typeof window !== 'undefined' ? (localStorage.getItem('riwaaya_token') || localStorage.getItem('token')) : null;
    if (!token) {
      router.push('/login?redirect=/checkout');
      return;
    }

    const rawUser = typeof window !== 'undefined' ? localStorage.getItem('riwaaya_user') : null;
    if (rawUser) {
      try {
        const u = JSON.parse(rawUser);
        if (u.name) setFullName(u.name);
        if (u.phone) setPhone(u.phone);
      } catch (e) {}
    }

    // Pre-fill from user's own saved addresses
    const rawAddresses = typeof window !== 'undefined' ? localStorage.getItem('riwaaya_user_addresses') : null;
    if (rawAddresses) {
      try {
        const list = JSON.parse(rawAddresses);
        if (Array.isArray(list) && list.length > 0) {
          const defaultAddr = list.find((a: any) => a.isDefault) || list[0];
          if (defaultAddr) {
            if (defaultAddr.name) setFullName(defaultAddr.name);
            if (defaultAddr.phone) setPhone(defaultAddr.phone);
            if (defaultAddr.street) setStreet(defaultAddr.street);
            if (defaultAddr.city) setCity(defaultAddr.city);
            if (defaultAddr.state) setState(defaultAddr.state);
            if (defaultAddr.pincode) setPincode(defaultAddr.pincode);
          }
        }
      } catch (e) {}
    }

    fetchCart().then((c) => {
      setCart(c);
    }).finally(() => setLoading(false));
  }, [router]);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const items = cart?.items || [];
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingCost = subtotal > 15000 || items.length === 0 ? 0 : 500;
  const grandTotal = subtotal + shippingCost;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setPlacingOrder(true);
    try {
      const orderItemsPayload = items.map((it) => ({
        productId: String(it.productId || it.id),
        name: it.name || 'Pakistani Suit',
        price: it.price || 18500,
        quantity: it.quantity || 1,
        image: it.image || '',
        size: it.size || 'M',
        color: it.color || 'Ivory'
      }));

      const shippingAddressPayload = {
        fullName,
        phone,
        address: `${street}, ${city}, ${state}`,
        city,
        postalCode: pincode
      };

      // Save user address locally for future checkout pre-fill
      const newSavedAddr = {
        id: Date.now(),
        title: 'Primary Address',
        name: fullName,
        phone,
        street,
        city,
        state,
        pincode,
        isDefault: true
      };
      try {
        const rawExisting = localStorage.getItem('riwaaya_user_addresses');
        const existing = rawExisting ? JSON.parse(rawExisting) : [];
        const updated = [newSavedAddr, ...existing.filter((a: any) => a.street !== street)];
        localStorage.setItem('riwaaya_user_addresses', JSON.stringify(updated));
      } catch (e) {}

      if (paymentMethod === 'RAZORPAY') {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          alert('Failed to load Razorpay payment gateway. Please check your internet connection.');
          setPlacingOrder(false);
          return;
        }

        let rzpOrder: any = null;
        try {
          rzpOrder = await createRazorpayOrder(grandTotal);
        } catch (err) {
          console.warn('Backend Razorpay order creation warning:', err);
        }

        const options = {
          key: rzpOrder?.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
          amount: rzpOrder?.amount || (grandTotal * 100),
          currency: rzpOrder?.currency || 'INR',
          name: 'Riwaaya Threads',
          description: 'Luxury Pakistani Couture Payment',
          image: '/assets/riwaaya_logo.png',
          order_id: rzpOrder?.id,
          prefill: {
            name: fullName,
            contact: phone
          },
          theme: {
            color: '#6b1929'
          },
          handler: async function (response: any) {
            try {
              if (rzpOrder?.id && response.razorpay_signature) {
                await verifyRazorpayPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                });
              }
              const created = await createOrder({
                orderItems: orderItemsPayload,
                shippingAddress: shippingAddressPayload,
                paymentMethod: 'RAZORPAY'
              });

              await clearCart();
              setOrderSuccess(true);
              setTimeout(() => {
                router.push('/profile');
              }, 1500);
            } catch (err: any) {
              alert('Payment processing error: ' + (err.message || 'Verification failed.'));
              setPlacingOrder(false);
            }
          },
          modal: {
            ondismiss: function () {
              setPlacingOrder(false);
            }
          }
        };

        const rzpWindow = new (window as any).Razorpay(options);
        rzpWindow.open();
        return;
      }

      // COD Flow
      const created = await createOrder({
        orderItems: orderItemsPayload,
        shippingAddress: shippingAddressPayload,
        paymentMethod: 'COD'
      });

      await clearCart();
      setOrderSuccess(true);
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to place order. Please try again.');
    } finally {
      if (paymentMethod !== 'RAZORPAY') {
        setPlacingOrder(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7efe3] flex items-center justify-center text-stone-600">
        <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Initializing Secure Checkout...</p>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#f7efe3] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 shadow-lg border border-emerald-300">
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#6b1929] mb-2">Order Confirmed!</h1>
        <p className="text-xs text-stone-600 max-w-sm mb-6">Your couture order has been placed successfully. Redirecting to your atelier profile...</p>
        <div className="w-12 h-1 bg-[#6b1929] rounded-full animate-ping" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7efe3] text-[#1a0a0e] font-sans">
      {/* Header */}
      <header className="py-4 px-6 sm:px-10 border-b border-[#b8963e]/20 flex items-center justify-between bg-[#f7efe3]/95 backdrop-blur-md sticky top-0 z-50">
        <button onClick={() => router.push('/')} className="flex items-center">
          <Image 
            src="/assets/riwaaya_logo.png" 
            alt="Riwaaya Threads Logo" 
            width={150} 
            height={36} 
            className="h-8 w-auto object-contain" 
            priority
          />
        </button>
        <button 
          onClick={() => router.push('/cart')}
          className="text-xs font-bold text-[#6b1929] hover:underline uppercase tracking-wider flex items-center gap-1"
        >
          <span>← Back to Bag</span>
        </button>
      </header>

      {/* Main Checkout */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-8">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#6b1929] mb-2">Checkout Atelier</h1>
        <p className="text-xs text-stone-500 uppercase tracking-widest font-semibold mb-8">
          Complete your delivery details & payment method
        </p>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Delivery & Payment Details */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Shipping Address Box */}
            <div className="bg-white rounded-lg p-6 sm:p-8 border border-[#b8963e]/25 shadow-sm flex flex-col gap-4">
              <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-[#b8963e]/20 pb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#6b1929] text-white text-xs flex items-center justify-center font-sans font-bold">1</span>
                Shipping Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-md border border-[#b8963e]/30 bg-stone-50 text-xs font-medium focus:outline-none focus:border-[#6b1929]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">Contact Phone</label>
                  <input 
                    type="text" 
                    required 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-md border border-[#b8963e]/30 bg-stone-50 text-xs font-medium focus:outline-none focus:border-[#6b1929]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">Street Address</label>
                <input 
                  type="text" 
                  required 
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="House / Flat No., Street, Landmark"
                  className="w-full px-4 py-2.5 rounded-md border border-[#b8963e]/30 bg-stone-50 text-xs font-medium focus:outline-none focus:border-[#6b1929]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">City</label>
                  <input 
                    type="text" 
                    required 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-md border border-[#b8963e]/30 bg-stone-50 text-xs font-medium focus:outline-none focus:border-[#6b1929]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">State</label>
                  <input 
                    type="text" 
                    required 
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-md border border-[#b8963e]/30 bg-stone-50 text-xs font-medium focus:outline-none focus:border-[#6b1929]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">Pincode</label>
                  <input 
                    type="text" 
                    required 
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-md border border-[#b8963e]/30 bg-stone-50 text-xs font-medium focus:outline-none focus:border-[#6b1929]"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white rounded-lg p-6 sm:p-8 border border-[#b8963e]/25 shadow-sm flex flex-col gap-4">
              <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-[#b8963e]/20 pb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#6b1929] text-white text-xs flex items-center justify-center font-sans font-bold">2</span>
                Payment Options
              </h2>

              <div className="flex flex-col gap-3">
                <label 
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-md border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'COD' 
                      ? 'border-[#6b1929] bg-[#f7efe3]/60 shadow-sm' 
                      : 'border-stone-200 hover:border-[#b8963e]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="payment" 
                      checked={paymentMethod === 'COD'} 
                      onChange={() => setPaymentMethod('COD')}
                      className="accent-[#6b1929]"
                    />
                    <div>
                      <span className="font-bold text-xs text-stone-900 block">Cash on Delivery (COD)</span>
                      <span className="text-[11px] text-stone-500">Pay cash upon doorstep delivery</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold bg-[#6b1929] text-white px-2 py-0.5 rounded-md uppercase tracking-wider">POPULAR</span>
                </label>

                <label 
                  onClick={() => setPaymentMethod('RAZORPAY')}
                  className={`p-4 rounded-md border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'RAZORPAY' 
                      ? 'border-[#6b1929] bg-[#f7efe3]/60 shadow-sm' 
                      : 'border-stone-200 hover:border-[#b8963e]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="payment" 
                      checked={paymentMethod === 'RAZORPAY'} 
                      onChange={() => setPaymentMethod('RAZORPAY')}
                      className="accent-[#6b1929]"
                    />
                    <div>
                      <span className="font-bold text-xs text-stone-900 block">Razorpay / UPI / Cards / Net Banking</span>
                      <span className="text-[11px] text-stone-500">Instant 256-Bit SSL encrypted online payment</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-lg p-6 sm:p-8 border border-[#b8963e]/25 shadow-sm sticky top-24 flex flex-col gap-4">
              <h2 className="font-serif text-lg font-bold text-[#6b1929] border-b border-[#b8963e]/20 pb-3">
                Order Items ({items.length})
              </h2>

              {/* Items List */}
              <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
                {items.length > 0 ? (
                  items.map((it) => (
                    <div key={it.id} className="flex justify-between items-center text-xs py-1 border-b border-[#b8963e]/10">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-9 h-11 rounded-md bg-stone-100 border border-[#b8963e]/30 overflow-hidden shrink-0">
                          {it.image ? <img src={it.image} alt={it.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#6b1929]" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-stone-900 truncate">{it.name}</p>
                          <p className="text-[10px] text-stone-500 font-medium">Qty: {it.quantity} • {it.size || 'M'}</p>
                        </div>
                      </div>
                      <span className="font-bold text-stone-900 shrink-0">₹{(it.price * it.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-500 py-4 text-center">Your shopping bag is empty.</p>
                )}
              </div>

              {/* Cost Summary */}
              <div className="border-t border-[#b8963e]/20 pt-4 flex flex-col gap-2.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-stone-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Express Shipping</span>
                  <span className={`font-bold ${shippingCost === 0 ? 'text-emerald-600' : 'text-stone-900'}`}>
                    {shippingCost === 0 ? 'FREE' : `₹${shippingCost.toLocaleString('en-IN')}`}
                  </span>
                </div>
                <div className="border-t-2 border-[#b8963e]/20 pt-3 flex justify-between items-baseline">
                  <span className="font-bold text-stone-900 text-sm">Grand Total</span>
                  <span className="font-serif text-2xl font-bold text-[#6b1929]">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button 
                type="submit"
                disabled={items.length === 0 || placingOrder}
                className="w-full bg-[#6b1929] hover:bg-[#8b2336] text-white font-bold text-xs tracking-widest uppercase py-3.5 rounded-md shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 mt-2"
              >
                {placingOrder ? 'CONFIRMING ORDER...' : 'PLACE ORDER NOW'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
