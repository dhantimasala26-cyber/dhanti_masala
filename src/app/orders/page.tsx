'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { apiUrl } from '@/lib/api';

export default function OrdersPage() {
  const { customer, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!isLoading && !customer) {
      router.push('/login?redirect=/orders');
    }
  }, [customer, isLoading, router]);

  useEffect(() => {
    if (customer) {
      const fetchOrders = async () => {
        try {
          const res = await fetch(apiUrl('/api/orders/my-orders'), {
            credentials: 'include' // to send JWT cookie
          });
          const data = await res.json();
          if (data.success) {
            setOrders(data.orders);
          }
        } catch (err) {
          console.error("Failed to fetch orders", err);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [customer]);

  if (isLoading || !customer) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'var(--color-success)';
      case 'shipped': return '#2196f3';
      case 'processing': return '#ff9800';
      case 'cancelled': return '#f44336';
      default: return 'var(--color-text-muted)';
    }
  };

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: 'var(--color-bg-light)', minHeight: '80vh', padding: '2rem 1rem' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>
            My Orders
          </h1>

          {loadingOrders ? (
            <p>Loading your orders...</p>
          ) : orders.length === 0 ? (
            <div style={{ padding: '3rem', backgroundColor: 'var(--color-bg-white)', borderRadius: '8px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>You haven't placed any orders yet.</p>
              <button onClick={() => router.push('/shop')} className="btn btn-primary">Start Shopping</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {orders.map(order => (
                <div key={order.id} style={{ backgroundColor: 'var(--color-bg-white)', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Order #{order.id.split('-')[0].toUpperCase()}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ 
                        display: 'inline-block', 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '999px', 
                        fontSize: '0.85rem', 
                        fontWeight: 600,
                        backgroundColor: `${getStatusColor(order.delivery_status)}15`,
                        color: getStatusColor(order.delivery_status),
                        textTransform: 'capitalize'
                      }}>
                        {order.delivery_status}
                      </span>
                      <p style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.5rem' }}>₹{order.total}</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Items:</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {order.items.map((item: any, idx: number) => (
                        <li key={idx} style={{ fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--color-text-muted)' }}>
                          {item.qty} x {item.name} ({item.variant})
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ backgroundColor: 'rgba(216, 141, 67, 0.05)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(216, 141, 67, 0.2)' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Delivery Tracking</h4>
                    {order.delivery_status === 'shipped' ? (
                      <p style={{ fontSize: '0.85rem', margin: 0 }}>
                        Your order is on the way! <br/>
                        <strong>Partner:</strong> {order.delivery_partner || 'Standard Delivery'} <br/>
                        <strong>Tracking Code:</strong> {order.tracking_code || 'N/A'}
                      </p>
                    ) : order.delivery_status === 'delivered' ? (
                      <p style={{ fontSize: '0.85rem', margin: 0 }}>This order has been delivered successfully.</p>
                    ) : order.delivery_status === 'cancelled' ? (
                      <p style={{ fontSize: '0.85rem', margin: 0 }}>This order was cancelled.</p>
                    ) : (
                      <p style={{ fontSize: '0.85rem', margin: 0 }}>
                        We are preparing your order. <br/>
                        <strong>Estimated Delivery:</strong> 5-7 business days
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
