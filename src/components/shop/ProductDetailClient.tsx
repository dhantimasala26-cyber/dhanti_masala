'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { apiUrl } from '@/lib/api';
import styles from './ProductDetailClient.module.css';

interface ProductDetailClientProps {
  product: Product;
}

// Helper to parse weight strings (e.g. '250g', '1kg') to grams
const parseWeightToGrams = (weightStr: string): number => {
  const clean = weightStr.toLowerCase().trim();
  const num = parseFloat(clean);
  if (isNaN(num)) return 250; // fallback
  if (clean.includes('kg')) return num * 1000;
  if (clean.includes('g')) return num;
  return num; // fallback
};

// Helper to scale price based on pack size variants relative to the base variant
const getVariantMultiplier = (variant: string, variants: string[]): number => {
  if (!variants || variants.length === 0) return 1.0;
  const baseVariant = variants[0];
  const baseWeight = parseWeightToGrams(baseVariant);
  const selectedWeight = parseWeightToGrams(variant);
  
  if (baseWeight <= 0) return 1.0;
  const ratio = selectedWeight / baseWeight;
  
  // Apply standard bulk discount based on ratio of selected weight to base weight
  if (ratio >= 4) {
    return Math.round(ratio * 0.9 * 10) / 10; // 10% discount for 4x or more
  } else if (ratio >= 2) {
    return Math.round(ratio * 0.95 * 10) / 10; // 5% discount for 2x
  }
  return ratio;
};

