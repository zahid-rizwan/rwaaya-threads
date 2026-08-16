'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getMyOrders } from '@/lib/api';

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
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('riwaaya_token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadOrders();
  }, [router]);

  const loadOrders = async () => {
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
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
    return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading orders...</div>;
  }

  return (
    <div style={{ backgroundColor: '#fffdf8', minHeight: '100vh', padding: '20px 16px', paddingBottom: '100px' }}>
      <header style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ justifySelf: 'start' }}>
          <button 
            onClick={() => router.push('/profile')} 
            style={{ background: '#f5f5f5', border: '1px solid #ebebeb', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', color: '#444', transition: 'all 0.2s ease' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#6b1929', margin: 0, textAlign: 'center' }}>My Orders</h1>
        <div style={{ justifySelf: 'end' }}></div>
      </header>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📦</div>
          <h2 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#2c2c2c' }}>No Orders Yet</h2>
          <p style={{ margin: '0 0 24px', fontSize: '0.9rem', color: '#666' }}>You haven't placed any orders yet. Discover our latest collections!</p>
          <button 
            onClick={() => router.push('/')}
            style={{ padding: '12px 24px', backgroundColor: '#6b1929', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map(order => {
            const statusStyle = getStatusColor(order.status);
            return (
              <div 
                key={order._id} 
                onClick={() => router.push(`/profile/orders/${order._id}`)}
                style={{ backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(107, 25, 41, 0.06)', border: '1px solid rgba(184, 150, 62, 0.15)', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(107, 25, 41, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(107, 25, 41, 0.06)';
                }}
              >
                {/* Order Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(184, 150, 62, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: '#fafaf8' }}>
                  <div>
                    <p style={{ margin: '0 0 6px', fontSize: '0.7rem', color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Order ID</p>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#6b1929', fontFamily: 'var(--font-serif)' }}>#{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '30px', fontSize: '0.7rem', fontWeight: 700, backgroundColor: statusStyle.bg, color: statusStyle.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {order.status}
                    </span>
                    <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: '#666' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ width: '80px', height: '100px', position: 'relative', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f5f5f5', border: '1px solid #f0f0f0' }}>
                        {item.image && <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />}
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h3 style={{ margin: '0 0 6px', fontSize: '1rem', color: '#2c2c2c', lineHeight: 1.3, fontFamily: 'var(--font-serif)' }}>{item.name}</h3>
                        <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: '#888' }}>
                          Size: {item.size || 'M'} | Color: {item.color || 'Ivory'} | Qty: {item.quantity}
                        </p>
                        <span style={{ fontSize: '1rem', fontWeight: 600, color: '#b8963e' }}>₹{item.price.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div style={{ padding: '16px 24px', backgroundColor: '#fafaf8', borderTop: '1px solid rgba(184, 150, 62, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 500 }}>Total Amount Paid</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#6b1929' }}>₹{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
