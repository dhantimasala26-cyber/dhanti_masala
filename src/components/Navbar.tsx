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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-01.webp" alt="Dhanti Foods Logo" width="32" height="32" className={styles.logoImg} />
          <div className={styles.logoGroup}>
            <span>Dhanti Foods</span>
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
