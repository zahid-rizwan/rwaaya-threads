export interface ProductVariant {
  id: string;
  sku?: string;
  size: string;
  price?: number;
  stock: number;
}

export interface ColorOption {
  name: string;
  hex: string;
  inStock?: boolean;
}

export interface Product {
  id: number | string;
  name: string;
  category: string;
  price: string;
  rawPrice?: number;
  originalPrice?: string;
  rawOriginalPrice?: number;
  discountPercent?: number;
  colors?: ColorOption[];
  image: string;
  images?: string[];
  variants?: ProductVariant[];
  badge?: string;
  tag: string;
  description?: string;
  materials?: string;
  shipping?: string;
  sellerShop?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  category: string;
  price: number;
  image: string;
  size: string;
  color?: string;
  quantity: number;
}

export interface CartData {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  grandTotal: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

function resolveCategoryName(cat: any, tag?: string): string {
  // 1. Prioritize product tag if provided
  const t = (tag || '').toLowerCase();
  if (t === 'party') return 'Party Wear';
  if (t === 'coords') return 'Co-Ord Set';
  if (t === 'hampers') return 'Gift Hamper';
  if (t === 'suits') return 'Pakistani Suit';

  // 2. Check category object if populated from database
  if (cat && typeof cat === 'object' && cat.name) return cat.name;

  // 3. Check numeric category ID or category slug string
  const c = String(cat || '').toLowerCase();
  if (c === '3' || c === 'party') return 'Party Wear';
  if (c === '2' || c === 'coords') return 'Co-Ord Set';
  if (c === '4' || c === 'hampers') return 'Gift Hamper';
  if (c === '1' || c === 'suits') return 'Pakistani Suit';

  // 4. If cat is a custom non-ObjectId category string (not raw Mongo ObjectId)
  if (typeof cat === 'string' && cat.trim().length > 0 && !cat.match(/^[0-9a-fA-F]{24}$/) && isNaN(Number(cat))) {
    return cat;
  }

  return 'Pakistani Suit';
}

function mapProductItem(item: any): Product {
  const priceNum = typeof item.price === 'number' ? item.price : (parseFloat(String(item.price).replace(/[^\d.]/g, '')) || 18500);
  const origPriceNum = item.originalPrice ? (typeof item.originalPrice === 'number' ? item.originalPrice : parseFloat(String(item.originalPrice).replace(/[^\d.]/g, ''))) : Math.round(priceNum * 1.25);
  const discPct = item.discountPercent !== undefined ? item.discountPercent : (origPriceNum > priceNum ? Math.round(((origPriceNum - priceNum) / origPriceNum) * 100) : 0);
  
  const colorsList: ColorOption[] = Array.isArray(item.colors) ? item.colors : [];

  return {
    id: item._id || item.id,
    name: item.name,
    category: resolveCategoryName(item.category, item.tag),
    price: `₹${priceNum.toLocaleString('en-IN')}`,
    rawPrice: priceNum,
    originalPrice: origPriceNum > priceNum ? `₹${origPriceNum.toLocaleString('en-IN')}` : undefined,
    rawOriginalPrice: origPriceNum,
    discountPercent: discPct,
    colors: colorsList,
    image: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : (item.image || "/assets/1540aab590cd7d478ad01cdb1a615d469ef2a808.png"),
    images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [(item.image || "/assets/1540aab590cd7d478ad01cdb1a615d469ef2a808.png")],
    variants: Array.isArray(item.variants) ? item.variants : [],
    badge: item.badge,
    tag: item.tag || 'suits',
    description: item.description,
    materials: item.materials,
    shipping: item.shipping,
    sellerShop: item.seller?.shopName
  };
}

export async function getProducts(tag?: string): Promise<Product[]> {
  try {
    const url = tag && tag !== 'all' ? `${API_BASE_URL}/products?tag=${tag}` : `${API_BASE_URL}/products`;
    const res = await fetch(url, { cache: 'no-store' });
    
    if (!res.ok) {
      throw new Error(`API response status: ${res.status}`);
    }

    const payload = await res.json();
    const data = (payload && typeof payload === 'object' && 'data' in payload) ? payload.data : payload;

    if (Array.isArray(data)) {
      return data.map((item: any) => mapProductItem(item));
    }
  } catch (error) {
    console.error('Error fetching live products from backend API:', error);
  }

  return [];
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const payload = await res.json();
      const item = (payload && typeof payload === 'object' && 'data' in payload) ? payload.data : payload;
      if (item) {
        return mapProductItem(item);
      }
    }
  } catch (error) {
    console.error('Error fetching live product by ID from backend API:', error);
  }

  return null;
}

// ======================== CART API METHODS ========================

const getSessionId = (): string => {
  if (typeof window !== 'undefined') {
    let sid = localStorage.getItem('riwaaya_session_id');
    if (!sid) {
      sid = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      localStorage.setItem('riwaaya_session_id', sid);
    }
    return sid;
  }
  return 'default_session';
};

export async function fetchCart(): Promise<CartData> {
  const sid = getSessionId();
  try {
    const res = await fetch(`${API_BASE_URL}/cart?sessionId=${sid}`, {
      headers: { 'x-session-id': sid },
      cache: 'no-store'
    });
    if (res.ok) {
      const payload = await res.json();
      return (payload && typeof payload === 'object' && 'data' in payload) ? payload.data : payload;
    }
  } catch (err) {
    console.error('Error fetching live cart from backend API:', err);
  }

  return {
    items: [],
    subtotal: 0,
    shipping: 0,
    discount: 0,
    grandTotal: 0
  };
}

