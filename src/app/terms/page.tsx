import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import PolicySidebar from '@/components/PolicySidebar';
import styles from '@/app/policies.module.css';

export const metadata = {
  title: 'Terms & Conditions - Dhanti Masala',
  description: 'Read the terms of use and conditions governing purchase and interactions on Dhanti Masala platforms in India.',
};

export default function TermsPage() {
  return (
    <>
      <Navbar />

      <main>
        {/* Banner Header */}
        <section className={styles.header}>
          <div className={styles.headerBackground} />
          <div className={`container ${styles.headerContent}`}>
            <span className={styles.subtitle}>Legal Agreements</span>
            <h1 className={styles.title}>Terms & Conditions</h1>
          </div>
        </section>

        {/* Policy Grid Container */}
        <section className={styles.policyContainer}>
          <div className="container">
            <div className={styles.policyGrid}>
              
              <PolicySidebar activePath="/terms" />

              <div className={styles.content}>
                <span className={styles.lastUpdated}>Last Updated: May 26, 2026</span>
                
                <div className={styles.infoBox}>
                  <strong>FSSAI Registration & Food Safety Compliance:</strong> All products supplied by Dhanti Masala are manufactured, packed, and distributed in accordance with the Food Safety and Standards Authority of India (FSSAI) guidelines. By placing an order, you acknowledge that our products are handcrafted in small batches using traditional home kitchen methods.
                </div>

                <p>
                  Welcome to <strong>Dhanti Masala</strong>. These Terms & Conditions govern your use of our website (dhantimasala.com) and the purchase of our home-style spices, health mixes, and traditional blends. By accessing or using this website, you agree to be bound by these terms. If you do not agree to all terms, please do not use our services.
                </p>

                <h2>1. General & Digital Commerce Compliance</h2>
                <p>
                  This website is operated by Dhanti Masala, Bengaluru, Karnataka, India. This document is published in accordance with the provisions of Rule 3(1) of the Information Technology (Intermediaries Guidelines) Rules, 2011, and the Consumer Protection (E-Commerce) Rules, 2020 under the Indian Consumer Protection Act, 2019.
                </p>
                <p>
                  To register an account or purchase products, you must be at least 18 years of age or accessing the site under the supervision of a parent or guardian. You agree to provide accurate, current, and complete information during checkout or registration.
                </p>

                <h2>2. Product Description & Batch Variations</h2>
                <p>
                  At Dhanti Masala, we take absolute pride in our handcrafted, small-batch preparations.
                </p>
                <ul>
                  <li><strong>Natural Ingredients:</strong> We do not use chemical stabilizers, artificial colorants, or anti-caking agents.</li>
                  <li><strong>Sensory Variations:</strong> Due to seasonal crops and manual grinding techniques, subtle variations in texture, color, and aroma are natural and should be expected.</li>
                  <li><strong>Shelf Life:</strong> Because our products contain no chemical preservatives, please follow the storage instructions (dry, airtight containers) to ensure longevity and freshness.</li>
                </ul>

                <h2>3. Pricing, GST & Billing</h2>
                <p>
                  All prices listed on the site are in Indian Rupees (INR) and are inclusive of GST (Goods and Services Tax) where applicable, unless specified otherwise. We reserve the right to modify prices of any product without prior notice. Delivery charges are calculated and displayed during checkout based on the delivery location in India.
                </p>

                <h2>4. Shipping and Delivery Timelines</h2>
                <p>
                  We strive to dispatch orders within 24 to 48 hours of payment confirmation.
                </p>
                <ul>
                  <li><strong>Bengaluru Metro:</strong> Delivery typically takes 1 to 3 business days.</li>
                  <li><strong>Rest of Karnataka & South India:</strong> Delivery typically takes 3 to 5 business days.</li>
                  <li><strong>Rest of India:</strong> Delivery typically takes 5 to 7 business days.</li>
                </ul>
                <p>
                  Dhanti Masala partners with reputed third-party logistics firms. While we endeavor to deliver within estimated times, delays due to transport interruptions, weather conditions, or public holidays are beyond our direct control.
                </p>

                <h2>5. Intangible Property & Trademarks</h2>
                <p>
                  The logo, brand name "Dhanti Masala", tagline, website design, text content, and photos are the exclusive intellectual property of Dhanti Masala. Any unauthorized reproduction, commercial distribution, or modifications of our digital assets without explicit written consent is strictly prohibited and liable to legal action under Indian copyright laws.
                </p>

                <h2>6. Governing Law & Jurisdiction</h2>
                <p>
                  These terms are governed by and construed in accordance with the laws of India. Any disputes arising from these terms or your purchase of products from Dhanti Masala shall be subject to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka, India.
                </p>

                <h2>7. Contact Information</h2>
                <p>
                  For questions, grievances, or legal notices, please write to us at:
                  <br />
                  <strong>Dhanti Masala Grievance Cell</strong>
                  <br />
                  NO 28, 1ST FLOOR, 8TH CROSS, GANAPATHY NAGAR, RAJAGOPAL NAGAR AREA, II STAGE PEENYA, BANGALORE, B.B.M.P West, Karnataka - 560058
                  <br />
                  Email: support@dhantimasala.com | Phone: +91 866-0881905
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
