import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'About Dhanti Masala | Traditional Karnataka Homemade Food Brand',
  description: 'Learn about Dhanti Masala, a Bangalore-based homemade food brand preserving authentic Karnataka recipes through premium spices, traditional preparation methods, and quality ingredients.',
};

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main>
        {/* Banner Header */}
        <section className={styles.header}>
          <div 
            className={styles.headerBackground} 
            style={{ backgroundImage: `url('/hero_masala.jpg')` }} 
          />
          <div className={`container ${styles.headerContent}`}>
            <span className={styles.subtitle}>Our Story</span>
            <h1 className={styles.title}>The Heritage of Dhanti Masala</h1>
            <p className={styles.tagline}>
              Bringing the pure, unadulterated taste of traditional Karnataka kitchens straight to your dining table.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className={`section-padding ${styles.storySection}`}>
          <div className="container">
            <div className={styles.storyGrid}>
              <div className={styles.imageWrapper}>
                <img 
                  src="/hero_masala.jpg" 
                  alt="Traditional Indian spice roasting" 
                  className={styles.storyImg}
                />
              </div>
              <div className={styles.content}>
                <h2 className={styles.highlight}>
                  "It started in a quiet Bangalore kitchen, with the comforting aroma of hand-roasted pepper, coriander, and fresh curry leaves."
                </h2>
                <p className={styles.text}>
                  Dhanti Masala was born out of a simple family tradition. For decades, our grandmother prepared her signature Sambar Powder and roasted Ragi Hurihittu every month, sending packages to relatives across Bangalore and Mysore. The recipe was never written down; it was a matter of touch, aroma, and years of experience.
                </p>
                <p className={styles.text}>
                  Seeing how commercial options lacked the depth of aroma and purity—relying heavily on artificial colors, stabilizers, and cheap fillers—we decided to share our family kitchen secrets with the world. We named the brand "Dhanti" to represent the grounding, ancient culinary wisdom of Karnataka.
                </p>
                <p className={styles.text}>
                  Today, we continue to roast and grind in small, weekly batches. We do not use commercial machinery that heats and strips spices of their natural essential oils. Every packet is a pledge of absolute purity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recipe Expert Section - Mysore Jayamma */}
        <section className={`section-padding ${styles.expertSection}`}>
          <div className="container">
            <div className={styles.expertGrid}>
              <div className={styles.content}>
                <span className={styles.subtitle} style={{ color: 'var(--color-primary)' }}>The Master of Spices</span>
                <h2 style={{ fontSize: '2.2rem', marginBottom: '1.5rem', fontFamily: 'var(--font-title)' }}>Meet Mysore Jayamma</h2>
                <h3 className={styles.highlight} style={{ fontSize: '1.25rem', fontWeight: 500, fontStyle: 'italic', marginBottom: '1.5rem' }}>
                  "The secret to a perfect masala isn't just the ratio; it's the temperature of the roast and the patience in the grind."
                </h3>
                <p className={styles.text}>
                  Mysore Jayamma is the culinary custodian behind every spice blend at Dhanti Masala. Born and raised in Mysore, she spent over five decades mastering the traditional food heritage of Karnataka. Her expertise in raw grain selection, ingredient pairings, and slow dry-roasting is the foundation of our recipes.
                </p>
                <p className={styles.text}>
                  Jayamma personally guides the preparation of our signature Sambar Powder and roasted Ragi Hurihittu, ensuring that the ingredients are dry-roasted at low temperatures in iron kadhais to lock in natural essential oils. Her strict standards of purity mean we never compromise on quality or rely on artificial additives.
                </p>
              </div>
              <div className={styles.imageWrapper} style={{ height: '420px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img 
                  src="/images/mysore_jayamma.jpg" 
                  alt="Mysore Jayamma - Recipe Expert" 
                  className={styles.storyImg}
                  style={{ objectPosition: 'center 20%' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className={`section-padding ${styles.valuesSection}`}>
          <div className="container">
            <div className="section-title">
              <h2>Our Core Principles</h2>
            </div>
            <div className={styles.valuesGrid}>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h3 className={styles.valueTitle}>Absolute Freshness</h3>
                <p className={styles.valueText}>
                  We do not warehouse our products for months. We prepare our masalas weekly, packing them immediately to lock in the intense aroma.
                </p>
              </div>

              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3 className={styles.valueTitle}>100% Purity</h3>
                <p className={styles.valueText}>
                  Zero preservatives, zero artificial colors, and zero anti-caking chemicals. What you eat is exactly what nature provided.
                </p>
              </div>

              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
                <h3 className={styles.valueTitle}>Community Sourced</h3>
                <p className={styles.valueText}>
                  We source our raw grains and spices directly from local Karnataka farming cooperatives, ensuring fair wages and top-grade quality.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className={`section-padding ${styles.ctaSection}`}>
          <div className="container">
            <h2 className={styles.ctaTitle}>Taste the Purity Yourself</h2>
            <p className={styles.ctaText}>
              Discover our signature Sambar Powder and roasted Ragi Hurihittu, prepared in limited small batches.
            </p>
            <Link href="/shop" className="btn btn-accent">
              Explore Our Shop
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
