'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiUrl } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = Enter Email, 2 = Verify OTP & Reset Password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoOtp, setDemoOtp] = useState('');

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDemoOtp('');

    try {
      const res = await fetch(apiUrl('/api/auth/customer/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast('OTP sent successfully to your email!', 'success');
        setStep(2);
        if (data.otp) {
          setDemoOtp(data.otp);
        }
      } else {
        setError(data.detail || 'Failed to send OTP. Please check your email.');
      }
    } catch (err) {
      console.error(err);
      setError('A connection error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch(apiUrl('/api/auth/customer/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast('Password reset successful! Redirecting to login...', 'success');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.detail || 'Failed to reset password. Please check the OTP.');
      }
    } catch (err) {
      console.error(err);
      setError('A connection error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: 'var(--color-bg-light)', minHeight: '80vh', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '400px', width: '100%', padding: '2rem', backgroundColor: 'var(--color-bg-white)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', margin: '2rem auto' }}>
          <h1 style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '1.5rem', fontFamily: 'var(--font-title)', color: 'var(--color-primary)' }}>
            Reset Password
          </h1>

          {error && (
            <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {demoOtp && (
            <div style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem', border: '1px dashed #2e7d32' }}>
              <strong>Demo Mode OTP:</strong> {demoOtp} (Use this code to verify)
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '0.5rem' }}>
                Enter your registered email address below, and we will send you a 6-digit OTP code to verify your identity.
              </p>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                {loading ? 'Sending OTP...' : 'Send Reset OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '0.5rem' }}>
                Enter the 6-digit OTP code sent to your email and specify a secure new password.
              </p>
              
              <div className="form-group">
                <label className="form-label">Verification OTP</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  className="form-control"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  style={{ textAlign: 'center', letterSpacing: '4px', fontWeight: 'bold', fontSize: '1.2rem' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>

              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => { setStep(1); setError(''); }}
                style={{ width: '100%', padding: '0.5rem 1.75rem', fontSize: '0.9rem' }}
              >
                Go Back
              </button>
            </form>
          )}

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
            Remembered your password? <Link href="/login" style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>Back to Login</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
