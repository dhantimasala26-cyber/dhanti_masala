'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';
import { useToast } from '@/context/ToastContext';
import { apiUrl } from '@/lib/api';

export const Sidebar: React.FC = () => {
  const { showToast } = useToast();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch(apiUrl('/api/auth/logout'), { method: 'POST' });
      if (res.ok) {
        router.push('/admin/login');
      } else {
        showToast('Failed to logout. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Logout error:', err);
      showToast('An error occurred during logout.', 'error');
    }
  };

  const isActive = (path: string) => {
    if (path === '/admin') return pathname === '/admin';
    return pathname?.startsWith(path);
  };

  const linkClass = (path: string) => {
    return isActive(path) ? `${styles.link} ${styles.activeLink}` : styles.link;
  };

  return (
    <aside className={styles.sidebar}>
      {/* Brand Header */}
      <div className={styles.brand}>
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2C8.268 2 2 8.268 2 16c0 5.4 3.056 10.09 7.525 12.396.643.332 1.341-.225 1.228-.934l-.84-5.267a1 1 0 01.374-.93L13.8 18.5a1 1 0 000-1.556l-3.513-2.763a1 1 0 01-.374-.93l.84-5.267c.113-.71-.585-1.266-1.228-.934A13.945 13.945 0 0016 4c7.732 0 14 6.268 14 14s-6.268 14-14 14c-1.325 0-2.613-.184-3.834-.53a.75.75 0 01-.52-.924l.583-2.036a.75.75 0 01.933-.51c.915.28 1.879.43 2.838.43 6.627 0 12-5.373 12-12S22.627 6 16 6 4 11.373 4 18c0 3.328 1.353 6.34 3.543 8.52a.75.75 0 001.21-.194l1.182-3.153a.75.75 0 00-.142-.816A9.957 9.957 0 018 16c0-4.418 3.582-8 8-8s8 3.582 8 8c0 2.27-.946 4.32-2.473 5.787a.75.75 0 00-.113.987l2.25 3a.75.75 0 001.127.086C28.026 23.36 30 19.907 30 16c0-7.732-6.268-14-14-14z" fill="var(--color-secondary)" />
          <circle cx="16" cy="16" r="4" fill="var(--color-primary)" />
        </svg>
        <div>
          <span className={styles.logoText}>Dhanti Admin</span>
          <span className={styles.logoSub}>Spice Management</span>
        </div>
      </div>

      {/* Nav links */}
      <nav className={styles.nav}>
        <Link href="/admin" className={linkClass('/admin')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" />
            <rect x="14" y="3" width="7" height="5" />
            <rect x="14" y="12" width="7" height="9" />
            <rect x="3" y="16" width="7" height="5" />
          </svg>
          Dashboard
        </Link>

        <Link href="/admin/products" className={linkClass('/admin/products')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
          Products
        </Link>

        <Link href="/admin/categories" className={linkClass('/admin/categories')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          Categories
        </Link>

        <Link href="/admin/orders" className={linkClass('/admin/orders')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          Orders
        </Link>

        <Link href="/admin/customers" className={linkClass('/admin/customers')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Customers
        </Link>

        <Link href="/admin/inventory" className={linkClass('/admin/inventory')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          Inventory Stock
        </Link>

        <Link href="/admin/coupons" className={linkClass('/admin/coupons')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          Coupons
        </Link>

        <Link href="/admin/cms" className={linkClass('/admin/cms')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          CMS Editor
        </Link>

        <Link href="/admin/queries" className={linkClass('/admin/queries')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Customer Queries
        </Link>

        <Link href="/admin/settings" className={linkClass('/admin/settings')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Settings
        </Link>
      </nav>

      {/* Logout Footer */}
      <div className={styles.footer}>
        <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Log Out
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
