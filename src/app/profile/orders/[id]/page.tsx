'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getOrderById } from '@/lib/api';

interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
}

interface Order {
  _id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  orderItems: OrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    postalCode?: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('riwaaya_token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadOrderDetails();
  }, [unwrappedParams.id, router]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const data = await getOrderById(unwrappedParams.id);
      setOrder(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return { bg: '#fef9c3', text: '#ca8a04' };
      case 'PROCESSING': return { bg: '#e0f2fe', text: '#0284c7' };
      case 'SHIPPED': return { bg: '#f3e8ff', text: '#9333ea' };
      case 'DELIVERED': return { bg: '#dcfce7', text: '#16a34a' };
      case 'CANCELLED': return { bg: '#fee2e2', text: '#dc2626' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fffdf8' }}>
        <p style={{ color: '#6b1929', fontSize: '1.2rem', fontFamily: 'var(--font-serif)' }}>Loading Order Details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ minHeight: '100vh', padding: '40px 16px', backgroundColor: '#fffdf8', textAlign: 'center' }}>
        <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>Oops!</h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>{error || 'Order not found'}</p>
        <button 
          onClick={() => router.push('/profile/orders')}
          style={{ padding: '10px 20px', backgroundColor: '#6b1929', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const statusStyle = getStatusColor(order.status);
  
  // Calculate subtotal
  const subtotal = order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  // Calculate shipping (if total > subtotal, rest is shipping/taxes)
  const shipping = order.totalAmount > subtotal ? order.totalAmount - subtotal : 0;

  return (
    <div style={{ backgroundColor: '#fffdf8', minHeight: '100vh', padding: '20px 16px', paddingBottom: '100px' }}>
      <header style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ justifySelf: 'start' }}>
          <button 
            onClick={() => router.push('/profile/orders')} 
            style={{ background: '#f5f5f5', border: '1px solid #ebebeb', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', color: '#444', transition: 'all 0.2s ease' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#6b1929', margin: 0, textAlign: 'center' }}>Order Details</h1>
        <div style={{ justifySelf: 'end' }}></div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Order ID & Status Header */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 30px rgba(107, 25, 41, 0.06)', border: '1px solid rgba(184, 150, 62, 0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: '0.7rem', color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Order ID</p>
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: '#6b1929', fontFamily: 'var(--font-serif)' }}>#{order._id.slice(-8).toUpperCase()}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: statusStyle.bg, color: statusStyle.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {order.status}
              </span>
            </div>
          </div>
          <p style={{ margin: '0', fontSize: '0.85rem', color: '#666' }}>
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Shipping & Payment Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          
          {/* Shipping Address */}
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 30px rgba(107, 25, 41, 0.06)', border: '1px solid rgba(184, 150, 62, 0.15)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: '#2c2c2c', fontFamily: 'var(--font-serif)' }}>Shipping Details</h3>
            <p style={{ margin: '0 0 6px', fontSize: '0.9rem', fontWeight: 600, color: '#2c2c2c' }}>{order.shippingAddress.fullName}</p>
            <p style={{ margin: '0 0 6px', fontSize: '0.85rem', color: '#666', lineHeight: 1.5 }}>
              {order.shippingAddress.address}<br />
              {order.shippingAddress.city} {order.shippingAddress.postalCode && `- ${order.shippingAddress.postalCode}`}
            </p>
            <p style={{ margin: '0', fontSize: '0.85rem', color: '#666' }}>Phone: {order.shippingAddress.phone}</p>
          </div>

          {/* Payment Info */}
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 30px rgba(107, 25, 41, 0.06)', border: '1px solid rgba(184, 150, 62, 0.15)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: '#2c2c2c', fontFamily: 'var(--font-serif)' }}>Payment Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: '#666' }}>Method</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2c2c2c' }}>{order.paymentMethod === 'RAZORPAY' ? 'Online (Razorpay)' : 'Cash on Delivery'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: '#666' }}>Status</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: order.paymentStatus === 'PAID' ? '#16a34a' : '#ca8a04' }}>{order.paymentStatus}</span>
              </div>
              {order.razorpayPaymentId && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>Transaction ID</span>
                  <span style={{ fontSize: '0.85rem', color: '#888' }}>{order.razorpayPaymentId}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 30px rgba(107, 25, 41, 0.06)', border: '1px solid rgba(184, 150, 62, 0.15)' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '1.1rem', color: '#2c2c2c', fontFamily: 'var(--font-serif)' }}>Items Ordered</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {order.orderItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '80px', height: '100px', position: 'relative', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f5f5f5', border: '1px solid #f0f0f0' }}>
                  {item.image && <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: '1rem', color: '#2c2c2c', lineHeight: 1.3, fontFamily: 'var(--font-serif)' }}>{item.name}</h4>
                  <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: '#888' }}>
                    Size: {item.size || 'M'} | Color: {item.color || 'Ivory'} | Qty: {item.quantity}
                  </p>
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: '#b8963e' }}>₹{item.price.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Amount Breakdown */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 30px rgba(107, 25, 41, 0.06)', border: '1px solid rgba(184, 150, 62, 0.15)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>Subtotal</span>
              <span style={{ fontSize: '0.9rem', color: '#2c2c2c', fontWeight: 500 }}>₹{subtotal.toLocaleString()}</span>
            </div>
            {shipping > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>Shipping</span>
                <span style={{ fontSize: '0.9rem', color: '#2c2c2c', fontWeight: 500 }}>₹{shipping.toLocaleString()}</span>
              </div>
            )}
            <div style={{ height: '1px', backgroundColor: 'rgba(184, 150, 62, 0.2)', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.1rem', color: '#2c2c2c', fontFamily: 'var(--font-serif)' }}>Total Paid</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#6b1929' }}>₹{order.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
