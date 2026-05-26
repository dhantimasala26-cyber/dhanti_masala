'use client';

import React, { useEffect, useState } from 'react';
import { Product } from '@/lib/types';
import { useToast } from '@/context/ToastContext';
import { apiUrl } from '@/lib/api';

interface InventoryItem {
  id: string;
  name: string;
  sku: string | null;
  weight_variants: string[];
  stock_quantities: Record<string, number>;
  saving?: boolean;
}

export default function AdminInventoryPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/products'));
      const data = await res.json();
      if (data.success) {
        // Map products and set local editing stocks
        const items: InventoryItem[] = data.products.map((p: Product) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          weight_variants: p.weight_variants || [],
          stock_quantities: { ...p.stock_quantities },
          saving: false
        }));
        setProducts(items);
      }
    } catch (err) {
      console.error('Error loading inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleStockChange = (productId: string, variant: string, value: string) => {
    const numericVal = Math.max(0, parseInt(value) || 0);
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          stock_quantities: {
            ...p.stock_quantities,
            [variant]: numericVal
          }
        };
      }
      return p;
    }));
  };

  const handleSaveStock = async (item: InventoryItem) => {
    // Set loading state for this item
    setProducts(prev => prev.map(p => p.id === item.id ? { ...p, saving: true } : p));

    try {
      const res = await fetch(apiUrl('/api/products'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          stock_quantities: item.stock_quantities
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Stock levels for ${item.name} updated successfully!`, 'success');
      } else {
        showToast(data.message || 'Failed to update stock', 'error');
      }
    } catch (err) {
      console.error('Error saving stock:', err);
      showToast('Error saving stock quantities', 'error');
    } finally {
      // Clear loading state
      setProducts(prev => prev.map(p => p.id === item.id ? { ...p, saving: false } : p));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Inventory Stock Manager</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Quickly audit or update quantities available in stock across size packets (250g, 500g, 1kg).</p>
        </div>
        <button onClick={loadInventory} className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
          🔄 Sync Stock Levels
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading inventory stock metrics...
        </div>
      ) : products.length === 0 ? (
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: 'var(--radius-sm)', 
          border: '1px solid var(--color-border)', 
          padding: '4rem 2rem', 
          textAlign: 'center',
          color: 'var(--color-text-muted)'
        }}>
          No products found in catalog to manage inventory.
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8F9FA', borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                <th style={{ padding: '1.25rem 1rem' }}>Product Details</th>
                <th>SKU</th>
                <th>Pack Weight Variant &amp; Available Stock Quantity</th>
                <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Update Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1.25rem 1rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-dark)' }}>{item.name}</div>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.85rem' }}>{item.sku || 'N/A'}</code>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                      {item.weight_variants.map(variant => {
                        const quantity = item.stock_quantities[variant] ?? 0;
                        const isLowStock = quantity <= 10;
                        
                        return (
                          <div key={variant} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ 
                              fontSize: '0.8rem', 
                              fontWeight: 700, 
                              color: isLowStock ? 'var(--color-error)' : 'var(--color-text-muted)'
                            }}>
                              {variant}:
                            </span>
                            <input 
                              type="number"
                              className="form-control"
                              value={quantity}
                              min={0}
                              onChange={(e) => handleStockChange(item.id, variant, e.target.value)}
                              style={{ 
                                width: '75px', 
                                padding: '0.35rem 0.5rem', 
                                fontSize: '0.85rem',
                                textAlign: 'center',
                                borderColor: isLowStock ? 'var(--color-error)' : 'var(--color-border)',
                                backgroundColor: isLowStock ? 'rgba(194, 68, 68, 0.03)' : 'white'
                              }}
                            />
                            {isLowStock && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--color-error)', fontWeight: 'bold' }}>
                                ⚠️ Low Stock!
                              </span>
                            )}
                          </div>
                        );
                      })}
                      {item.weight_variants.length === 0 && (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                          No variants defined for this product.
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                    <button 
                      onClick={() => handleSaveStock(item)} 
                      disabled={item.saving || item.weight_variants.length === 0} 
                      className="btn btn-primary"
                      style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', borderRadius: '4px' }}
                    >
                      {item.saving ? 'Saving...' : 'Save Stock'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
