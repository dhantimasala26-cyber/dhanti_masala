'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import styles from './Navbar.module.css';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { cartItems } = useCart();
  const { customer, logout } = useAuth();
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
          
          {/* Mobile Auth Links (hidden on desktop if we use icons, but let's show them here for simplicity) */}
          {customer ? (
            <>
              <li className={styles.mobileOnly}>
                <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className={navClass('/orders')}>
                  My Orders
                </Link>
              </li>
              <li className={styles.mobileOnly}>
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className={styles.navLink} style={{background:'none', border:'none', cursor:'pointer', textAlign:'left'}}>
                  Logout ({customer.name})
                </button>
              </li>
            </>
          ) : (
            <li className={styles.mobileOnly}>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className={navClass('/login')}>
                Login / Sign Up
              </Link>
            </li>
          )}
        </nav>

        {/* Action Buttons (Auth, Cart, Mobile Menu) */}
        <div className={styles.actions}>
          {/* Auth Icon Desktop */}
          <div className={styles.desktopOnly} style={{ marginRight: '0.5rem' }}>
            {customer ? (
              <div className={styles.dropdownContainer}>
                <button className={styles.iconBtn} aria-label="Profile">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </button>
                <div className={styles.dropdownMenu}>
                  <div className={styles.userName}>{customer.name}</div>
                  <Link href="/orders" className={styles.dropdownItem}>
                    My Orders
                  </Link>
                  <button onClick={logout} className={styles.dropdownItem}>
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" title="Login" className={styles.iconBtn}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              </Link>
            )}
          </div>
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
