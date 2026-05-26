'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { OrderItem, Coupon } from '@/lib/types';
import { apiUrl } from '@/lib/api';

interface CartContextType {
  cartItems: OrderItem[];
  addToCart: (item: Omit<OrderItem, 'qty'>, qty: number) => void;
  removeFromCart: (productId: string, variant: string) => void;
  updateQuantity: (productId: string, variant: string, qty: number) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  cartSubtotal: number;
  cartDiscount: number;
  deliveryCharge: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('dhanti_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart items', e);
      }
    }
    const savedCoupon = localStorage.getItem('dhanti_coupon');
    if (savedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(savedCoupon));
      } catch (e) {
        console.error('Failed to parse coupon', e);
      }
    }
  }, []);

  // Save cart to localStorage when changed
  const saveCart = (items: OrderItem[]) => {
    setCartItems(items);
    localStorage.setItem('dhanti_cart', JSON.stringify(items));
  };

  const addToCart = (item: Omit<OrderItem, 'qty'>, qty: number) => {
    const existingIndex = cartItems.findIndex(
      (i) => i.productId === item.productId && i.variant === item.variant
    );

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].qty += qty;
      saveCart(updated);
    } else {
      saveCart([...cartItems, { ...item, qty }]);
    }
  };

  const removeFromCart = (productId: string, variant: string) => {
    const updated = cartItems.filter(
      (i) => !(i.productId === productId && i.variant === variant)
    );
    saveCart(updated);
  };

  const updateQuantity = (productId: string, variant: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId, variant);
      return;
    }
    const updated = cartItems.map((i) =>
      i.productId === productId && i.variant === variant ? { ...i, qty } : i
    );
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
    removeCoupon();
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch(apiUrl(`/api/coupons?code=${encodeURIComponent(code)}`));
      const data = await res.json();

      if (data.success && data.coupon) {
        const coupon: Coupon = data.coupon;
        
        // Validate min order limit
        if (cartSubtotal < coupon.min_order_amount) {
          return {
            success: false,
            message: `Minimum order of ₹${coupon.min_order_amount} required for this coupon.`,
          };
        }

        setAppliedCoupon(coupon);
        localStorage.setItem('dhanti_coupon', JSON.stringify(coupon));
        return { success: true, message: 'Coupon applied successfully!' };
      } else {
        return { success: false, message: data.message || 'Invalid coupon code.' };
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      return { success: false, message: 'Failed to apply coupon due to server error.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem('dhanti_coupon');
  };

  // Calculations
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  
  let cartDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      cartDiscount = Math.round((cartSubtotal * appliedCoupon.discount_value) / 100);
    } else {
      cartDiscount = Math.min(appliedCoupon.discount_value, cartSubtotal);
    }
  }

  // Free delivery above Rs. 500, else Rs. 50
  const deliveryCharge = cartSubtotal > 0 && cartSubtotal < 500 ? 50 : 0;
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount + deliveryCharge);

  // Re-validate coupon if subtotal changes below minimum order amount
  useEffect(() => {
    if (appliedCoupon && cartSubtotal < appliedCoupon.min_order_amount) {
      removeCoupon();
    }
  }, [cartSubtotal, appliedCoupon]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        cartSubtotal,
        cartDiscount,
        deliveryCharge,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
