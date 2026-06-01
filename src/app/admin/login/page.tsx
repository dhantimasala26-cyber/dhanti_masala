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
  const [showPassword, setShowPassword] = useState(false);

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
              placeholder="admin@dhantifoods.com"
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
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? 'text' : 'password'}
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
                  height: '46px',
                  paddingRight: '2.75rem',
                  width: '100%'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(232, 223, 215, 0.5)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s ease',
                  outline: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(232, 223, 215, 0.5)'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
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
