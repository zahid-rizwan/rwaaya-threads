'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/app/page.module.css';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; phone: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('riwaaya_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const userData = localStorage.getItem('riwaaya_user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      setUser({ name: 'Guest User', phone: '' });
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('riwaaya_token');
    localStorage.removeItem('riwaaya_user');
    router.push('/');
  };

  if (!user) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading profile...</div>;

  return (
    <div style={{ backgroundColor: '#fffdf8', minHeight: '100vh', padding: '20px' }}>
      <header style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ justifySelf: 'start' }}>
            <button 
              onClick={() => router.push('/')} 
              style={{ background: '#f5f5f5', border: '1px solid #ebebeb', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', color: '#444', transition: 'all 0.2s ease' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#6b1929', margin: 0, textAlign: 'center' }}>My Profile</h1>
        <div style={{ justifySelf: 'end' }}></div>
      </header>

      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '30px', backgroundColor: '#6b1929', color: '#fffdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: '#2c2c2c' }}>{user.name}</h2>
        <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>{user.phone}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button className={styles.googleLoginBtn} onClick={() => router.push('/profile/orders')} style={{ justifyContent: 'flex-start' }}>
          📦 My Orders
        </button>
        <button className={styles.googleLoginBtn} onClick={() => alert('Wishlist coming soon!')} style={{ justifyContent: 'flex-start' }}>
          ❤️ Wishlist
        </button>
        <button className={styles.googleLoginBtn} onClick={() => alert('Saved Addresses coming soon!')} style={{ justifyContent: 'flex-start' }}>
          📍 Saved Addresses
        </button>
      </div>

      <button 
        onClick={handleLogout}
        className={styles.googleLoginBtn}
        style={{ marginTop: '30px', color: '#dc2626', borderColor: 'rgba(220, 38, 38, 0.3)' }}
      >
        Logout
      </button>
    </div>
  );
}
