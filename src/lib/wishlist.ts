/**
 * Wishlist Storage & Backend Sync Module for Riwaaya Threads
 * Handles seamless hybrid storage:
 * - Guest Users: Stores items in localStorage
 * - Logged-in Users: Real-time API sync with backend database (like Myntra) + automatic merge on login
 */

const WISHLIST_STORAGE_KEY = 'riwaaya_wishlist';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('riwaaya_token') || localStorage.getItem('token') || null;
}

export function getWishlistIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch (err) {
    console.error('Error reading wishlist from localStorage:', err);
    return [];
  }
}

export function isInWishlist(productId: string | number): boolean {
  const ids = getWishlistIds();
  const targetId = String(productId);
  return ids.includes(targetId);
}

export function toggleWishlist(productId: string | number): string[] {
  if (typeof window === 'undefined') return [];
  const sId = String(productId);
  const current = getWishlistIds();
  
  let updated: string[];
  if (current.includes(sId)) {
    updated = current.filter(id => id !== sId);
  } else {
    updated = [...current, sId];
  }

  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('riwaaya_wishlist_updated', { detail: updated }));
  } catch (err) {
    console.error('Error saving wishlist to localStorage:', err);
  }

  // If user is logged in, sync change to backend asynchronously
  const token = getToken();
  if (token) {
    fetch(`${API_BASE}/wishlist/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId: sId })
    })
    .then(res => {
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return res.json();
      }
      return null;
    })
    .then(data => {
      if (data && Array.isArray(data.wishlist)) {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(data.wishlist));
        window.dispatchEvent(new CustomEvent('riwaaya_wishlist_updated', { detail: data.wishlist }));
      }
    })
    .catch(err => console.error('Failed to sync wishlist toggle with backend:', err));
  }

  return updated;
}

/**
 * Merges guest localStorage wishlist with backend user account on login/registration (Myntra strategy)
 */
export async function syncWishlistOnLogin(tokenOverride?: string): Promise<string[]> {
  if (typeof window === 'undefined') return [];
  const token = tokenOverride || getToken();
  if (!token) return getWishlistIds();

  const localIds = getWishlistIds();

  try {
    const res = await fetch(`${API_BASE}/wishlist/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ wishlistIds: localIds })
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && Array.isArray(data.wishlist)) {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(data.wishlist));
        window.dispatchEvent(new CustomEvent('riwaaya_wishlist_updated', { detail: data.wishlist }));
        return data.wishlist;
      }
    }
  } catch (err) {
    console.error('Failed to merge wishlist on login:', err);
  }

  return localIds;
}

/**
 * Fetches saved wishlist from backend database for logged-in user
 */
export async function fetchServerWishlist(): Promise<string[]> {
  if (typeof window === 'undefined') return [];
  const token = getToken();
  if (!token) return getWishlistIds();

  try {
    const res = await fetch(`${API_BASE}/wishlist`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && Array.isArray(data.wishlist)) {
        const local = getWishlistIds();
        const combined = Array.from(new Set([...data.wishlist, ...local]));
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(combined));
        window.dispatchEvent(new CustomEvent('riwaaya_wishlist_updated', { detail: combined }));
        return combined;
      }
    }
  } catch (err) {
    console.error('Failed to fetch server wishlist:', err);
  }

  return getWishlistIds();
}

export function subscribeWishlist(callback: (ids: string[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleUpdate = () => {
    callback(getWishlistIds());
  };

  window.addEventListener('riwaaya_wishlist_updated', handleUpdate);
  window.addEventListener('storage', handleUpdate);

  // Initial call
  callback(getWishlistIds());

  // Attempt background sync if logged in
  fetchServerWishlist().catch(() => {});

  return () => {
    window.removeEventListener('riwaaya_wishlist_updated', handleUpdate);
    window.removeEventListener('storage', handleUpdate);
  };
}
