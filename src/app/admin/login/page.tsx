'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiUrl } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Interactive styling focus states
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/admin');
      } else {
        setError(data.message || 'Invalid admin credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('A connection error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundImage: 'linear-gradient(135deg, rgba(29, 21, 17, 0.75) 0%, rgba(15, 10, 8, 0.85) 100%), url("/images/admin_login_bg.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      fontFamily: 'var(--font-body)',
      padding: '1.5rem',
      position: 'relative'
    }}>
      <div style={{
        backgroundColor: 'rgba(34, 25, 21, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: '3rem 2.5rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(216, 141, 67, 0.3)', // Saffron tinted translucent border
        boxShadow: '0 24px 50px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        width: '100%',
        maxWidth: '430px',
        animation: 'slideUp 0.6s ease-out',
        color: '#FAF7F2'
      }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-01.webp" alt="Dhanti Foods Logo" width="48" height="48" style={{ display: 'block', margin: '0 auto 1.2rem', objectFit: 'contain', borderRadius: '4px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} />
          <h1 style={{ fontSize: '1.9rem', marginBottom: '0.35rem', color: '#FAF7F2', fontFamily: 'var(--font-title)', letterSpacing: '0.5px' }}>Dhanti Foods</h1>
          <p style={{ color: 'rgba(232, 223, 215, 0.65)', fontSize: '0.88rem', fontWeight: 500 }}>Secure Administration Portal</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(194, 68, 68, 0.15)',
            border: '1px solid rgba(194, 68, 68, 0.3)',
            color: '#FFB8B8',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
          <div className="form-group" style={{ margin: 0, gap: '0.4rem' }}>
            <label className="form-label" style={{ color: 'rgba(232, 223, 215, 0.95)', fontSize: '0.88rem', fontWeight: 600 }}>Admin Email</label>
            <input
              type="email"
              required
              className="form-control"
              placeholder="admin@dhantimasala.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              style={{
                backgroundColor: 'rgba(20, 14, 11, 0.65)',
                border: `1px solid ${emailFocused ? 'var(--color-secondary)' : 'rgba(232, 223, 215, 0.2)'}`,
                color: '#FAF7F2',
                boxShadow: emailFocused ? '0 0 0 3px rgba(216, 141, 67, 0.25)' : 'none',
                outline: 'none',
                transition: 'var(--transition-smooth)',
                height: '46px'
              }}
            />
          </div>

          <div className="form-group" style={{ margin: 0, gap: '0.4rem' }}>
            <label className="form-label" style={{ color: 'rgba(232, 223, 215, 0.95)', fontSize: '0.88rem', fontWeight: 600 }}>Password</label>
            <input
              type="password"
              required
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPassFocused(true)}
              onBlur={() => setPassFocused(false)}
              style={{
                backgroundColor: 'rgba(20, 14, 11, 0.65)',
                border: `1px solid ${passFocused ? 'var(--color-secondary)' : 'rgba(232, 223, 215, 0.2)'}`,
                color: '#FAF7F2',
                boxShadow: passFocused ? '0 0 0 3px rgba(216, 141, 67, 0.25)' : 'none',
                outline: 'none',
                transition: 'var(--transition-smooth)',
                height: '46px'
              }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              height: '46px',
              marginTop: '1.25rem',
              backgroundColor: 'var(--color-primary)',
              color: '#FAF7F2',
              fontSize: '0.98rem',
              letterSpacing: '0.5px',
              border: 'none',
              boxShadow: '0 4px 14px rgba(194, 89, 63, 0.3)'
            }}
            disabled={loading}
          >
            {loading ? 'Verifying Credentials...' : 'Access Dashboard'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/" style={{
            fontSize: '0.88rem',
            color: 'var(--color-secondary)',
            fontWeight: '600',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'var(--transition-smooth)'
          }}>
            &larr; Back to Shopfront
          </Link>
        </div>
      </div>
    </div>
  );
}
