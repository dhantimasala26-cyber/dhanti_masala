'use client';

import React, { useEffect, useState } from 'react';
import { useToast } from '@/context/ToastContext';

interface QueryItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: 'pending' | 'resolved';
  created_at: string;
}

export default function AdminQueriesPage() {
  const { showToast } = useToast();
  const [queries, setQueries] = useState<QueryItem[]>([]);
  const [filteredQueries, setFilteredQueries] = useState<QueryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  // Modal state for viewing long messages
  const [activeQuery, setActiveQuery] = useState<QueryItem | null>(null);

  const loadQueries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/queries');
      const data = await res.json();
      if (res.ok && data.success) {
        setQueries(data.queries);
        setFilteredQueries(data.queries);
      } else {
        showToast(data.message || 'Failed to load queries.', 'error');
      }
    } catch (err) {
      console.error('Error loading queries:', err);
      showToast('Network error loading customer queries.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueries();
  }, []);

  // Filter queries based on search term and status filter
  useEffect(() => {
    let result = [...queries];

    // 1. Status Filter
    if (statusFilter !== 'all') {
      result = result.filter(q => q.status === statusFilter);
    }

    // 2. Search Filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(q => 
        q.name.toLowerCase().includes(term) ||
        q.email.toLowerCase().includes(term) ||
        (q.phone && q.phone.includes(term)) ||
        q.message.toLowerCase().includes(term)
      );
    }

    setFilteredQueries(result);
  }, [searchTerm, statusFilter, queries]);

  const handleToggleStatus = async (id: string, currentStatus: 'pending' | 'resolved') => {
    const nextStatus = currentStatus === 'pending' ? 'resolved' : 'pending';
    try {
      const res = await fetch('/api/queries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Query marked as ${nextStatus}!`, 'success');
        
        // Update queries state locally
        setQueries(prev => prev.map(q => q.id === id ? { ...q, status: nextStatus } : q));
        if (activeQuery && activeQuery.id === id) {
          setActiveQuery(prev => prev ? { ...prev, status: nextStatus } : null);
        }
      } else {
        showToast(data.message || 'Failed to update status.', 'error');
      }
    } catch (err) {
      console.error('Error toggling status:', err);
      showToast('Network error updating query status.', 'error');
    }
  };

  const handleDeleteQuery = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this query?')) {
      return;
    }

    try {
      const res = await fetch(`/api/queries?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Query deleted successfully.', 'success');
        setQueries(prev => prev.filter(q => q.id !== id));
        setActiveQuery(null);
      } else {
        showToast(data.message || 'Failed to delete query.', 'error');
      }
    } catch (err) {
      console.error('Error deleting query:', err);
      showToast('Network error deleting query.', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Customer Queries</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Review inquiries, read messages, and manage communications submitted via the contact form.</p>
        </div>
      </div>

      {/* Filters & Search Panel */}
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
            placeholder="Search by name, email, phone, or message contents..." 
            className="form-control"
            style={{ width: '100%', padding: '0.6rem 1rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem' }}>
          <button 
            onClick={() => setStatusFilter('all')} 
            style={{ border: '1px solid var(--color-border)', background: statusFilter === 'all' ? 'var(--color-primary)' : 'white', color: statusFilter === 'all' ? 'white' : 'inherit', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, transition: 'var(--transition-smooth)' }}
          >
            All
          </button>
          <button 
            onClick={() => setStatusFilter('pending')} 
            style={{ border: '1px solid var(--color-border)', background: statusFilter === 'pending' ? 'var(--color-secondary)' : 'white', color: statusFilter === 'pending' ? 'white' : 'inherit', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, transition: 'var(--transition-smooth)' }}
          >
            Pending
          </button>
          <button 
            onClick={() => setStatusFilter('resolved')} 
            style={{ border: '1px solid var(--color-border)', background: statusFilter === 'resolved' ? 'var(--color-success)' : 'white', color: statusFilter === 'resolved' ? 'white' : 'inherit', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, transition: 'var(--transition-smooth)' }}
          >
            Resolved
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading customer queries...
        </div>
      ) : filteredQueries.length === 0 ? (
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: 'var(--radius-sm)', 
          border: '1px solid var(--color-border)', 
          padding: '4rem 2rem', 
          textAlign: 'center',
          color: 'var(--color-text-muted)'
        }}>
          No customer inquiries found.
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8F9FA', borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                <th style={{ padding: '1rem', width: '220px' }}>Customer Profile</th>
                <th style={{ width: '200px' }}>Contact Info</th>
                <th>Inquiry Message</th>
                <th style={{ width: '140px' }}>Date Submitted</th>
                <th style={{ width: '110px' }}>Status</th>
                <th style={{ textAlign: 'right', paddingRight: '1rem', width: '180px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueries.map((query) => (
                <tr key={query.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-border)',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        flexShrink: 0
                      }}>
                        {query.name[0].toUpperCase()}
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {query.name}
                      </div>
                    </div>
                  </td>
                  <td style={{ verticalAlign: 'top', paddingTop: '1.2rem' }}>
                    <div style={{ fontSize: '0.85rem' }}>✉️ {query.email}</div>
                    {query.phone && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>📞 {query.phone}</div>}
                  </td>
                  <td style={{ verticalAlign: 'top', paddingTop: '1.2rem', paddingRight: '1rem' }}>
                    <div style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontSize: '0.85rem',
                      lineHeight: '1.4',
                      cursor: 'pointer',
                      color: 'var(--color-text-dark)'
                    }} onClick={() => setActiveQuery(query)} title="Click to read full message">
                      {query.message}
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', verticalAlign: 'top', paddingTop: '1.2rem' }}>
                    {new Date(query.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td style={{ verticalAlign: 'top', paddingTop: '1.1rem' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: query.status === 'resolved' ? 'rgba(46, 90, 68, 0.1)' : 'rgba(216, 141, 67, 0.1)',
                      color: query.status === 'resolved' ? 'var(--color-success)' : 'var(--color-secondary)'
                    }}>
                      {query.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '1rem', whiteSpace: 'nowrap', verticalAlign: 'top', paddingTop: '0.85rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => setActiveQuery(query)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', height: '30px' }}>
                        View
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(query.id, query.status)} 
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', backgroundColor: query.status === 'resolved' ? '#f3f4f6' : '#e2e8f0', color: '#4a5568', height: '30px' }}
                      >
                        {query.status === 'resolved' ? 'Reopen' : 'Resolve'}
                      </button>
                      <button 
                        onClick={() => handleDeleteQuery(query.id)} 
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', backgroundColor: '#fee2e2', color: 'var(--color-error)', border: '1px solid rgba(194, 68, 68, 0.15)', height: '30px' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Query Detail Modal */}
      {activeQuery && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(45, 35, 30, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            width: '100%',
            maxWidth: '580px',
            padding: '2rem',
            animation: 'slideUp 0.3s ease-out',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--color-primary)' }}>Customer Inquiry Details</h3>
              <span style={{
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 700,
                backgroundColor: activeQuery.status === 'resolved' ? 'rgba(46, 90, 68, 0.1)' : 'rgba(216, 141, 67, 0.1)',
                color: activeQuery.status === 'resolved' ? 'var(--color-success)' : 'var(--color-secondary)'
              }}>
                {activeQuery.status.toUpperCase()}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.75rem 1rem', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Customer Name:</span>
              <span style={{ fontWeight: 600, color: 'var(--color-text-dark)' }}>{activeQuery.name}</span>

              <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Email Address:</span>
              <span style={{ color: 'var(--color-text-dark)' }}>{activeQuery.email}</span>

              <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Phone Number:</span>
              <span style={{ color: 'var(--color-text-dark)' }}>{activeQuery.phone || 'Not Provided'}</span>

              <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Date Submitted:</span>
              <span style={{ color: 'var(--color-text-dark)' }}>
                {new Date(activeQuery.created_at).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <span style={{ display: 'block', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Message:</span>
              <div style={{
                backgroundColor: 'var(--color-bg-light)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                fontSize: '0.9rem',
                lineHeight: '1.6',
                color: 'var(--color-text-dark)',
                whiteSpace: 'pre-wrap',
                maxHeight: '220px',
                overflowY: 'auto'
              }}>
                {activeQuery.message}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => handleToggleStatus(activeQuery.id, activeQuery.status)}
                className="btn btn-secondary"
                style={{ height: '40px', padding: '0 1.25rem', backgroundColor: activeQuery.status === 'resolved' ? '#f3f4f6' : 'var(--color-success)', color: activeQuery.status === 'resolved' ? '#4a5568' : 'white', border: 'none' }}
              >
                {activeQuery.status === 'resolved' ? 'Reopen Inquiry' : 'Mark as Resolved'}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteQuery(activeQuery.id)}
                className="btn btn-secondary"
                style={{ height: '40px', padding: '0 1.25rem', backgroundColor: '#fee2e2', color: 'var(--color-error)', border: '1px solid rgba(194, 68, 68, 0.15)' }}
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setActiveQuery(null)}
                className="btn btn-primary"
                style={{ height: '40px', padding: '0 1.5rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
