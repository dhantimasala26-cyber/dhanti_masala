import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import PolicySidebar from '@/components/PolicySidebar';
import styles from '@/app/policies.module.css';

export const metadata = {
  title: 'Privacy Policy - Dhanti Masala',
  description: 'Learn how Dhanti Masala collects, stores, and protects customer personal data under the Indian Information Technology Act.',
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />

      <main>
        {/* Banner Header */}
        <section className={styles.header}>
          <div className={styles.headerBackground} />
          <div className={`container ${styles.headerContent}`}>
            <span className={styles.subtitle}>Privacy Center</span>
            <h1 className={styles.title}>Privacy Policy</h1>
          </div>
        </section>

        {/* Policy Grid Container */}
        <section className={styles.policyContainer}>
          <div className="container">
            <div className={styles.policyGrid}>
              
              <PolicySidebar activePath="/privacy" />

              <div className={styles.content}>
                <span className={styles.lastUpdated}>Last Updated: May 26, 2026</span>

                <div className={styles.infoBox}>
                  <strong>Information Technology Act Compliance:</strong> This Privacy Policy represents a legally binding document published in accordance with the provisions of Section 43A of the Information Technology Act, 2000 and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 (SPDI Rules).
                </div>

                <p>
                  Dhanti Masala ("we", "our", "us") values the trust you place in us. This privacy policy explains what personal data we collect when you visit our website (dhantifoods.com), place an order, or subscribe to our newsletter, and how we protect and use that data.
                </p>

                <h2>1. Information We Collect</h2>
                <p>
                  We only collect personal information that is necessary to provide you with our products and services. This includes:
                </p>
                <ul>
                  <li><strong>Identity Data:</strong> Full name, billing address, shipping address, telephone/mobile numbers, and email address.</li>
                  <li><strong>Transaction Data:</strong> Details about payments made, products ordered, and order history. (Note: We do not store credit card or bank login details on our servers; payments are processed securely by Razorpay).</li>
                  <li><strong>Technical Data:</strong> Internet Protocol (IP) address, browser details, and anonymous usage patterns collected via cookies to enhance your browsing experience.</li>
                </ul>

                <h2>2. How We Use Your Data</h2>
                <p>
                  We process your data based on lawful grounds, including to fulfill our contract with you or for legitimate business interests:
                </p>
                <ul>
                  <li>To process and deliver your orders, and send updates regarding your delivery status.</li>
                  <li>To send you transactional messages, order confirmations, and invoices via email or SMS/WhatsApp.</li>
                  <li>To improve website performance, category layouts, and user experience.</li>
                  <li>To send newsletter emails containing traditional recipes and discounts (only if you opt-in to our newsletter; you can unsubscribe at any time).</li>
                </ul>

                <h2>3. Data Sharing & Third-Party Processors</h2>
                <p>
                  We do not sell, rent, or trade your personal data with marketing agencies or third parties. We share your information only with trusted partners required to complete your transactions:
                </p>
                <ul>
                  <li><strong>Logistics Partners:</strong> Courier companies (e.g., Delhivery, Blue Dart, Speed Post) to deliver your spice packets.</li>
                  <li><strong>Payment Gateway:</strong> Razorpay Software Private Limited, to process your cashless transactions securely. Razorpay handles payment details in compliance with PCI-DSS guidelines.</li>
                  <li><strong>Legal Compliance:</strong> We may disclose information if required by government authorities or court mandates under the laws of India.</li>
                </ul>

                <h2>4. Data Storage and Retention</h2>
                <p>
                  All customer data is stored securely on servers located in databases that employ strict access controls. We retain your information for as long as necessary to process orders, handle tax/GST audit requirements, and resolve customer support queries.
                </p>

                <h2>5. Cookies Policy</h2>
                <p>
                  We use cookies to keep track of items in your shopping cart and save your session state. You can choose to disable cookies in your browser settings, though doing so may prevent certain interactive features of the website (such as checkout and cart storage) from functioning properly.
                </p>

                <h2>6. Your Consent & Rights</h2>
                <p>
                  By using our website or providing your details, you consent to the collection and use of your information in accordance with this policy. Under the Indian DPDP (Digital Personal Data Protection) framework, you have the right to review, update, or request the deletion of your personal data by contacting our Grievance Officer.
                </p>

                <h2>7. Grievance Officer</h2>
                <p>
                  In accordance with the Information Technology Act, 2000 and rules made thereunder, the name and contact details of the Grievance Officer are provided below:
                  <br />
                  <strong>Grievance Officer:</strong> Mrs. Girija S.
                  <br />
                  Address: NO 28, 1ST FLOOR, 8TH CROSS, GANAPATHY NAGAR, RAJAGOPAL NAGAR AREA, II STAGE PEENYA, BANGALORE, B.B.M.P West, Karnataka - 560058
                  <br />
                  Email: support@dhantifoods.com | Phone: +91 866-0881905
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
