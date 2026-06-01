import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import PolicySidebar from '@/components/PolicySidebar';
import styles from '@/app/policies.module.css';

export const metadata = {
  title: 'Return & Refund Policy - Dhanti Masala',
  description: 'Review our policies regarding returns, refunds, and cancellations for handcrafted spice mixes and food items.',
};

export default function ReturnPolicyPage() {
  return (
    <>
      <Navbar />

      <main>
        {/* Banner Header */}
        <section className={styles.header}>
          <div className={styles.headerBackground} />
          <div className={`container ${styles.headerContent}`}>
            <span className={styles.subtitle}>Returns & Support</span>
            <h1 className={styles.title}>Return & Refund Policy</h1>
          </div>
        </section>

        {/* Policy Grid Container */}
        <section className={styles.policyContainer}>
          <div className="container">
            <div className={styles.policyGrid}>
              
              <PolicySidebar activePath="/return-policy" />

              <div className={styles.content}>
                <span className={styles.lastUpdated}>Last Updated: May 26, 2026</span>

                <div className={styles.infoBox}>
                  <strong>Food Safety & Hygiene Restriction:</strong> In compliance with the Food Safety and Standards Act (FSS Act) rules and standard e-commerce guidelines for perishable goods, Dhanti Masala does not accept returns on food products once they have been delivered. Open packets cannot be returned under any circumstances.
                </div>

                <p>
                  At Dhanti Masala, we are committed to delivering fresh, pure, and aromatic spices and health mixes. Because our items are consumable food products, we maintain a strict policy to ensure the health and safety of our customers and staff.
                </p>

                <h2>1. Damaged, Defective, or Incorrect Deliveries</h2>
                <p>
                  While we take utmost care in packaging our handcrafted items in double-sealed pouches, transit damages may occasionally occur. We will gladly send a replacement or issue a refund in the following cases:
                </p>
                <ul>
                  <li><strong>Incorrect Product:</strong> If you received a different spice blend or pack size than what was ordered.</li>
                  <li><strong>Transit Damage:</strong> If the outer seal or package is visibly torn, crushed, or damaged at the time of delivery.</li>
                  <li><strong>Quality Issue:</strong> If there is a packaging defect that has compromised the product's integrity.</li>
                </ul>

                <h2>2. Reporting Procedure & Proof Requirements</h2>
                <p>
                  To report an issue and request a replacement or refund, please follow these steps:
                </p>
                <ol>
                  <li><strong>Timeline:</strong> Contact our support team via email (support@dhantifoods.com) or WhatsApp (+91 866-0881905) within <strong>48 hours</strong> of receiving the delivery. Requests received after 48 hours will not be processed.</li>
                  <li><strong>Unboxing Proof (Recommended):</strong> To speed up transit damage claims, we strongly recommend recording a brief unboxing video when opening the shipping package for the first time.</li>
                  <li><strong>Photos:</strong> Provide clear photos showing the damage, the shipping label, and the batch number on the spice pouch.</li>
                </ol>

                <h2>3. Cancellation Policy</h2>
                <p>
                  Orders can only be cancelled before they are dispatched from our kitchens.
                </p>
                <ul>
                  <li><strong>Pre-Dispatch Cancellation:</strong> You can request a cancellation within 2 hours of placing the order by calling support. We roast and pack fresh weekly, so cancellations must be made quickly. A full refund will be processed.</li>
                  <li><strong>Post-Dispatch:</strong> Once the parcel is handed over to our logistics partners (dispatched status), cancellations are not possible, and delivery redirection cannot be done. Refunds are not issued for refused deliveries.</li>
                </ul>

                <h2>4. Refund Processing and Credits</h2>
                <p>
                  Once your claim for a damaged or incorrect product is approved by our quality control team:
                </p>
                <ul>
                  <li><strong>Method:</strong> The refund will be initiated directly back to your original source of payment (bank, credit/debit card, UPI, or wallet). No cash refunds are provided.</li>
                  <li><strong>Timeframe:</strong> The refund will reflect in your account within <strong>5 to 7 business days</strong>, subject to your bank's processing cycles.</li>
                  <li><strong>Store Credit Option:</strong> Alternatively, you can choose to receive a coupon code or store credit of equal value for immediate use on your next order.</li>
                </ul>

                <h2>5. Customer Support Contact</h2>
                <p>
                  We are here to help you. For any issues regarding your spice orders, please reach out to us:
                  <br />
                  📧 Email: support@dhantifoods.com
                  <br />
                  💬 WhatsApp/Call: +91 866-0881905
                  <br />
                  Hours: Monday to Saturday, 10:00 AM to 6:00 PM IST
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
