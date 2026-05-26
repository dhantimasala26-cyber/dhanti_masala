import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import PolicySidebar from '@/components/PolicySidebar';
import styles from '@/app/policies.module.css';

export const metadata = {
  title: 'Payment Policy - Dhanti Masala',
  description: 'Understand the secure payment methods, billing practices, and transaction handling on Dhanti Masala in India.',
};

export default function PaymentPolicyPage() {
  return (
    <>
      <Navbar />

      <main>
        {/* Banner Header */}
        <section className={styles.header}>
          <div className={styles.headerBackground} />
          <div className={`container ${styles.headerContent}`}>
            <span className={styles.subtitle}>Secure Transactions</span>
            <h1 className={styles.title}>Payment Policy</h1>
          </div>
        </section>

        {/* Policy Grid Container */}
        <section className={styles.policyContainer}>
          <div className="container">
            <div className={styles.policyGrid}>
              
              <PolicySidebar activePath="/payment-policy" />

              <div className={styles.content}>
                <span className={styles.lastUpdated}>Last Updated: May 26, 2026</span>

                <div className={styles.infoBox}>
                  <strong>Reserve Bank of India (RBI) Regulations:</strong> Dhanti Masala operates cashless online payments in full compliance with the guidelines laid down by the Reserve Bank of India (RBI) for digital payment security, including two-factor authentication for cards (3D Secure) and UPI PIN authorization.
                </div>

                <p>
                  To make shopping for your favorite home-style spices simple and secure, Dhanti Masala provides reliable, cashless checkout methods. This Payment Policy outlines our billing policies, accepted payment modes, security systems, and failed transaction procedures.
                </p>

                <h2>1. Accepted Modes of Payment</h2>
                <p>
                  We accept a wide array of digital payment channels to facilitate smooth transactions:
                </p>
                <ul>
                  <li><strong>Unified Payments Interface (UPI):</strong> Google Pay (GPay), PhonePe, Paytm, BHIM UPI, and BHIM-linked banking apps.</li>
                  <li><strong>Credit & Debit Cards:</strong> Visa, MasterCard, RuPay, and Maestro cards issued by authorized Indian banks.</li>
                  <li><strong>Net Banking:</strong> Secure net-banking transfers across 50+ major public and private banks in India.</li>
                  <li><strong>Digital Wallets:</strong> Amazon Pay, Paytm Wallet, Mobikwik, and PhonePe Wallet.</li>
                </ul>
                <p>
                  <em>Note: We do not accept Cash on Delivery (COD) due to the fresh, perishable, food-grade nature of our custom-packed products.</em>
                </p>

                <h2>2. Secure Transactions via Razorpay</h2>
                <p>
                  All online payments on our platform are processed securely by <strong>Razorpay Software Private Limited</strong>.
                </p>
                <ul>
                  <li><strong>Encryption:</strong> Payments are processed over a highly secure, 128-bit SSL (Secure Socket Layer) encrypted connection.</li>
                  <li><strong>Card Security:</strong> Razorpay is PCI-DSS (Payment Card Industry Data Security Standard) Level 1 compliant. Your card data is never shared with us and is securely handled by banks.</li>
                  <li><strong>Authentication:</strong> All payments undergo mandatory authentication (UPI PIN or OTP verification) as mandated by Indian financial rules.</li>
                </ul>

                <h2>3. Failed or Interrupted Transactions</h2>
                <p>
                  On rare occasions, a transaction may fail due to network drops, bank server downtime, or incorrect credentials.
                </p>
                <ul>
                  <li><strong>Money Debited but Order Not Confirmed:</strong> If funds are deducted from your account/card but you do not receive an order confirmation email, it is a bank transit dispute. Your money is completely safe. The gateway automatically detects failed bookings and initiates a reversal.</li>
                  <li><strong>Refund Timeline:</strong> The reversed amount is credited back to your original payment source (bank account, card, or wallet) within <strong>3 to 5 business days</strong> (depending on your bank's clearance cycles).</li>
                  <li><strong>Assistance:</strong> If you do not receive the credit within 7 business days, please email us at support@dhantimasala.com with your transaction reference number and bank statement screenshot.</li>
                </ul>

                <h2>4. GST and Tax Invoices</h2>
                <p>
                  A detailed tax-compliant invoice inclusive of GST is generated for every order. A physical copy of this invoice is packed inside your delivery parcel, and a digital copy is sent to your registered email address upon checkout.
                </p>

                <h2>5. Unauthorized Charges and Frauds</h2>
                <p>
                  If you suspect any unauthorized transaction on your card or UPI handle using the name of Dhanti Masala, please report it immediately to your card-issuing bank and file a complaint at the Cyber Crime Cell (cybercrime.gov.in) in accordance with Indian banking safety protocols.
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