export async function addCartItem(productId: string, size = 'M', quantity = 1, color = 'Ivory'): Promise<CartData> {
  const sid = getSessionId();
  try {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sid
      },
      body: JSON.stringify({ productId, size, quantity, color, sessionId: sid })
    });
    if (res.ok) {
      const payload = await res.json();
      return (payload && typeof payload === 'object' && 'data' in payload) ? payload.data : payload;
    }
  } catch (err) {
    console.error('Error adding item to cart:', err);
  }

  return fetchCart();
}

export async function updateCartItemQty(itemId: string, quantity: number): Promise<CartData> {
  const sid = getSessionId();
  try {
    const res = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sid
      },
      body: JSON.stringify({ quantity, sessionId: sid })
    });
    if (res.ok) {
      const payload = await res.json();
      return (payload && typeof payload === 'object' && 'data' in payload) ? payload.data : payload;
    }
  } catch (err) {
    console.error('Error updating cart item quantity:', err);
  }

  return fetchCart();
}

export async function removeCartItem(itemId: string): Promise<CartData> {
  const sid = getSessionId();
  try {
    const res = await fetch(`${API_BASE_URL}/cart/${itemId}?sessionId=${sid}`, {
      method: 'DELETE',
      headers: { 'x-session-id': sid }
    });
    if (res.ok) {
      const payload = await res.json();
      return (payload && typeof payload === 'object' && 'data' in payload) ? payload.data : payload;
    }
  } catch (err) {
    console.error('Error removing cart item:', err);
  }

  return fetchCart();
}

// ======================== AUTH TOKEN HELPER ========================

const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('riwaaya_token') || localStorage.getItem('token') || null;
  }
  return null;
};

// ======================== CART MERGE (Guest → User) ========================

/**
 * Call this immediately after user login.
 * Merges any guest cart items (stored by sessionId) into the authenticated user's cart.
 * Requires valid JWT token in localStorage.
 */
export async function mergeGuestCart(): Promise<CartData> {
  const sid = getSessionId();
  const token = getAuthToken();

  if (!token) {
    console.log('No auth token found, skipping cart merge.');
    return fetchCart();
  }

  try {
    const res = await fetch(`${API_BASE_URL}/cart/merge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-session-id': sid
      },
      body: JSON.stringify({ sessionId: sid })
    });
    if (res.ok) {
      const payload = await res.json();
      return (payload && typeof payload === 'object' && 'data' in payload) ? payload.data : payload;
    }
  } catch (err) {
    console.error('Error merging guest cart:', err);
  }

  return fetchCart();
}

// ======================== CART CLEAR ========================

export async function clearCart(): Promise<CartData> {
  const sid = getSessionId();
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'x-session-id': sid
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/cart?sessionId=${sid}`, {
      method: 'DELETE',
      headers
    });
    if (res.ok) {
      const payload = await res.json();
      return (payload && typeof payload === 'object' && 'data' in payload) ? payload.data : payload;
    }
  } catch (err) {
    console.error('Error clearing cart:', err);
  }

  return fetchCart();
}

// ======================== ORDERS ========================

export async function createOrder(orderData: {
  orderItems: { productId: string; name: string; price: number; quantity: number; image: string }[];
  shippingAddress: { fullName: string; phone: string; address: string; city: string; postalCode?: string };
}) {
  const token = getAuthToken();
  if (!token) throw new Error('User must be logged in to place an order');

  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(orderData)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to place order');
  }

  return res.json();
}

export async function getMyOrders() {
  const token = getAuthToken();
  if (!token) return [];

  try {
    const res = await fetch(`${API_BASE_URL}/orders/myorders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });

    if (res.ok) {
      return res.json();
    }
  } catch (err) {
    console.error('Error fetching orders:', err);
  }
  return [];
}

export async function getOrderById(orderId: string) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error('Failed to fetch order details');
  }

  return res.json();
}

// ======================== PAYMENTS ========================

export async function createRazorpayOrder(amount: number) {
  const token = getAuthToken();
  if (!token) throw new Error('User must be logged in to initiate payment');

  const res = await fetch(`${API_BASE_URL}/payment/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ amount })
  });

  if (!res.ok) {
    throw new Error('Failed to initialize Razorpay order');
  }

  return res.json();
}

export async function verifyRazorpayPayment(paymentData: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
  const token = getAuthToken();
  if (!token) throw new Error('User must be logged in to verify payment');

  const res = await fetch(`${API_BASE_URL}/payment/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(paymentData)
  });

  if (!res.ok) {
    throw new Error('Payment verification failed');
  }

  return res.json();
}
// ======================== SELLER / PRODUCTS ========================

export async function uploadImage(fileBlob: Blob): Promise<string> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const formData = new FormData();
  formData.append('images', fileBlob, 'product-image.webp');

  const res = await fetch(`${API_BASE_URL}/products/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to upload image');
  }

  const payload = await res.json();
  if (payload.data && payload.data.urls && payload.data.urls.length > 0) {
    return payload.data.urls[0];
  }
  throw new Error('Image upload failed, no URL returned');
}

export async function createProduct(productData: any) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to create product');
  }

  return res.json();
}
