'use client';

import React, { useEffect, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { apiUrl } from '@/lib/api';

interface CompanySettings {
  company_name: string;
  logo_url: string;
  email: string;
  phone: string;
  address: string;
  gstin: string;
  fssai: string;
  footer_tagline: string;
  social_instagram: string;
  social_facebook: string;
}

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [settings, setSettings] = useState<CompanySettings>({
    company_name: '',
    logo_url: '',
    email: '',
    phone: '',
    address: '',
    gstin: '',
    fssai: '',
    footer_tagline: '',
    social_instagram: '',
    social_facebook: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await fetch(apiUrl('/api/cms?key=company_settings'));
        const data = await res.json();
        if (data.success && data.value) {
          setSettings({
            company_name: data.value.company_name || '',
            logo_url: data.value.logo_url || '',
            email: data.value.email || '',
            phone: data.value.phone || '',
            address: data.value.address || '',
            gstin: data.value.gstin || '',
            fssai: data.value.fssai || '',
            footer_tagline: data.value.footer_tagline || '',
            social_instagram: data.value.social_instagram || '',
            social_facebook: data.value.social_facebook || ''
          });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        showToast('Error loading company settings', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(apiUrl('/api/upload'), {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.url) {
        setSettings(prev => ({ ...prev, logo_url: data.url }));
        showToast('Logo uploaded successfully!', 'success');
      } else {
        showToast(data.message || 'Logo upload failed', 'error');
      }
    } catch (err) {
      console.error('Upload error:', err);
      showToast('Error uploading logo', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(apiUrl('/api/cms'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'company_settings',
          value: settings
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Company settings updated successfully!', 'success');
      } else {
        showToast(data.message || 'Failed to update settings', 'error');
      }
    } catch (err) {
      console.error('Save settings error:', err);
      showToast('Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Company Settings</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Manage company metadata, contact information, taxation details, and brand logo.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading settings...
        </div>
      ) : (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
          {/* Card: Brand & Logo */}
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', fontWeight: 600 }}>
              Brand Identity
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input 
                  type="text" 
                  name="company_name" 
                  required
                  className="form-control" 
                  value={settings.company_name}
                  onChange={handleChange}
                  placeholder="e.g. Dhanti Masala"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Company Logo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.5rem' }}>
                  {settings.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={settings.logo_url} 
                      alt="Company Logo Preview" 
                      style={{ height: '60px', width: '60px', objectFit: 'contain', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '4px', backgroundColor: '#fcfcfc' }} 
                    />
                  ) : (
                    <div style={{ height: '60px', width: '60px', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.7rem', textAlign: 'center', padding: '4px' }}>
                      No Logo
                    </div>
                  )}
                  <div style={{ flexGrow: 1 }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      disabled={uploading}
                      style={{ display: 'none' }}
                      id="logo-upload-input"
                    />
                    <label 
                      htmlFor="logo-upload-input" 
                      className="btn btn-secondary" 
                      style={{ display: 'inline-block', cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '4px' }}
                    >
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </label>
                    <input 
                      type="text" 
                      name="logo_url" 
                      className="form-control" 
                      style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}
                      value={settings.logo_url}
                      onChange={handleChange}
                      placeholder="Or enter logo image URL directly"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Brand Tagline / Footer Description</label>
                <input 
                  type="text" 
                  name="footer_tagline" 
                  className="form-control" 
                  value={settings.footer_tagline}
                  onChange={handleChange}
                  placeholder="e.g. Traditional aromatic South Indian spices, handcrafted in small batches."
                />
              </div>
            </div>
          </div>

          {/* Card: Contact Details */}
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', fontWeight: 600 }}>
              Contact Information
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Contact Email *</label>
                <input 
                  type="email" 
                  name="email" 
                  required
                  className="form-control" 
                  value={settings.email}
                  onChange={handleChange}
                  placeholder="contact@dhantifoods.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone *</label>
                <input 
                  type="text" 
                  name="phone" 
                  required
                  className="form-control" 
                  value={settings.phone}
                  onChange={handleChange}
                  placeholder="+91 866-0881905"
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Office Address *</label>
                <textarea 
                  name="address" 
                  required
                  rows={3}
                  className="form-control" 
                  value={settings.address}
                  onChange={handleChange}
                  style={{ fontFamily: 'inherit', resize: 'vertical' }}
                  placeholder="e.g. Bangalore, Karnataka, India"
                />
              </div>
            </div>
          </div>

          {/* Card: Legal / Registration Details */}
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', fontWeight: 600 }}>
              Registrations & Legal
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">GSTIN (Optional)</label>
                <input 
                  type="text" 
                  name="gstin" 
                  className="form-control" 
                  value={settings.gstin}
                  onChange={handleChange}
                  placeholder="e.g. 29XXXXX1234F1Z5"
                />
              </div>

              <div className="form-group">
                <label className="form-label">FSSAI License Number (Optional)</label>
                <input 
                  type="text" 
                  name="fssai" 
                  className="form-control" 
                  value={settings.fssai}
                  onChange={handleChange}
                  placeholder="e.g. 12345678901234"
                />
              </div>
            </div>
          </div>

          {/* Card: Social Links */}
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', fontWeight: 600 }}>
              Social Media Handles
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Instagram Link</label>
                <input 
                  type="text" 
                  name="social_instagram" 
                  className="form-control" 
                  value={settings.social_instagram}
                  onChange={handleChange}
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Facebook Link</label>
                <input 
                  type="text" 
                  name="social_facebook" 
                  className="form-control" 
                  value={settings.social_facebook}
                  onChange={handleChange}
                  placeholder="https://facebook.com/..."
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving} 
            className="btn btn-primary"
            style={{ height: '48px', minWidth: '220px', alignSelf: 'flex-start' }}
          >
            {saving ? 'Saving Settings...' : 'Save Settings'}
          </button>
        </form>
      )}
    </div>
  );
}
