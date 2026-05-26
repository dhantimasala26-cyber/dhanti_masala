'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import styles from './page.module.css';

export default function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    cartSubtotal,
    cartDiscount,
    deliveryCharge,
    cartTotal
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setLoadingCoupon(true);
    setCouponFeedback(null);
    
    const result = await applyCoupon(couponCode.trim().toUpperCase());
    
    setLoadingCoupon(false);
    setCouponFeedback({
      success: result.success,
      message: result.message
    });

    if (result.success) {
      setCouponCode('');
    }
  };

  return (
    <>
      <Navbar />

      <main style={{ backgroundColor: 'var(--color-bg-light)' }}>
        <section className={`section-padding ${styles.cartSection}`}>
          <div className="container">
            <h1 className={styles.title}>Your Shopping Cart</h1>

            {cartItems.length === 0 ? (
              <div className={styles.emptyCart}>
                <div className={styles.emptyIcon}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                </div>
                <h2 className={styles.emptyTitle}>Your cart is empty</h2>
                <p className={styles.emptyText}>
                  It looks like you haven't added any spices or health mixes to your cart yet. Let's find something delicious!
                </p>
                <Link href="/shop" className="btn btn-primary">
                  Start Shopping
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
            ) : (
              <div className={styles.layout}>
                {/* Cart Items List */}
                <div className={styles.cartList}>
                  {cartItems.map((item) => (
                    <div key={`${item.productId}-${item.variant}`} className={styles.cartItem}>
                      <div className={styles.imgWrapper}>
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className={styles.itemImg}
                        />
                      </div>
                      
                      <div className={styles.itemDetails}>
                        <h3 className={styles.itemName}>{item.name}</h3>
                        <span className={styles.itemVariant}>{item.variant}</span>
                        <div className={styles.itemPrice}>₹{item.price}</div>
                      </div>

                      {/* Quantity Selector */}
                      <div className={styles.qtyControls}>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => updateQuantity(item.productId, item.variant, item.qty - 1)}
                        >
                          &minus;
                        </button>
                        <input
                          type="text"
                          className={styles.qtyInput}
                          value={item.qty}
                          readOnly
                        />
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => updateQuantity(item.productId, item.variant, item.qty + 1)}
                        >
                          &#43;
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeFromCart(item.productId, item.variant)}
                        aria-label="Remove item"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Sidebar summary */}
                <div className={styles.summaryBox}>
                  <h2 className={styles.summaryTitle}>Order Summary</h2>
                  
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

                  <div className={styles.summaryRow} style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                    {deliveryCharge > 0 
                      ? 'Add ₹' + (500 - cartSubtotal) + ' more for FREE delivery!' 
                      : 'Free delivery applied (Orders above ₹500)'}
                  </div>

                  {/* Coupon section */}
                  <div className={styles.couponSection}>
                    <span className={styles.optionLabel}>Have a promo code?</span>
                    {!appliedCoupon ? (
                      <form onSubmit={handleApplyCoupon} className={styles.couponForm}>
                        <input
                          type="text"
                          placeholder="e.g. DHANTI10"
                          className={styles.couponInput}
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                        />
                        <button
                          type="submit"
                          className="btn btn-dark styles.couponBtn"
                          style={{ borderRadius: 'var(--radius-sm)', padding: '0 1.25rem', height: '40px' }}
                          disabled={loadingCoupon}
                        >
                          Apply
                        </button>
                      </form>
                    ) : (
                      <div className={styles.appliedCoupon}>
                        <span>{appliedCoupon.code} applied! ({appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}%` : `₹${appliedCoupon.discount_value}`} Off)</span>
                        <button
                          type="button"
                          className={styles.removeCouponBtn}
                          onClick={removeCoupon}
                        >
                          &times;
                        </button>
                      </div>
                    )}
                    
                    {couponFeedback && (
                      <div 
                        className={styles.couponFeedback}
                        style={{ color: couponFeedback.success ? 'var(--color-success)' : 'var(--color-error)' }}
                      >
                        {couponFeedback.message}
                      </div>
                    )}
                  </div>

                  <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                    <span>Grand Total</span>
                    <span>₹{cartTotal}</span>
                  </div>

                  <Link
                    href="/checkout"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '1.5rem', height: '48px' }}
                  >
                    Proceed to Checkout
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>

                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <Link href="/shop" style={{ fontSize: '0.88rem', color: 'var(--color-primary)', fontWeight: '600' }}>
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
