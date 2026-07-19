'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from '@/app/page.module.css';

export default function Login() {
  const router = useRouter();

  const handleClose = () => {
    // Go back or to home page if there's no history
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className={styles.loginModalOverlay} style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--background)' }}>
      <div className={styles.loginModalBackdrop} onClick={handleClose}></div>
      <div className={styles.loginCard} style={{ margin: 'auto' }}>
        
        {/* Header Image with blurred model photo & gold logo */}
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

        {/* Close button X */}
        <button className={styles.loginCloseButton} onClick={handleClose} aria-label="Close login modal">
          ✕
        </button>

        {/* Content Container */}
        <div className={styles.loginCardContent}>
          
          {/* Progress bar */}
          <div className={styles.loginProgressBar}>
            <div className={`${styles.loginProgressSegment} ${styles.loginProgressSegmentActive}`}></div>
            <div className={styles.loginProgressSegment}></div>
            <div className={styles.loginProgressSegment}></div>
            <div className={styles.loginProgressSegment}></div>
          </div>

          <h1 className={styles.loginTitle}>Welcome Back</h1>
          <p className={styles.loginSubtitle}>
            Continue your journey with timeless fashion, handcrafted treasures & elegant gifting.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); alert('Verification code sent!'); }} className={styles.loginForm}>
            <label className={styles.phoneInputLabel}>📱 MOBILE NUMBER</label>
            <div className={styles.phoneInputContainer}>
              <div className={styles.countryCodeSelector}>
                <span style={{ fontSize: '1rem', marginRight: '4px' }}>🇵🇰</span>
                <span>+92</span>
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

          <div className={styles.loginTrustDivider}></div>

          {/* Trust Points */}
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

        </div>
      </div>
    </div>
  );
}
