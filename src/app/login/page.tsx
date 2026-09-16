'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { loginUser, registerUser } from '@/lib/api';
import { syncWishlistOnLogin } from '@/lib/wishlist';

export default function LoginPage() {
  const router = useRouter();
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isLoginMode) {
        const res = await loginUser(email, password);
        if (res && res.token) {
          localStorage.setItem('riwaaya_token', res.token);
          if (res.user) {
            localStorage.setItem('riwaaya_user', JSON.stringify(res.user));
          }
          // Myntra-style Wishlist Sync: merge guest local wishlist items with backend user account
          await syncWishlistOnLogin(res.token);
          router.push('/profile');
        } else {
          setErrorMsg(res?.message || 'Invalid email or password. Please try again.');
        }
      } else {
        if (!name.trim()) {
          setErrorMsg('Please enter your full name.');
          setLoading(false);
          return;
        }
        const res = await registerUser(name, email, password);
        if (res && res.token) {
          localStorage.setItem('riwaaya_token', res.token);
          if (res.user) {
            localStorage.setItem('riwaaya_user', JSON.stringify(res.user));
          }
          await syncWishlistOnLogin(res.token);
          router.push('/profile');
        } else {
          setErrorMsg(res?.message || 'Registration failed. Please check details.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf6ee] text-[#2c2c2c] flex flex-col justify-between">
      {/* Header */}
      <header className="py-6 px-6 sm:px-10 border-b border-[#b8963e]/20 flex items-center justify-between bg-[#f7efe3]/90 backdrop-blur-md sticky top-0 z-50">
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
          onClick={() => router.push('/')}
          className="text-xs font-bold text-[#6b1929] hover:underline uppercase tracking-wider"
        >
          Back to Store
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-md w-full mx-auto px-4 py-12 flex-1 flex flex-col justify-center">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-[#b8963e]/30 shadow-xl text-center">
          <div className="w-12 h-12 rounded-full bg-[#6b1929]/10 border border-[#6b1929]/20 flex items-center justify-center mx-auto mb-4 text-[#6b1929]">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mb-1">
            {isLoginMode ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-xs text-stone-500 mb-6 uppercase tracking-widest font-semibold">
            {isLoginMode ? 'Sign in to access saved items & orders' : 'Join the Atelier Luxury Circle'}
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
            {!isLoginMode && (
              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-stone-700 mb-1">
                  Full Name
                </label>
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mariam Khan"
                  className="w-full px-4 py-3 rounded-xl border border-[#b8963e]/30 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:border-[#6b1929] transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-stone-700 mb-1">
                Email Address
              </label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 rounded-xl border border-[#b8963e]/30 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:border-[#6b1929] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-stone-700 mb-1">
                Password
              </label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-[#b8963e]/30 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:border-[#6b1929] transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="mt-2 w-full py-3.5 bg-[#6b1929] hover:bg-[#8b2336] text-white font-bold text-xs tracking-widest uppercase rounded-full shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isLoginMode ? 'SIGN IN' : 'REGISTER')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#b8963e]/20 text-center">
            <p className="text-xs text-stone-600 font-medium">
              {isLoginMode ? "Don't have an account?" : "Already registered?"}{' '}
              <button 
                type="button" 
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setErrorMsg('');
                }}
                className="text-[#6b1929] font-bold underline hover:text-[#8b2336] transition-colors ml-1"
              >
                {isLoginMode ? 'Create one now' : 'Sign in here'}
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-stone-500 border-t border-[#b8963e]/20">
        © 2026 Riwaaya Threads. All Rights Reserved.
      </footer>
    </div>
  );
}
