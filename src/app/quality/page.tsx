import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export const revalidate = 0; // Dynamic rendering

const defaultQualitySteps = [
  {
    title: "Careful Sourcing",
    description: "We source our ingredients directly from local farming cooperatives in Karnataka. Only grade-A, dry red chillies, premium coriander seeds, and whole organic finger millets (Ragi) are selected."
  },
  {
    title: "Dry Roasting",
    description: "Unlike commercial brands that flash-steam or oven-bake ingredients, we dry-roast everything in large traditional iron pans (kadhais) at low heat. This releases the essential oils that give spices their rich natural aroma."
  },
  {
    title: "Gentle Milling",
    description: "High-speed industrial grinders generate excessive heat, which burns off the delicate aromatic compounds. We use slow-speed stone mills that preserve the natural flavors and create a coarser, home-style texture."
  },
  {
    title: "Hygienic Moisture-Lock Packing",
    description: "Spices start losing aroma the moment they are ground. Our products are cooled and packed immediately into triple-layer moisture-lock pouches, preserving freshness for up to 6 months without any chemical preservatives."
  }
];

export default async function QualityPage() {
  let steps = defaultQualitySteps;

  try {
    const { data } = await supabase
      .from('cms_content')
      .select('*')
      .eq('key', 'quality_process')
      .single();
    
    if (data && data.value && Array.isArray(data.value.steps)) {
      steps = data.value.steps;
    }
  } catch (error) {
    console.error("Database fetch error, using quality steps fallback:", error);
  }

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
            <span className={styles.subtitle}>Purity Pledge</span>
            <h1 className={styles.title}>How We Guarantee Purity</h1>
            <p className={styles.tagline}>
              We don't cut corners. From farm selections to slow stone-grinding, our processes prioritize your health and authentic taste.
            </p>
          </div>
        </section>

        {/* Process Timeline */}
        <section className={`section-padding ${styles.processSection}`}>
          <div className="container">
            <div className="section-title">
              <h2>The 4-Step Craft Process</h2>
            </div>
            
            <div className={styles.processTimeline}>
              {steps.map((step, idx) => (
                <div key={idx} className={styles.processItem}>
                  <div className={styles.numberBox}>
                    0{idx + 1}
                  </div>
                  <div className={styles.itemContent}>
                    <h3 className={styles.itemTitle}>{step.title}</h3>
                    <p className={styles.itemText}>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pledge Section */}
        <section className={`section-padding ${styles.purityPledge}`}>
          <div className="container">
            <div className={styles.pledgeGrid}>
              <div className={styles.pledgeContent}>
                <h2>Our 100% Purity Checklist</h2>
                <p>
                  At Dhanti Masala, we believe food should heal, not harm. That's why we maintain strict control over every ingredient that enters our small kitchen. We guarantee that you will never find any of the following in our packets:
                </p>
                
                <div className={styles.badgeGroup}>
                  <div className={styles.badgeCard}>
                    <div className={styles.badgeIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <div>
                      <h4 className={styles.badgeTitle}>No Anti-Caking Agents</h4>
                      <p className={styles.badgeText}>We do not add silicon dioxide or sodium aluminosilicate to force free-flowing powders.</p>
                    </div>
                  </div>

                  <div className={styles.badgeCard}>
                    <div className={styles.badgeIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className={styles.badgeTitle}>No Artificial Colors</h4>
                      <p className={styles.badgeText}>The vibrant red of our Rasam Powder comes solely from premium, natural Byadagi chillies.</p>
                    </div>
                  </div>

                  <div className={styles.badgeCard}>
                    <div className={styles.badgeIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                      </svg>
                    </div>
                    <div>
                      <h4 className={styles.badgeTitle}>No MSG or Flavor Enhancers</h4>
                      <p className={styles.badgeText}>The deep umami flavour in our spices comes from pure fenugreek, pepper, and fresh curry leaves.</p>
                    </div>
                  </div>

                  <div className={styles.badgeCard}>
                    <div className={styles.badgeIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <div>
                      <h4 className={styles.badgeTitle}>100% Traditional Ragi</h4>
                      <p className={styles.badgeText}>Our Ragi Hurihittu uses sprouted finger millet grains, naturally rich in organic calcium.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.pledgeImageWrapper}>
                <img 
                  src="/ragi_hurihittu.jpg" 
                  alt="Pure and organic finger millet grains" 
                  className={styles.pledgeImg}
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
