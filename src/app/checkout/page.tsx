'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import styles from './page.module.css';
import { useToast } from '@/context/ToastContext';
import { apiUrl } from '@/lib/api';

export default function CheckoutPage() {
  const { showToast } = useToast();
  const {
    cartItems,
    cartSubtotal,
    cartDiscount,
    deliveryCharge,
    cartTotal,
    appliedCoupon,
    clearCart
  } = useCart();

  // Form states
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    pincode: '',
    city: '',
    state: 'Karnataka' // default
  });

  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  // Redirect if cart is empty and order hasn't been completed yet
  useEffect(() => {
    if (cartItems.length === 0 && !createdOrder) {
      // Just check if we need to let user know, or we can handle it in the render
    }
  }, [cartItems, createdOrder]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const initiateRazorpayPayment = async () => {
    if (!(window as any).Razorpay) {
      showToast('Payment gateway is loading. Please try again in a moment.', 'warning');
      return;
    }

    setLoading(true);
    try {
      // 1. Create a Razorpay order via backend
      const orderRes = await fetch(apiUrl('/api/razorpay/create-order'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: cartTotal })
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        showToast(orderData.message || 'Failed to initialize payment. Please try again.', 'error');
        setLoading(false);
        return;
      }

      const { orderId } = orderData;

      // 2. Configure Razorpay checkout options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount, // from backend (in paise)
        currency: orderData.currency || 'INR',
        name: 'Dhanti Masala',
        description: 'Wholesome aromatic South Indian spices',
        image: '/logo.svg', // brand image
        order_id: orderId,
        handler: async function (response: any) {
          // On successful payment, submit the order for verification and database creation
          await submitOrder('online', 'paid', response.razorpay_payment_id, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
        },
        prefill: {
          name: formData.customer_name,
          email: formData.customer_email,
          contact: formData.customer_phone
        },
        notes: {
          address: formData.shipping_address
        },
        theme: {
          color: '#B04A26' // brand color (matching Dhanti Masala brown)
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Error initiating Razorpay checkout:', err);
      showToast('An error occurred while launching payment gateway.', 'error');
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.customer_email || !formData.customer_phone || !formData.shipping_address || !formData.pincode || !formData.city) {
      showToast('Please fill out all required shipping fields.', 'warning');
      return;
    }

    if (paymentMethod === 'online') {
      initiateRazorpayPayment();
    } else {
      // COD flow
      submitOrder('cod', 'pending', null);
    }
  };

  const submitOrder = async (
    method: 'online' | 'cod', 
    payStatus: 'paid' | 'pending', 
    txId: string | null,
    razorpayVerification?: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }
  ) => {
    setLoading(true);
    try {
      const orderPayload = {
        ...formData,
        items: cartItems,
        subtotal: cartSubtotal,
        discount: cartDiscount,
        total: cartTotal,
        payment_method: method,
        payment_status: payStatus,
        transaction_id: txId,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        ...razorpayVerification
      };

      const res = await fetch(apiUrl('/api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (data.success && data.order) {
        setCreatedOrder(data.order);
        clearCart(); // empty cart on success
      } else {
        showToast(data.message || 'Failed to place the order. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      showToast('An error occurred during checkout. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Render Success screen if order created
  if (createdOrder) {
    return (
      <>
        <Navbar />
        <main style={{ backgroundColor: 'var(--color-bg-light)' }}>
          <section className="section-padding">
            <div className="container">
              <div className={styles.successContainer}>
                <div className={styles.successIcon}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h1 style={{ marginBottom: '0.5rem' }}>Order Placed Successfully!</h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                  Thank you for shopping with Dhanti Masala. Your order is being hand-prepared.
                </p>

                <div className={styles.orderId}>
                  ORDER ID: {createdOrder.id.split('-')[0].toUpperCase()}
                </div>

                <div style={{ width: '100%', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '1.5rem 0', margin: '1.5rem 0', textAlign: 'left' }}>
                  <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-body)', fontSize: '1.1rem', fontWeight: 600 }}>Delivery Details</h3>
                  <p style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                    <strong>Name:</strong> {createdOrder.customer_name}
                  </p>
                  <p style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                    <strong>Address:</strong> {createdOrder.shipping_address}, {createdOrder.city}, {createdOrder.state} - {createdOrder.pincode}
                  </p>
                  <p style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                    <strong>Phone:</strong> {createdOrder.customer_phone}
                  </p>
                  <p style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                    <strong>Payment:</strong> {createdOrder.payment_method.toUpperCase()} ({createdOrder.payment_status.toUpperCase()})
                  </p>
                  <p style={{ fontSize: '0.95rem' }}>
                    <strong>Total Amount paid:</strong> ₹{createdOrder.total}
                  </p>
                </div>

                <Link href="/shop" className="btn btn-primary" style={{ height: '48px', padding: '0 2rem' }}>
                  Shop More Spices
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main style={{ backgroundColor: 'var(--color-bg-light)' }}>
        <section className={`section-padding ${styles.checkoutSection}`}>
          <div className="container">
            <h1 className={styles.title}>Checkout</h1>

            {cartItems.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                  No items in cart to checkout.
                </p>
                <Link href="/shop" className="btn btn-primary">
                  Go to Shop
                </Link>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className={styles.layout}>
                {/* Left side: Billing Form */}
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Shipping &amp; Billing Details</h2>
                  
                  <div className={styles.formGrid}>
                    <div className="form-group">
                      <label className="form-label">Customer Name *</label>
                      <input
                        type="text"
                        name="customer_name"
                        required
                        className="form-control"
                        placeholder="e.g. Ramesh Kumar"
                        value={formData.customer_name}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <input
                        type="tel"
                        name="customer_phone"
                        required
                        className="form-control"
                        placeholder="10-digit number"
                        value={formData.customer_phone}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group className={styles.fullWidth}">
                      <label className="form-label">Email Address *</label>
                      <input
                        type="email"
                        name="customer_email"
                        required
                        className="form-control"
                        placeholder="e.g. ramesh@gmail.com"
                        value={formData.customer_email}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group className={styles.fullWidth}">
                      <label className="form-label">Shipping Address *</label>
                      <textarea
                        name="shipping_address"
                        required
                        rows={3}
                        className="form-control"
                        placeholder="House no, Street name, Area details"
                        style={{ fontFamily: 'inherit', resize: 'vertical' }}
                        value={formData.shipping_address}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Pincode *</label>
                      <input
                        type="text"
                        name="pincode"
                        required
                        className="form-control"
                        placeholder="6-digit pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">City *</label>
                      <input
                        type="text"
                        name="city"
                        required
                        className="form-control"
                        placeholder="e.g. Bangalore"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        name="state"
                        className="form-control"
                        value={formData.state}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Payment Selection */}
                  <div className={styles.paymentGroup}>
                    <h3 className={styles.optionLabel}>Select Payment Method</h3>
                    
                    <div 
                      className={`${styles.paymentOption} ${paymentMethod === 'online' ? styles.activeOption : ''}`}
                      onClick={() => setPaymentMethod('online')}
                    >
                      <input
                        type="radio"
                        checked={paymentMethod === 'online'}
                        onChange={() => setPaymentMethod('online')}
                        className={styles.optionInput}
                      />
                      <div className={styles.optionInfo}>
                        <span className={styles.optionName}>Pay Online (Razorpay)</span>
                        <span className={styles.optionDesc}>Pay securely via Credit Card, UPI, or Netbanking (simulated gate).</span>
                      </div>
                    </div>

                    <div 
                      className={`${styles.paymentOption} ${paymentMethod === 'cod' ? styles.activeOption : ''}`}
                      onClick={() => setPaymentMethod('cod')}
                    >
                      <input
                        type="radio"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className={styles.optionInput}
                      />
                      <div className={styles.optionInfo}>
                        <span className={styles.optionName}>Cash on Delivery (COD)</span>
                        <span className={styles.optionDesc}>Pay with cash when the spices are delivered at your doorstep.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side: Order Summary */}
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Review Your Order</h2>
                  
                  {/* Cart Items list */}
                  <div className={styles.summaryList}>
                    {cartItems.map((item) => (
                      <div key={`${item.productId}-${item.variant}`} className={styles.summaryItem}>
                        <div>
                          <div className={styles.itemName}>{item.name}</div>
                          <span className={styles.itemMeta}>{item.variant} &times; {item.qty}</span>
                        </div>
                        <span style={{ fontWeight: 600 }}>₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                    <div className={styles.summaryRow}>
                      <span>Subtotal</span>
                      <span>₹{cartSubtotal}</span>
                    </div>

                    {cartDiscount > 0 && (
                      <div className={styles.summaryRow} style={{ color: 'var(--color-success)' }}>
                        <span>Discount {appliedCoupon && `(${appliedCoupon.code})`}</span>
                        <span>&minus; ₹{cartDiscount}</span>
                      </div>
                    )}

                    <div className={styles.summaryRow}>
                      <span>Delivery Charges</span>
                      <span>{deliveryCharge > 0 ? `₹${deliveryCharge}` : 'FREE'}</span>
                    </div>

                    <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                      <span>Grand Total</span>
                      <span>₹{cartTotal}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '2rem', height: '48px' }}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : paymentMethod === 'online' ? 'Proceed to Pay' : 'Place Order (COD)'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>

      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <Footer />
    </>
  );
}
