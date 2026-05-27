'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerGrid}>
          {/* Brand Info */}
          <div className={styles.brandCol}>
            <div className={styles.logo}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-01.webp" alt="Dhanti Foods Logo" width="32" height="32" className={styles.logoImg} />
              <div className={styles.logoGroup}>
                <span>Dhanti Foods</span>
                <span className={styles.logoSub}>Homemade Purity</span>
              </div>
            </div>
            <p className={styles.description}>
              Handcrafting the finest, purest homemade masalas and health mixes in Bangalore. Preserving traditional recipes from Karnataka, prepared in small batches, without preservatives.
            </p>
          </div>

          {/* Shop links */}
          <div>
            <h3 className={styles.title}>Shop</h3>
            <ul className={styles.links}>
              <li>
                <Link href="/shop" className={styles.link}>
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products/sambar-powder" className={styles.link}>
                  Sambar Powder
                </Link>
              </li>
              <li>
                <Link href="/products/ragi-hurihittu" className={styles.link}>
                  Ragi Hurihittu
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className={styles.title}>Quick Links</h3>
            <ul className={styles.links}>
              <li>
                <Link href="/about" className={styles.link}>
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/quality" className={styles.link}>
                  Purity Standards
                </Link>
              </li>
              <li>
                <Link href="/contact" className={styles.link}>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className={styles.link}>
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className={styles.title}>Policies</h3>
            <ul className={styles.links}>
              <li>
                <Link href="/terms" className={styles.link}>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={styles.link}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/payment-policy" className={styles.link}>
                  Payment Policy
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className={styles.link}>
                  Return & Refund
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details & Newsletter */}
          <div className={styles.newsletter}>
            <h3 className={styles.title}>Connect With Us</h3>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span style={{ fontSize: '0.88rem', lineHeight: '1.4' }}>NO 28, 1st Floor, 8th Cross, Ganapathy Nagar, Rajagopal Nagar Area, II Stage Peenya, Bangalore, B.B.M.P West, Karnataka - 560058</span>
              </div>
              <div className={styles.contactItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>+91 866-0881905</span>
              </div>
            </div>

            <form onSubmit={handleSubscribe} className={styles.newsletterForm}>
              <input
                type="email"
                required
                placeholder="Enter email for weekly recipes"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
              />
              <button type="submit" aria-label="Subscribe" className={styles.newsletterBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
            {subscribed && (
              <span style={{ fontSize: '0.85rem', color: 'var(--color-success)', marginTop: '-8px' }}>
                Thank you! You are subscribed to our recipe newsletter.
              </span>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className={styles.copyright}>
          <span>&copy; {new Date().getFullYear()} Dhanti Masala. All rights reserved. Handcrafted in Namma Bengaluru.</span>
          <div className={styles.socials}>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className={styles.socialIcon} aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href="https://whatsapp.com" target="_blank" rel="noreferrer" className={styles.socialIcon} aria-label="WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
