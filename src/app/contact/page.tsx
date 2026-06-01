import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ContactForm } from '@/components/contact/ContactForm';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Contact Dhanti Masala | Bangalore Homemade Food Brand',
  description: 'Get in touch with Dhanti Masala for authentic Karnataka homemade food products, wholesale enquiries, customer support, and order assistance.',
};

export default function ContactPage() {
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
                    Every batch of Sambar Powder and Ragi Hurihittu is lovingly prepared in our family kitchen in Peenya, Bangalore.
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
                    <span className={styles.infoValue}>hello@dhantifoods.com</span>
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
                    <span className={styles.infoValue}>+91 866-0881905</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Form */}
              <ContactForm />

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