export const ProductDetailClient: React.FC<ProductDetailClientProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { customer } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  
  // Set default variant if available
  const defaultVariant = product.weight_variants?.[0] || '250g';
  const [selectedVariant, setSelectedVariant] = useState<string>(defaultVariant);
  const [quantity, setQuantity] = useState<number>(1);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [notifying, setNotifying] = useState<boolean>(false);

  // Auto-trigger pending notifications from localStorage if user just logged in
  useEffect(() => {
    const checkPendingNotification = async () => {
      if (!customer) return;
      
      const pendingProductId = localStorage.getItem('pending_notify_product_id');
      const pendingVariant = localStorage.getItem('pending_notify_variant');
      
      if (pendingProductId === product.id && pendingVariant === selectedVariant) {
        localStorage.removeItem('pending_notify_product_id');
        localStorage.removeItem('pending_notify_variant');
        
        try {
          const token = localStorage.getItem('dhanti_customer_token');
          const res = await fetch(apiUrl('/api/auth/customer/notify-me'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({ productId: product.id, variant: selectedVariant })
          });
          const data = await res.json();
          if (res.ok) {
            showToast(data.message || 'Notification request registered successfully!', 'success');
          } else {
            showToast(data.detail || 'Failed to register notification.', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('Failed to connect to server.', 'error');
        }
      }
    };

    checkPendingNotification();
  }, [customer, product.id, selectedVariant, showToast]);

  const handleNotifyMe = async () => {
    if (!customer) {
      // Save intent to localStorage
      localStorage.setItem('pending_notify_product_id', product.id);
      localStorage.setItem('pending_notify_variant', selectedVariant);
      showToast('Please log in first to receive notifications.', 'info');
      // Redirect to login page
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setNotifying(true);
    try {
      const token = localStorage.getItem('dhanti_customer_token');
      const res = await fetch(apiUrl('/api/auth/customer/notify-me'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ productId: product.id, variant: selectedVariant })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Notification request registered successfully!', 'success');
      } else {
        showToast(data.detail || 'Failed to register notification.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('A connection error occurred. Please try again.', 'error');
    } finally {
      setNotifying(false);
    }
  };

  // Reset quantity when variant changes
  useEffect(() => {
    setQuantity(1);
    setSuccessMessage('');
  }, [selectedVariant]);

  // Pricing calculations
  let currentPrice: number;
  let currentDiscountPrice: number | null = null;

  if (product.prices && product.prices[selectedVariant]) {
    const variantConfig = product.prices[selectedVariant];
    currentPrice = Number(variantConfig.price);
    currentDiscountPrice = variantConfig.discount_price !== null && variantConfig.discount_price !== undefined
      ? Number(variantConfig.discount_price)
      : null;
  } else {
    // Fallback to legacy multiplier logic if custom prices are not set for this variant
    const basePrice = Number(product.price);
    const baseDiscountPrice = product.discount_price ? Number(product.discount_price) : null;
    const multiplier = getVariantMultiplier(selectedVariant, product.weight_variants || []);
    currentPrice = Math.round(basePrice * multiplier);
    currentDiscountPrice = baseDiscountPrice 
      ? Math.round(baseDiscountPrice * multiplier) 
      : null;
  }
  const isDiscounted = currentDiscountPrice !== null && currentDiscountPrice < currentPrice;
  const finalPrice = isDiscounted ? (currentDiscountPrice as number) : currentPrice;

  // Stock status
  const stockAvailable = product.stock_quantities?.[selectedVariant] ?? 0;
  const inStock = stockAvailable > 0;

  const handleQtyChange = (val: number) => {
    const newQty = quantity + val;
    if (newQty >= 1 && newQty <= stockAvailable) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = () => {
    if (!inStock) return;

    addToCart({
      productId: product.id,
      name: product.name,
      variant: selectedVariant,
      price: finalPrice,
      image: product.images?.[0] || '/sambar_powder.jpg'
    }, quantity);

    setSuccessMessage(`Success! Added ${quantity} x ${product.name} (${selectedVariant}) to cart.`);
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  return (
    <div className={`container section-padding ${styles.detailContainer}`}>
      <div className={styles.layout}>
      {/* Gallery Section */}
      <div className={styles.gallery}>
        <div className={styles.imgWrapper}>
          <img 
            src={product.images?.[0] || '/sambar_powder.jpg'} 
            alt={product.name} 
            className={styles.productImg}
          />
        </div>
      </div>

      {/* Product Details Section */}
      <div className={styles.info}>
        <div>
          <span className={styles.category}>
            {product.category?.name || 'Traditional Handcrafted'}
          </span>
          <h1 className={styles.title}>{product.name}</h1>
        </div>

        <p className={styles.shortDesc}>{product.short_description}</p>

        {/* Pricing */}
        <div className={styles.priceGroup}>
          <span className={styles.price}>
            ₹{finalPrice}
          </span>
          {isDiscounted && (
            <span className={styles.originalPrice}>
              ₹{currentPrice}
            </span>
          )}
        </div>

        {/* Estimated Delivery */}
        <div style={{ marginTop: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontSize: '0.95rem', fontWeight: 500 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
          Estimated Delivery: 5-7 business days
        </div>

        {/* Purchase Form */}
        <div className={styles.form}>
          {/* Weight Variants */}
          {product.weight_variants && product.weight_variants.length > 0 && (
            <div>
              <span className={styles.optionLabel}>Select Weight Packet:</span>
              <div className={styles.variants}>
                {product.weight_variants.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`${styles.variantBtn} ${selectedVariant === v ? styles.activeVariant : ''}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Availability */}
          <div className={styles.qtyRow}>
            <div>
              <span className={styles.optionLabel}>Quantity:</span>
              <div className={styles.qtyPicker}>
                <button 
                  type="button" 
                  onClick={() => handleQtyChange(-1)} 
                  className={styles.qtyBtn}
                  disabled={quantity <= 1 || !inStock}
                >
                  &minus;
                </button>
                <input 
                  type="text" 
                  value={quantity} 
                  readOnly 
                  className={styles.qtyInput}
                />
                <button 
                  type="button" 
                  onClick={() => handleQtyChange(1)} 
                  className={styles.qtyBtn}
                  disabled={quantity >= stockAvailable || !inStock}
                >
                  &#43;
                </button>
              </div>
            </div>

            <div>
              <span className={styles.optionLabel}>Availability:</span>
              <span className={`${styles.stock} ${inStock ? styles.inStock : styles.outOfStock}`}>
                {inStock ? `In Stock (${stockAvailable} packs available)` : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            {inStock ? (
              <button
                type="button"
                onClick={handleAddToCart}
                className="btn btn-primary"
                style={{ flexGrow: 1, height: '48px' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Add to Cart
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNotifyMe}
                className="btn btn-primary"
                style={{ flexGrow: 1, height: '48px', backgroundColor: 'var(--color-secondary, #B04A26)', borderColor: 'var(--color-secondary, #B04A26)' }}
                disabled={notifying}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {notifying ? 'Setting Alert...' : 'Notify Me When Available'}
              </button>
            )}
            
            <Link 
              href="/shop" 
              className="btn btn-secondary"
              style={{ height: '48px', padding: '0 1.5rem' }}
            >
              Back to Shop
            </Link>
          </div>

          {/* Success Notification */}
          {successMessage && (
            <div className={styles.successMsg}>
              {successMessage}
            </div>
          )}
        </div>

        {/* Full Details & Specs */}
        <div className={styles.descSection}>
          <h3 className={styles.descTitle}>About the product</h3>
          <p className={styles.descText}>{product.description}</p>

          <table className={styles.specsTable}>
            <tbody>
              <tr>
                <td>Shelf Life</td>
                <td>{product.shelf_life || '6 Months from date of packaging'}</td>
              </tr>
              <tr>
                <td>Origin</td>
                <td>{product.origin || 'Bangalore, Karnataka, India'}</td>
              </tr>
              <tr>
                <td>SKU Reference</td>
                <td>{product.sku || 'DM-HN-001'}</td>
              </tr>
              <tr>
                <td>purity checklist</td>
                <td>{product.purity_checklist || '100% Preservative-free, Handcrafted, Roasted traditionally'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);
};
