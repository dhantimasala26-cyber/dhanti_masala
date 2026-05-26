import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Order } from '@/lib/types';

export const revalidate = 0; // Dynamic rendering

export default async function AdminDashboardPage() {
  let stats = {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrder: 0,
    totalCustomers: 0,
  };
  let recentOrders: Order[] = [];

  try {
    // 1. Fetch Orders for stats
    const { data: dbOrders } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbOrders && dbOrders.length > 0) {
      stats.totalOrders = dbOrders.length;
      
      const paidOrders = dbOrders.filter((o: any) => o.payment_status === 'paid');
      stats.totalRevenue = paidOrders.reduce((sum: number, o: any) => sum + parseFloat(o.total || 0), 0);
      stats.averageOrder = stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders) : 0;
      
      // Limit to 5 for recent orders
      recentOrders = dbOrders.slice(0, 5) as Order[];
    }

    // 2. Fetch Customers Count
    const { count: customerCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });
    
    stats.totalCustomers = customerCount || 0;

  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'delivered':
        return '#2E5A44'; // green
      case 'shipped':
      case 'processing':
        return '#D88D43'; // mustard
      case 'pending':
        return '#7A6C65'; // gray
      case 'failed':
      case 'cancelled':
        return '#C24444'; // red
      default:
        return '#7A6C65';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Dashboard Overview</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Real-time business performance metrics for Dhanti Masala.</p>
        </div>
        <a href="/" target="_blank" className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
          Visit Live Shop
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>

      {/* Grid of Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        {/* Total Revenue */}
        <div style={{ backgroundColor: 'white', padding: '1.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Sales</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3h12" />
              <path d="M6 8h12" />
              <path d="m6 13 8.5 8" />
              <path d="M6 13h3" />
              <path d="M9 13c6.667 0 6.667-10 0-10" />
            </svg>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}>₹{stats.totalRevenue}</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-success)', marginTop: '0.25rem', fontWeight: 600 }}>From paid online &amp; COD orders</p>
        </div>

        {/* Total Orders */}
        <div style={{ backgroundColor: 'white', padding: '1.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Orders</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-body)' }}>{stats.totalOrders}</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Completed &amp; pending orders</p>
        </div>

        {/* Average Order Value */}
        <div style={{ backgroundColor: 'white', padding: '1.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Average Order Value</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E0A93C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3h12" />
              <path d="M6 8h12" />
              <path d="m6 13 8.5 8" />
              <path d="M6 13h3" />
              <path d="M9 13c6.667 0 6.667-10 0-10" />
            </svg>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-body)' }}>₹{stats.averageOrder}</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Revenue divided by orders count</p>
        </div>

        {/* Customers */}
        <div style={{ backgroundColor: 'white', padding: '1.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Customers</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-body)' }}>{stats.totalCustomers}</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Unique buyers in customer profiles</p>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '2rem' }}>
        {/* Recent Orders Card */}
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Recent Orders</h3>
            <Link href="/admin/orders" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>
              View All Orders &rarr;
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              No orders received yet. Start testing by purchasing on the shop page!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                    <th style={{ padding: '0.75rem 0' }}>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Delivery</th>
                    <th style={{ textAlign: 'right' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '1rem 0', fontFamily: 'monospace', fontWeight: 'bold' }}>
                        {order.id.split('-')[0].toUpperCase()}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{order.customer_phone}</div>
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{order.total}</td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: order.payment_status === 'paid' ? 'rgba(46, 90, 68, 0.1)' : 'rgba(122, 108, 101, 0.1)',
                          color: getStatusColor(order.payment_status)
                        }}>
                          {order.payment_status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: order.delivery_status === 'delivered' ? 'rgba(46, 90, 68, 0.1)' : 'rgba(216, 141, 67, 0.1)',
                          color: getStatusColor(order.delivery_status)
                        }}>
                          {order.delivery_status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Management Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Quick Actions</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link href="/admin/inventory" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontWeight: 600, fontSize: '0.85rem' }}>
                <span style={{ flexGrow: 1 }}>Update Stock Levels</span>
                <span style={{ color: 'var(--color-primary)' }}>&rarr;</span>
              </Link>
              
              <Link href="/admin/products" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontWeight: 600, fontSize: '0.85rem' }}>
                <span style={{ flexGrow: 1 }}>Create New Product</span>
                <span style={{ color: 'var(--color-primary)' }}>&rarr;</span>
              </Link>
              
              <Link href="/admin/cms" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontWeight: 600, fontSize: '0.85rem' }}>
                <span style={{ flexGrow: 1 }}>Edit Banner Texts</span>
                <span style={{ color: 'var(--color-primary)' }}>&rarr;</span>
              </Link>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '2rem', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.15 }}>
              <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-title)', color: 'white', marginBottom: '0.5rem' }}>100% Homemade Purity</h3>
            <p style={{ fontSize: '0.82rem', opacity: 0.9, lineHeight: 1.5 }}>
              Every batch shipped is logged. Check customer comments regularly to refine spice selection and roasting ratios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
