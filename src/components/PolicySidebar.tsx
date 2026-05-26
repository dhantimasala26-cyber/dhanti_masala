'use client';

import React from 'react';
import Link from 'next/link';
import styles from '@/app/policies.module.css';

interface PolicySidebarProps {
  activePath: string;
}

export default function PolicySidebar({ activePath }: PolicySidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <h3 className={styles.sidebarTitle}>Document Center</h3>
      <nav>
        <ul className={styles.navList}>
          <li>
            <Link 
              href="/terms" 
              className={`${styles.navLink} ${activePath === '/terms' ? styles.activeNavLink : ''}`}
            >
              Terms & Conditions
            </Link>
          </li>
          <li>
            <Link 
              href="/privacy" 
              className={`${styles.navLink} ${activePath === '/privacy' ? styles.activeNavLink : ''}`}
            >
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link 
              href="/payment-policy" 
              className={`${styles.navLink} ${activePath === '/payment-policy' ? styles.activeNavLink : ''}`}
            >
              Payment Policy
            </Link>
          </li>
          <li>
            <Link 
              href="/return-policy" 
              className={`${styles.navLink} ${activePath === '/return-policy' ? styles.activeNavLink : ''}`}
            >
              Return & Refund Policy
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
