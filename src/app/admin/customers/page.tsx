'use client';

import React, { useEffect, useState } from 'react';
import { Customer } from '@/lib/types';
import { apiUrl } from '@/lib/api';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'total_spent' | 'total_orders' | 'last_order_date' | 'name'>('total_spent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/customers'));
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
        setFilteredCustomers(data.customers);
      }
    } catch (err) {
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // Filter & Sort customers
  useEffect(() => {
    let result = [...customers];

    // 1. Search Filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.phone.includes(term)
      );
    }

    // 2. Sort
    result.sort((a, b) => {
      let valA: any = a[sortBy];
      let valB: any = b[sortBy];

      // Handle null cases for dates
      if (sortBy === 'last_order_date') {
        valA = valA ? new Date(valA).getTime() : 0;
        valB = valB ? new Date(valB).getTime() : 0;
      } else if (sortBy === 'total_spent') {
        valA = parseFloat(valA || 0);
        valB = parseFloat(valB || 0);
      } else if (sortBy === 'total_orders') {
        valA = parseInt(valA || 0);
        valB = parseInt(valB || 0);
      } else if (sortBy === 'name') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredCustomers(result);
  }, [searchTerm, sortBy, sortOrder, customers]);

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc'); // Default to descending when switching fields
    }
  };

  const getSortIcon = (field: typeof sortBy) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '🔼' : '🔽';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Customers CRM</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>View client purchasing histories, contact numbers, and aggregate sales contributions.</p>
        </div>
      </div>

      {/* Search & Sort Panel */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ flexGrow: 1, minWidth: '280px' }}>
          <input 
            type="text" 
            placeholder="Search by customer name, email, or phone number..." 
            className="form-control"
            style={{ width: '100%', padding: '0.6rem 1rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Sort By:</span>
          <button 
            onClick={() => toggleSort('total_spent')} 
            style={{ border: '1px solid var(--color-border)', background: sortBy === 'total_spent' ? 'var(--color-primary)' : 'white', color: sortBy === 'total_spent' ? 'white' : 'inherit', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
          >
            Money Spent {getSortIcon('total_spent')}
          </button>
          <button 
            onClick={() => toggleSort('total_orders')} 
            style={{ border: '1px solid var(--color-border)', background: sortBy === 'total_orders' ? 'var(--color-primary)' : 'white', color: sortBy === 'total_orders' ? 'white' : 'inherit', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
          >
            Orders Count {getSortIcon('total_orders')}
          </button>
          <button 
            onClick={() => toggleSort('last_order_date')} 
            style={{ border: '1px solid var(--color-border)', background: sortBy === 'last_order_date' ? 'var(--color-primary)' : 'white', color: sortBy === 'last_order_date' ? 'white' : 'inherit', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
          >
            Last Order {getSortIcon('last_order_date')}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading customer directory...
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: 'var(--radius-sm)', 
          border: '1px solid var(--color-border)', 
          padding: '4rem 2rem', 
          textAlign: 'center',
          color: 'var(--color-text-muted)'
        }}>
          No customer profiles found.
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8F9FA', borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                <th style={{ padding: '1rem' }}>Customer Profile</th>
                <th>Contact Info</th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('total_orders')}>Orders Count {getSortIcon('total_orders')}</th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('total_spent')}>Total Spent {getSortIcon('total_spent')}</th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('last_order_date')}>Last Purchase {getSortIcon('last_order_date')}</th>
                <th>Customer Since</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-border)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '1rem'
                    }}>
                      {cust.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-dark)' }}>{cust.name}</div>
                    </div>
                  </td>
                  <td>
                    <div>📞 {cust.phone}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>✉️ {cust.email}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{cust.total_orders} order(s)</td>
                  <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₹{cust.total_spent}</td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                    {cust.last_order_date ? (
                      new Date(cust.last_order_date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                    {new Date(cust.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
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
