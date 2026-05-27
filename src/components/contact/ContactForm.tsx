'use client';

import React, { useState } from 'react';
import styles from '@/app/contact/page.module.css';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    phone: '',
    submit: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation errors as the user types
    if (name === 'email' || name === 'phone') {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
        submit: ''
      }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', phone: '', submit: '' };

    // Email Regex Validation (RFC 5322)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address (e.g. name@example.com).';
      isValid = false;
    }

    // Phone Regex Validation (Indian 10-digit mobile format: optional +91/0, followed by 10 digits starting with 6-9)
    if (formData.phone.trim() !== '') {
      const phoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(false);
    setErrors({ email: '', phone: '', submit: '' });

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
      } else {
        setErrors((prev) => ({
          ...prev,
          submit: data.message || 'Failed to send message. Please try again.'
        }));
      }
    } catch (err) {
      console.error('Contact submission error:', err);
      setErrors((prev) => ({
        ...prev,
        submit: 'A network error occurred. Please try again later.'
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formCard}>
      <h2 className={styles.formTitle}>Send Us a Message</h2>

      {submitted && (
        <div className={styles.successAlert} style={{ backgroundColor: 'rgba(46, 90, 68, 0.1)', color: 'var(--color-success)', border: '1px solid rgba(46, 90, 68, 0.2)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
          Thank you! Your message has been received. We'll get back to you shortly.
        </div>
      )}

      {errors.submit && (
        <div style={{ backgroundColor: 'rgba(194, 68, 68, 0.1)', color: 'var(--color-error)', border: '1px solid rgba(194, 68, 68, 0.2)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input
            type="text"
            name="name"
            required
            className="form-control"
            placeholder="e.g. Ramesh Kumar"
            value={formData.name}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <input
            type="email"
            name="email"
            required
            className="form-control"
            placeholder="e.g. ramesh@gmail.com"
            value={formData.email}
            onChange={handleInputChange}
            style={errors.email ? { borderColor: 'var(--color-error)' } : {}}
          />
          {errors.email && (
            <span style={{ color: 'var(--color-error)', fontSize: '0.78rem', marginTop: '0.2rem', fontWeight: 500 }}>
              {errors.email}
            </span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number (Optional)</label>
          <input
            type="tel"
            name="phone"
            className="form-control"
            placeholder="e.g. 9876543210"
            value={formData.phone}
            onChange={handleInputChange}
            style={errors.phone ? { borderColor: 'var(--color-error)' } : {}}
          />
          {errors.phone && (
            <span style={{ color: 'var(--color-error)', fontSize: '0.78rem', marginTop: '0.2rem', fontWeight: 500 }}>
              {errors.phone}
            </span>
          )}
        </div>

        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label className="form-label">Your Message *</label>
          <textarea
            name="message"
            required
            rows={5}
            className="form-control"
            placeholder="Write your query or feedback here..."
            style={{ fontFamily: 'inherit', resize: 'vertical' }}
            value={formData.message}
            onChange={handleInputChange}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', height: '48px' }}
          disabled={loading}
        >
          {loading ? 'Sending Message...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
