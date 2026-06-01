'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
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
  
  // Set default variant if available
  const defaultVariant = product.weight_variants?.[0] || '250g';
  const [selectedVariant, setSelectedVariant] = useState<string>(defaultVariant);
  const [quantity, setQuantity] = useState<number>(1);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Reset quantity when variant changes
  useEffect(() => {
    setQuantity(1);
    setSuccessMessage('');
  }, [selectedVariant]);

  // Pricing calculations
  const basePrice = Number(product.price);
  const baseDiscountPrice = product.discount_price ? Number(product.discount_price) : null;

  const multiplier = getVariantMultiplier(selectedVariant, product.weight_variants || []);
  const currentPrice = Math.round(basePrice * multiplier);
  const currentDiscountPrice = baseDiscountPrice 
    ? Math.round(baseDiscountPrice * multiplier) 
    : null;
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
            <button
              type="button"
              onClick={handleAddToCart}
              className="btn btn-primary"
              style={{ flexGrow: 1, height: '48px' }}
              disabled={!inStock}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              Add to Cart
            </button>
            
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
