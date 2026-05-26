'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import styles from './Navbar.module.css';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { cartItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  // Check if link is active
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  const navClass = (path: string) => {
    return isActive(path) ? `${styles.navLink} ${styles.activeLink}` : styles.navLink;
  };

  return (
    <header className={styles.header}>
      <div className={`container ${styles.navbar}`}>
        {/* Brand Logo */}
        <Link href="/" className={styles.logo}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2C8.268 2 2 8.268 2 16c0 5.4 3.056 10.09 7.525 12.396.643.332 1.341-.225 1.228-.934l-.84-5.267a1 1 0 01.374-.93L13.8 18.5a1 1 0 000-1.556l-3.513-2.763a1 1 0 01-.374-.93l.84-5.267c.113-.71-.585-1.266-1.228-.934A13.945 13.945 0 0016 4c7.732 0 14 6.268 14 14s-6.268 14-14 14c-1.325 0-2.613-.184-3.834-.53a.75.75 0 01-.52-.924l.583-2.036a.75.75 0 01.933-.51c.915.28 1.879.43 2.838.43 6.627 0 12-5.373 12-12S22.627 6 16 6 4 11.373 4 18c0 3.328 1.353 6.34 3.543 8.52a.75.75 0 001.21-.194l1.182-3.153a.75.75 0 00-.142-.816A9.957 9.957 0 018 16c0-4.418 3.582-8 8-8s8 3.582 8 8c0 2.27-.946 4.32-2.473 5.787a.75.75 0 00-.113.987l2.25 3a.75.75 0 001.127.086C28.026 23.36 30 19.907 30 16c0-7.732-6.268-14-14-14z" fill="var(--color-primary)" />
            <circle cx="16" cy="16" r="4" fill="var(--color-secondary)" />
          </svg>
          <div className={styles.logoGroup}>
            <span>Dhanti Masala</span>
            <span className={styles.logoSub}>Homemade Purity</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className={`${styles.navLinks} ${mobileMenuOpen ? styles.navLinksActive : ''}`}>
          <li>
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className={navClass('/')}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className={navClass('/shop')}>
              Shop
            </Link>
          </li>
          <li>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className={navClass('/about')}>
              Our Story
            </Link>
          </li>
          <li>
            <Link href="/quality" onClick={() => setMobileMenuOpen(false)} className={navClass('/quality')}>
              Purity &amp; Quality
            </Link>
          </li>
          <li>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className={navClass('/contact')}>
              Contact
            </Link>
          </li>
        </nav>

        {/* Action Buttons (Cart, Admin Login, Mobile Menu) */}
        <div className={styles.actions}>
          {/* Admin Dashboard Lock Icon */}
          {/* <Link href="/admin/login" title="Admin Portal" className={styles.iconBtn}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </Link> */}

          {/* Cart Icon */}
          <Link href="/cart" title="Shopping Cart" className={styles.iconBtn}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
