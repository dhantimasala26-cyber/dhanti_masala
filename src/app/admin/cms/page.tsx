'use client';

import React, { useEffect, useState } from 'react';
import { CMSHero, CMSTestimonial, CMSWhyChooseItem, CMSQualityStep, CMSFeaturedMeal } from '@/lib/types';
import { useToast } from '@/context/ToastContext';
import { apiUrl } from '@/lib/api';

export default function AdminCMSPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // Section States
  const [hero, setHero] = useState<CMSHero>({
    title: '',
    subheading: '',
    cta_shop: '',
    cta_learn: '',
    banner_image: ''
  });

  const [testimonials, setTestimonials] = useState<CMSTestimonial[]>([]);
  const [whyChooseUs, setWhyChooseUs] = useState<CMSWhyChooseItem[]>([]);
  const [qualityProcess, setQualityProcess] = useState<CMSQualityStep[]>([]);
  const [featuredMeal, setFeaturedMeal] = useState<CMSFeaturedMeal>({
    title: '',
    subheading: '',
    button_text: ''
  });

  const loadCMSData = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/cms'));
      const data = await res.json();
      if (data.success && data.cms) {
        const c = data.cms;
        if (c.hero) setHero(c.hero);
        if (c.testimonials) setTestimonials(c.testimonials);
        if (c.why_choose_us && c.why_choose_us.items) setWhyChooseUs(c.why_choose_us.items);
        if (c.quality_process && c.quality_process.steps) setQualityProcess(c.quality_process.steps);
        if (c.featured_meal_section) setFeaturedMeal(c.featured_meal_section);
      }
    } catch (err) {
      console.error('Error fetching CMS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCMSData();
  }, []);

  const handleSaveSection = async (key: string, value: any) => {
    setSavingKey(key);
    try {
      const res = await fetch(apiUrl('/api/cms'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });

      const data = await res.json();
      if (data.success) {
        showToast(`CMS section "${key.toUpperCase()}" updated successfully!`, 'success');
      } else {
        showToast(data.message || 'Failed to update section', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error updating section', 'error');
    } finally {
      setSavingKey(null);
    }
  };

  const handleHeroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setHero(prev => ({ ...prev, [name]: value }));
  };

  const handleFeaturedMealChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFeaturedMeal(prev => ({ ...prev, [name]: value }));
  };

  const handleTestimonialChange = (index: number, field: keyof CMSTestimonial, value: any) => {
    setTestimonials(prev => prev.map((t, idx) => {
      if (idx === index) {
        return { ...t, [field]: value };
      }
      return t;
    }));
  };

  const handleWhyChooseChange = (index: number, field: keyof CMSWhyChooseItem, value: string) => {
    setWhyChooseUs(prev => prev.map((item, idx) => {
      if (idx === index) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleQualityChange = (index: number, field: keyof CMSQualityStep, value: string) => {
    setQualityProcess(prev => prev.map((step, idx) => {
      if (idx === index) {
        return { ...step, [field]: value };
      }
      return step;
    }));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>CMS Content Editor</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Edit copy text, headings, marketing banners, and user reviews directly from this manager.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading CMS contents...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* 1. Hero Section Card */}
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              Homepage Hero Banner Content
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Hero Banner Main Title</label>
                <input 
                  type="text" 
                  name="title" 
                  className="form-control" 
                  value={hero.title}
                  onChange={handleHeroChange}
                />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Hero Subtitle Text</label>
                <textarea 
                  name="subheading" 
                  rows={3} 
                  className="form-control" 
                  value={hero.subheading}
                  onChange={handleHeroChange}
                  style={{ fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Shop Button Link Text</label>
                <input 
                  type="text" 
                  name="cta_shop" 
                  className="form-control" 
                  value={hero.cta_shop}
                  onChange={handleHeroChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Learn More Link Text</label>
                <input 
                  type="text" 
                  name="cta_learn" 
                  className="form-control" 
                  value={hero.cta_learn}
                  onChange={handleHeroChange}
                />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Banner Image File Path</label>
                <input 
                  type="text" 
                  name="banner_image" 
                  className="form-control" 
                  value={hero.banner_image}
                  onChange={handleHeroChange}
                />
              </div>
            </div>
            <button 
              onClick={() => handleSaveSection('hero', hero)} 
              disabled={savingKey === 'hero'} 
              className="btn btn-primary"
              style={{ minWidth: '180px' }}
            >
              {savingKey === 'hero' ? 'Updating Section...' : 'Save Hero Banner'}
            </button>
          </div>

          {/* 2. USP: Why Choose Us Items */}
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              Why Customers Choose Dhanti Masala (4-Grid USPs)
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {whyChooseUs.map((item, idx) => (
                <div key={idx} style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-light)' }}>
                  <h4 style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-primary)' }}>Card {idx + 1}: {item.title || 'Untitled'}</h4>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={item.title}
                      onChange={(e) => handleWhyChooseChange(idx, 'title', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description Text</label>
                    <textarea 
                      rows={2} 
                      className="form-control" 
                      value={item.description}
                      onChange={(e) => handleWhyChooseChange(idx, 'description', e.target.value)}
                      style={{ fontFamily: 'inherit', resize: 'vertical' }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => handleSaveSection('why_choose_us', { items: whyChooseUs })} 
              disabled={savingKey === 'why_choose_us'} 
              className="btn btn-primary"
              style={{ minWidth: '180px' }}
            >
              {savingKey === 'why_choose_us' ? 'Updating Section...' : 'Save USP Grid'}
            </button>
          </div>

          {/* 3. Grinding & Roasting Quality Process Steps */}
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              Spice Roasting &amp; Grinding Quality Steps
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {qualityProcess.map((step, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '0.3fr 1fr 2fr', gap: '1rem', alignItems: 'center', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-light)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-secondary)' }}>Step {idx + 1}</div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Step title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={step.title}
                      onChange={(e) => handleQualityChange(idx, 'title', e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Step details</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={step.description}
                      onChange={(e) => handleQualityChange(idx, 'description', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => handleSaveSection('quality_process', { steps: qualityProcess })} 
              disabled={savingKey === 'quality_process'} 
              className="btn btn-primary"
              style={{ minWidth: '180px' }}
            >
              {savingKey === 'quality_process' ? 'Updating Section...' : 'Save Process Flow'}
            </button>
          </div>

          {/* 4. Customer Testimonials */}
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              Customer Testimonials &amp; Quotes
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {testimonials.map((t, idx) => (
                <div key={idx} style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-light)' }}>
                  <h4 style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-primary)' }}>Reviewer {idx + 1}: {t.name || 'Anonymous'}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Client Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={t.name}
                        onChange={(e) => handleTestimonialChange(idx, 'name', e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Location / City</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={t.location}
                        onChange={(e) => handleTestimonialChange(idx, 'location', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stars rating (1 to 5)</label>
                    <select 
                      className="form-control" 
                      value={t.stars}
                      onChange={(e) => handleTestimonialChange(idx, 'stars', parseInt(e.target.value))}
                    >
                      <option value={1}>⭐ (1 Star)</option>
                      <option value={2}>⭐⭐ (2 Stars)</option>
                      <option value={3}>⭐⭐⭐ (3 Stars)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                      <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Comment / Review content</label>
                    <textarea 
                      rows={3} 
                      className="form-control" 
                      value={t.comment}
                      onChange={(e) => handleTestimonialChange(idx, 'comment', e.target.value)}
                      style={{ fontFamily: 'inherit', resize: 'vertical' }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => handleSaveSection('testimonials', testimonials)} 
              disabled={savingKey === 'testimonials'} 
              className="btn btn-primary"
              style={{ minWidth: '180px' }}
            >
              {savingKey === 'testimonials' ? 'Updating Section...' : 'Save Testimonials'}
            </button>
          </div>

          {/* 5. Featured Meal / Secondary Banner */}
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              The Soul of South Indian Dining Banner Copy
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Section Header</label>
                <input 
                  type="text" 
                  name="title" 
                  className="form-control" 
                  value={featuredMeal.title}
                  onChange={handleFeaturedMealChange}
                />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Section Description Copy</label>
                <textarea 
                  name="subheading" 
                  rows={3} 
                  className="form-control" 
                  value={featuredMeal.subheading}
                  onChange={handleFeaturedMealChange}
                  style={{ fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">CTA Button Label</label>
                <input 
                  type="text" 
                  name="button_text" 
                  className="form-control" 
                  value={featuredMeal.button_text}
                  onChange={handleFeaturedMealChange}
                />
              </div>
            </div>
            
            <button 
              onClick={() => handleSaveSection('featured_meal_section', featuredMeal)} 
              disabled={savingKey === 'featured_meal_section'} 
              className="btn btn-primary"
              style={{ minWidth: '180px' }}
            >
              {savingKey === 'featured_meal_section' ? 'Updating Section...' : 'Save Banner Copy'}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
