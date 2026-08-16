'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from '@/app/page.module.css';
import { mergeGuestCart } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

type LoginStep = 'phone' | 'otp' | 'success';

export default function Login() {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  // Auto-focus first OTP input when step changes to otp
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // Auto-redirect after success
  useEffect(() => {
    if (step === 'success') {
      const timer = setTimeout(() => router.push('/'), 2000);
      return () => clearTimeout(timer);
    }
  }, [step, router]);

  const formattedPhone = phone ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : '';

  // ========== STEP 1: SEND OTP ==========
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${digits.slice(-10)}` })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStep('otp');
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // ========== OTP INPUT HANDLERS ==========
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    if (pasted.length >= 6) {
      otpRefs.current[5]?.focus();
    }
  };

  // ========== STEP 2: VERIFY OTP ==========
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const digits = phone.replace(/\D/g, '');
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${digits.slice(-10)}`, otp: otpString })
      });
      const data = await res.json();

      if (res.ok && data.token) {
        // Save auth data
        localStorage.setItem('riwaaya_token', data.token);
        localStorage.setItem('riwaaya_user', JSON.stringify(data.user));
        setUserName(data.user?.name || 'User');

        // Merge guest cart into user's cart
        await mergeGuestCart();

        setStep('success');
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const progressIndex = step === 'phone' ? 1 : step === 'otp' ? 2 : 4;

  return (
    <div className={styles.loginModalOverlay} style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--background)' }}>
      <div className={styles.loginModalBackdrop} onClick={handleClose}></div>
      <div className={styles.loginCard} style={{ margin: 'auto' }}>
        
        {/* Header Banner */}
        <div className={styles.loginCardHeaderImage}>
          <Image 
            src="/assets/2131d28031801befa44bd105ec5914c27b763b64.png"
            alt=""
            fill
            style={{ objectFit: 'cover', filter: 'blur(4px) brightness(0.7)' }}
          />
          <div className={styles.loginCardHeaderTitle}>
            Riwaaya Threads
          </div>
        </div>

        {/* Close X */}
        <button className={styles.loginCloseButton} onClick={handleClose} aria-label="Close login modal">
          ✕
        </button>

        {/* Content Container */}
        <div className={styles.loginCardContent}>
          
          {/* Progress bar */}
          <div className={styles.loginProgressBar}>
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={`${styles.loginProgressSegment} ${i <= progressIndex ? styles.loginProgressSegmentActive : ''}`}
              />
            ))}
          </div>

          {/* ========== PHONE STEP ========== */}
          {step === 'phone' && (
            <>
              <h1 className={styles.loginTitle}>Welcome Back</h1>
              <p className={styles.loginSubtitle}>
                Continue your journey with timeless fashion, handcrafted treasures & elegant gifting.
              </p>

              <form onSubmit={handleSendOtp} className={styles.loginForm}>
                <label className={styles.phoneInputLabel}>📱 MOBILE NUMBER</label>
                <div className={styles.phoneInputContainer}>
                  <div className={styles.countryCodeSelector}>
                    <span style={{ fontSize: '1rem', marginRight: '4px' }}>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input 
                    type="tel" 
                    placeholder="98765 43210" 
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
                    className={styles.phoneInput} 
                    autoFocus
                  />
                </div>

                {error && <p className={styles.loginError}>{error}</p>}

                <button type="submit" className={styles.loginSubmitBtn} disabled={loading || phone.replace(/\D/g, '').length < 10}>
                  {loading ? (
                    <span className={styles.loginSpinner}></span>
                  ) : (
                    <>
                      <span>SEND OTP</span>
                      <span style={{ marginLeft: '8px' }}>➔</span>
                    </>
                  )}
                </button>
              </form>

              <div className={styles.loginDivider}>
                <span className={styles.dividerLine}></span>
                <span className={styles.dividerText}>OR</span>
                <span className={styles.dividerLine}></span>
              </div>

              <button className={styles.googleLoginBtn} onClick={() => alert('Google login coming soon!')}>
                <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '10px' }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.79-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </>
          )}

          {/* ========== OTP STEP ========== */}
          {step === 'otp' && (
            <>
              <h1 className={styles.loginTitle}>Verify OTP</h1>
              <p className={styles.loginSubtitle}>
                We&apos;ve sent a 6-digit code to <strong>{formattedPhone}</strong>
              </p>

              <form onSubmit={handleVerifyOtp} className={styles.loginForm}>
                <label className={styles.phoneInputLabel}>🔐 ENTER VERIFICATION CODE</label>
                <div className={styles.otpInputRow}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      className={`${styles.otpDigitInput} ${digit ? styles.otpDigitFilled : ''}`}
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>

                {error && <p className={styles.loginError}>{error}</p>}

                <button type="submit" className={styles.loginSubmitBtn} disabled={loading || otp.join('').length !== 6}>
                  {loading ? (
                    <span className={styles.loginSpinner}></span>
                  ) : (
                    <>
                      <span>VERIFY & LOGIN</span>
                      <span style={{ marginLeft: '8px' }}>➔</span>
                    </>
                  )}
                </button>
              </form>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                <button 
                  className={styles.loginEmailBtn} 
                  onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); setError(''); }}
                >
                  ← Change Number
                </button>
                <button 
                  className={styles.loginEmailBtn}
                  onClick={async () => {
                    setError('');
                    const digits = phone.replace(/\D/g, '');
                    try {
                      await fetch(`${API_BASE_URL}/auth/send-otp`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ phone: `+91${digits.slice(-10)}` })
                      });
                      setError('');
                      setOtp(['', '', '', '', '', '']);
                      otpRefs.current[0]?.focus();
                    } catch {}
                  }}
                >
                  Resend OTP
                </button>
              </div>
            </>
          )}

          {/* ========== SUCCESS STEP ========== */}
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
              <h1 className={styles.loginTitle} style={{ color: '#2e7d32' }}>Welcome, {userName}!</h1>
              <p className={styles.loginSubtitle}>
                Login successful. Your cart has been synced. Redirecting you to the store...
              </p>
              <div className={styles.loginSpinner} style={{ margin: '24px auto' }}></div>
            </div>
          )}

          {/* Trust & Terms (visible on phone & otp steps) */}
          {step !== 'success' && (
            <>
              <div className={styles.loginTrustDivider}></div>
              <ul className={styles.loginTrustList}>
                <li className={styles.loginTrustItem}>
                  <span>✦</span> Secure Login & Payments
                </li>
                <li className={styles.loginTrustItem}>
                  <span>✦</span> Your Information is Protected
                </li>
                <li className={styles.loginTrustItem}>
                  <span>✦</span> Easy Returns & Exchanges
                </li>
                <li className={styles.loginTrustItem}>
                  <span>✦</span> Trusted by Thousands of Customers
                </li>
              </ul>
              <p className={styles.loginModalTerms}>
                By continuing you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
