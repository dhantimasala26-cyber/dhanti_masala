'use client';

import React, { useEffect, useState } from 'react';
import { Coupon } from '@/lib/types';
import { Modal } from '@/components/UI/Modal';
import { useToast } from '@/context/ToastContext';
import { apiUrl } from '@/lib/api';

export default function AdminCouponsPage() {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmCode, setDeleteConfirmCode] = useState<string>('');
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'flat',
    discount_value: '',
    expiry_date: '',
    min_order_amount: '0',
    usage_limit: ''
  });
  const [saving, setSaving] = useState(false);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/coupons'));
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons);
      }
    } catch (err) {
      console.error('Error loading coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'code') {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase().replace(/\s/g, '') }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      expiry_date: '',
      min_order_amount: '0',
      usage_limit: ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string, code: string) => {
    setDeleteConfirmId(id);
    setDeleteConfirmCode(code);
  };

  const executeDelete = async (id: string) => {
    try {
      const res = await fetch(apiUrl(`/api/coupons?id=${id}`), { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCoupons(prev => prev.filter(c => c.id !== id));
        showToast(`Coupon code ${deleteConfirmCode} deleted successfully`, 'success');
      } else {
        showToast(data.message || 'Failed to delete', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error deleting coupon', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      code: formData.code,
      discount_type: formData.discount_type,
      discount_value: formData.discount_value,
      expiry_date: formData.expiry_date || null,
      min_order_amount: formData.min_order_amount || '0',
      usage_limit: formData.usage_limit || null
    };

    try {
      const res = await fetch(apiUrl('/api/coupons'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        showToast('Coupon created successfully', 'success');
        loadCoupons(); // Refresh coupon list
      } else {
        showToast(data.message || 'Failed to create coupon', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving coupon', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Coupons &amp; Deals</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Configure percentage discounts or flat fee vouchers, set spending limits, and audit coupon usage.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>
          &#43; Add Coupon Code
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading promotional codes...
        </div>
      ) : coupons.length === 0 ? (
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: 'var(--radius-sm)', 
          border: '1px solid var(--color-border)', 
          padding: '4rem 2rem', 
          textAlign: 'center',
          color: 'var(--color-text-muted)'
        }}>
          No coupon codes exist. Click "Add Coupon Code" above to make your first campaign code.
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8F9FA', borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                <th style={{ padding: '1rem' }}>Voucher Code</th>
                <th>Benefit Details</th>
                <th>Minimum Cart Required</th>
                <th>Validity Expiry</th>
                <th>Redemptions Status</th>
                <th>Date Added</th>
                <th style={{ textAlign: 'right', paddingRight: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => {
                const hasExpired = c.expiry_date ? new Date(c.expiry_date) < new Date() : false;
                const isLimitReached = c.usage_limit !== null ? c.usage_count >= c.usage_limit : false;
                const isActive = !hasExpired && !isLimitReached;

                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <code style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--color-primary)', backgroundColor: 'var(--color-bg-light)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                        {c.code}
                      </code>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {c.discount_type === 'percentage' ? (
                        <span style={{ color: 'var(--color-success)' }}>{c.discount_value}% OFF</span>
                      ) : (
                        <span style={{ color: 'var(--color-success)' }}>₹{c.discount_value} FLAT</span>
                      )}
                    </td>
                    <td>
                      {c.min_order_amount > 0 ? `₹${c.min_order_amount}` : 'No Minimum'}
                    </td>
                    <td>
                      {c.expiry_date ? (
                        <span style={{ color: hasExpired ? 'var(--color-error)' : 'inherit' }}>
                          {new Date(c.expiry_date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                          {hasExpired && ' (Expired)'}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Infinite</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {c.usage_count} used {c.usage_limit !== null ? `/ ${c.usage_limit} limit` : '/ ∞'}
                      </div>
                      <div style={{ width: '100px', height: '6px', backgroundColor: '#F0ECE9', borderRadius: '3px', marginTop: '0.25rem', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${c.usage_limit ? Math.min(100, (c.usage_count / c.usage_limit) * 100) : 100}%`, 
                          height: '100%', 
                          backgroundColor: isActive ? 'var(--color-success)' : 'var(--color-error)' 
                        }} />
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                      {new Date(c.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '1rem' }}>
                      <button onClick={() => handleDeleteClick(c.id, c.code)} className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Coupon Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Coupon Campaign"
        size="normal"
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem 0' }}>
          
          <div className="form-group">
            <label className="form-label">Coupon Code *</label>
            <input 
              type="text" 
              name="code" 
              required 
              className="form-control" 
              value={formData.code} 
              onChange={handleInputChange} 
              placeholder="e.g. FESTIVE20"
              style={{ textTransform: 'uppercase' }}
            />
            <small style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Voucher code should have no spaces and is converted to uppercase automatically.
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Discount Type *</label>
            <select 
              name="discount_type" 
              className="form-control" 
              value={formData.discount_type} 
              onChange={handleInputChange}
            >
              <option value="percentage">Percentage Discount (%)</option>
              <option value="flat">Flat Value Discount (₹)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Discount Value *</label>
            <input 
              type="number" 
              name="discount_value" 
              required 
              className="form-control" 
              value={formData.discount_value} 
              onChange={handleInputChange} 
              placeholder="e.g. 15 for percentage, or 100 for flat amount"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Minimum Order Requirement (₹)</label>
            <input 
              type="number" 
              name="min_order_amount" 
              className="form-control" 
              value={formData.min_order_amount} 
              onChange={handleInputChange} 
              placeholder="e.g. 500"
            />
            <small style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Order subtotal must exceed this value for the coupon to apply. Set to 0 if none.
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Total Redemptions Limit</label>
            <input 
              type="number" 
              name="usage_limit" 
              className="form-control" 
              value={formData.usage_limit} 
              onChange={handleInputChange} 
              placeholder="e.g. 500"
            />
            <small style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Leave blank for infinite usage.
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Expiry Date</label>
            <input 
              type="date" 
              name="expiry_date" 
              className="form-control" 
              value={formData.expiry_date} 
              onChange={handleInputChange} 
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ flexGrow: 1, height: '44px' }}>
              {saving ? 'Creating Coupon...' : 'Save Coupon'}
            </button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary" style={{ height: '44px' }}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Deletion"
        size="normal"
      >
        <div style={{ padding: '0.5rem 0' }}>
          <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-dark)', fontSize: '0.95rem', lineHeight: '1.5' }}>
            Are you sure you want to delete the coupon code <strong>{deleteConfirmCode}</strong>? This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={() => setDeleteConfirmId(null)} 
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', borderRadius: '6px', height: '38px', display: 'flex', alignItems: 'center' }}
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={() => {
                if (deleteConfirmId) {
                  executeDelete(deleteConfirmId);
                  setDeleteConfirmId(null);
                }
              }} 
              className="btn btn-primary"
              style={{ 
                padding: '0.5rem 1.25rem', 
                fontSize: '0.85rem', 
                borderRadius: '6px', 
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--color-error)',
                borderColor: 'var(--color-error)',
                color: 'white'
              }}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
