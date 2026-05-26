'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import { apiUrl } from '@/lib/api';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // If it's the login page, no authorization check needed
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    const checkSession = async () => {
      try {
        const res = await fetch(apiUrl('/api/auth/session'));
        const data = await res.json();
        
        if (data.authenticated) {
          setAuthorized(true);
        } else {
          router.push('/admin/login');
        }
      } catch (err) {
        console.error('Session check failed:', err);
        router.push('/admin/login');
      } finally {
        setChecking(false);
      }
    };

    checkSession();
  }, [pathname, isLoginPage, router]);

  if (checking) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'var(--color-bg-light)',
        fontFamily: 'var(--font-body)',
        color: 'var(--color-text-dark)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="3" className="spin" style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }}>
            <circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10"/>
          </svg>
          <p>Verifying secure session...</p>
        </div>
      </div>
    );
  }

  // If it's the login page, render child directly (without sidebar wrapper)
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If authorized, render with admin sidebar
  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#F8F9FA' }}>
      <Sidebar />
      <main style={{ 
        marginLeft: '260px', 
        flexGrow: 1, 
        padding: '2.5rem', 
        minHeight: '100vh',
        width: 'calc(100% - 260px)',
        overflowX: 'auto'
      }}>
        {children}
      </main>
    </div>
  );
}
