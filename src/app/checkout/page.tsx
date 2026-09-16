'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#fbf6ee] p-8 text-center flex flex-col items-center justify-center">
      <h1 className="text-2xl font-serif font-bold text-[#6b1929] mb-4">Secure Checkout</h1>
      <p className="text-stone-600 mb-6">Complete your luxury order checkout with encrypted payment gateways.</p>
      <button 
        onClick={() => router.push('/cart')}
        className="px-6 py-3 bg-[#6b1929] text-white font-bold text-xs uppercase tracking-widest rounded-full"
      >
        Return to Cart
      </button>
    </div>
  );
}
