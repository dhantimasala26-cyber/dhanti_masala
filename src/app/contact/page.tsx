'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import styles from './page.module.css';

export default function ContactPage() {
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
    <>
      <Navbar />

      <main style={{ backgroundColor: 'var(--color-bg-light)' }}>
        {/* Page Banner */}
        <section className={styles.header}>
          <div 
            className={styles.headerBackground} 
            style={{ backgroundImage: `url('/hero_masala.jpg')` }} 
          />
          <div className={`container ${styles.headerContent}`}>
            <span className={styles.subtitle}>Get in Touch</span>
            <h1 className={styles.title}>Contact Dhanti Masala</h1>
            <p className={styles.tagline}>
              Questions about our processes? Bulk orders? Drop us a line. We would love to hear from you.
            </p>
          </div>
        </section>

        {/* Contact info and Form */}
        <section className={`section-padding ${styles.contactSection}`}>
          <div className="container">
            <div className={styles.layout}>
              
              {/* Left Column: Contact details */}
              <div className={styles.infoCard}>
                <div>
                  <h2 className={styles.infoTitle}>Our Bangalore Kitchen</h2>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                    Every batch of Rasam Powder and Ragi Hurihittu is lovingly prepared in our family kitchen in Peenya, Bangalore.
                  </p>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className={styles.infoText}>
                    <span className={styles.infoLabel}>Kitchen Address</span>
                    <span className={styles.infoValue} style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                      NO 28, 1ST FLOOR, 8TH CROSS,<br />
                      GANAPATHY NAGAR, RAJAGOPAL NAGAR AREA,<br />
                      II STAGE PEENYA, BANGALORE,<br />
                      B.B.M.P West, Karnataka - 560058
                    </span>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div className={styles.infoText}>
                    <span className={styles.infoLabel}>Email Address</span>
                    <span className={styles.infoValue}>hello@dhantimasala.com</span>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div className={styles.infoText}>
                    <span className={styles.infoLabel}>Call/WhatsApp</span>
                    <span className={styles.infoValue}>+91 98450 12345</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Form */}
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

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
