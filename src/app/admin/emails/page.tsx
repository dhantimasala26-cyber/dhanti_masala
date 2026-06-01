'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { apiUrl } from '@/lib/api';

function EmailComposer() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [templateType, setTemplateType] = useState('direct');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const subjectParam = searchParams.get('subject');
    if (emailParam) setEmail(emailParam);
    if (subjectParam) setSubject(subjectParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !subject || !message) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    setSending(true);
    try {
      const res = await fetch(apiUrl('/api/admin/send-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          subject,
          message,
          template_type: templateType,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Email dispatched successfully!', 'success');
        setMessage('');
      } else {
        showToast(data.message || 'Failed to dispatch email.', 'error');
      }
    } catch (err) {
      console.error('Error dispatching email:', err);
      showToast('Network error dispatching email.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Direct Customer Mailer</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          Send custom transactional replies or marketing campaigns directly to any customer via ZeptoMail.
        </p>
      </div>

      <div style={{
        backgroundColor: 'var(--color-bg-white)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-md)',
        padding: '2.5rem',
      }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Recipient Email Address <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. customer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={sending}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Subject Line <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Regarding your recent inquiry"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              disabled={sending}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Email Layout Theme <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <select
              className="form-control"
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value)}
              disabled={sending}
              style={{ width: '100%', appearance: 'none', background: 'white' }}
            >
              <option value="direct">Direct Letter / Reply Layout (Support & Queries)</option>
              <option value="promo">Vibrant Promotional Banner Layout (Campaigns & Special Offers)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Message Content <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <textarea
              className="form-control"
              placeholder="Write your email body here. Double-press Enter to create paragraph breaks."
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              disabled={sending}
              style={{ resize: 'vertical', minHeight: '160px', lineHeight: '1.6' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={sending}
              onClick={() => {
                setEmail('');
                setSubject('');
                setMessage('');
              }}
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              Reset Form
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={sending}
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              {sending ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="spin"
                    style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }}
                  >
                    <circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10" />
                  </svg>
                  Sending...
                </>
              ) : (
                '✉️ Send Email'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminEmailsPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Loading email composer...
      </div>
    }>
      <EmailComposer />
    </Suspense>
  );
}
