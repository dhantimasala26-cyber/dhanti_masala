'use client';

import React, { useEffect, useState } from 'react';
import { Product, Category } from '@/lib/types';
import { Modal } from '@/components/UI/Modal';
import { useToast } from '@/context/ToastContext';
import { apiUrl } from '@/lib/api';

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState<string>('');

  const [newVariantInput, setNewVariantInput] = useState('');

  const PRESET_WEIGHTS = ['50g', '100g', '200g', '250g', '500g', '1kg', '2kg', '5kg'];

  const toggleWeightVariant = (variantName: string) => {
    const cleanVariant = variantName.trim();
    if (!cleanVariant) return;

    const currentVariants = formData.weight_variants
      ? formData.weight_variants.split(',').map(v => v.trim()).filter(Boolean)
      : [];

    const exists = currentVariants.includes(cleanVariant);
    let updatedVariants: string[];

    let currentStocks: Record<string, number> = {};
    try {
      currentStocks = JSON.parse(formData.stock_quantities || '{}');
    } catch (e) {}

    if (exists) {
      updatedVariants = currentVariants.filter(v => v !== cleanVariant);
      delete currentStocks[cleanVariant];
    } else {
      updatedVariants = [...currentVariants, cleanVariant];
      currentStocks[cleanVariant] = currentStocks[cleanVariant] ?? 0;
    }

    setFormData(prev => ({
      ...prev,
      weight_variants: updatedVariants.join(', '),
      stock_quantities: JSON.stringify(currentStocks)
    }));
  };

  const addWeightVariant = (variantName: string) => {
    const cleanVariant = variantName.trim();
    if (!cleanVariant) return;

    const currentVariants = formData.weight_variants
      ? formData.weight_variants.split(',').map(v => v.trim()).filter(Boolean)
      : [];

    if (currentVariants.includes(cleanVariant)) {
      showToast('Variant already exists', 'warning');
      return;
    }

    const updatedVariants = [...currentVariants, cleanVariant];
    
    let currentStocks: Record<string, number> = {};
    try {
      currentStocks = JSON.parse(formData.stock_quantities || '{}');
    } catch (e) {}
    if (!(cleanVariant in currentStocks)) {
      currentStocks[cleanVariant] = 0;
    }

    setFormData(prev => ({
      ...prev,
      weight_variants: updatedVariants.join(', '),
      stock_quantities: JSON.stringify(currentStocks)
    }));
    setNewVariantInput('');
  };

  const removeWeightVariant = (variantName: string) => {
    const currentVariants = formData.weight_variants
      ? formData.weight_variants.split(',').map(v => v.trim()).filter(Boolean)
      : [];

    const updatedVariants = currentVariants.filter(v => v !== variantName);

    let currentStocks: Record<string, number> = {};
    try {
      currentStocks = JSON.parse(formData.stock_quantities || '{}');
    } catch (e) {}
    delete currentStocks[variantName];

    setFormData(prev => ({
      ...prev,
      weight_variants: updatedVariants.join(', '),
      stock_quantities: JSON.stringify(currentStocks)
    }));
  };

  const updateVariantStock = (variantName: string, qty: number) => {
    let currentStocks: Record<string, number> = {};
    try {
      currentStocks = JSON.parse(formData.stock_quantities || '{}');
    } catch (e) {}
    
    currentStocks[variantName] = Math.max(0, qty);

    setFormData(prev => ({
      ...prev,
      stock_quantities: JSON.stringify(currentStocks)
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formDataBody = new FormData();
    formDataBody.append('file', file);

    try {
      const res = await fetch(apiUrl('/api/upload'), {
        method: 'POST',
        body: formDataBody,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setFormData(prev => ({ ...prev, image_url: data.url }));
        showToast('Image uploaded successfully', 'success');
      } else {
        showToast(data.message || 'Failed to upload image', 'error');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      showToast('Error uploading file', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    short_description: '',
    description: '',
    category_id: '',
    price: '',
    discount_price: '',
    sku: '',
    featured: false,
    status: 'active' as 'active' | 'draft' | 'archived',
    weight_variants: '250g, 500g, 1kg',
    stock_quantities: '{"250g": 50, "500g": 30, "1kg": 15}',
    image_url: '/rasam_powder.jpg',
    shelf_life: '',
    origin: '',
    purity_checklist: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [resProd, resCat] = await Promise.all([
        fetch(apiUrl('/api/products')),
        fetch(apiUrl('/api/categories'))
      ]);

      const dataProd = await resProd.json();
      const dataCat = await resCat.json();

      if (dataProd.success) setProducts(dataProd.products);
      if (dataCat.success) setCategories(dataCat.categories);
    } catch (err) {
      console.error('Error loading products page data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      slug: '',
      short_description: '',
      description: '',
      category_id: categories[0]?.id || '',
      price: '',
      discount_price: '',
      sku: '',
      featured: false,
      status: 'active',
      weight_variants: '250g, 500g, 1kg',
      stock_quantities: '{"250g": 50, "500g": 30, "1kg": 15}',
      image_url: '/rasam_powder.jpg',
      shelf_life: '',
      origin: '',
      purity_checklist: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      slug: product.slug,
      short_description: product.short_description || '',
      description: product.description || '',
      category_id: product.category_id || '',
      price: product.price.toString(),
      discount_price: product.discount_price?.toString() || '',
      sku: product.sku || '',
      featured: product.featured,
      status: product.status,
      weight_variants: product.weight_variants?.join(', ') || '250g, 500g, 1kg',
      stock_quantities: JSON.stringify(product.stock_quantities) || '{"250g": 0}',
      image_url: product.images?.[0] || '/rasam_powder.jpg',
      shelf_life: product.shelf_life || '',
      origin: product.origin || '',
      purity_checklist: product.purity_checklist || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirmId(id);
    setDeleteConfirmName(name);
  };

  const executeDelete = async (id: string) => {
    try {
      const res = await fetch(apiUrl(`/api/products?id=${id}`), { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.filter(p => p.id !== id));
        showToast('Product deleted successfully', 'success');
      } else {
        showToast(data.message || 'Failed to delete', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error deleting product', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse weight variants & stocks
    const weights = formData.weight_variants.split(',').map(s => s.trim()).filter(Boolean);
    let stocks = {};
    try {
      stocks = JSON.parse(formData.stock_quantities);
    } catch (err) {
      showToast('Invalid JSON for stock quantities. Format: {"250g": 10, "500g": 5}', 'error');
      return;
    }

    const payload = {
      id: editingId,
      name: formData.name,
      slug: formData.slug,
      short_description: formData.short_description,
      description: formData.description,
      category_id: formData.category_id || null,
      images: [formData.image_url],
      price: formData.price,
      discount_price: formData.discount_price || null,
      weight_variants: weights,
      stock_quantities: stocks,
      sku: formData.sku || null,
      featured: formData.featured,
      status: formData.status,
      shelf_life: formData.shelf_life || null,
      origin: formData.origin || null,
      purity_checklist: formData.purity_checklist || null
    };

    try {
      const url = apiUrl('/api/products');
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        showToast(editingId ? 'Product updated successfully' : 'Product created successfully', 'success');
        loadData(); // reload
      } else {
        showToast(data.message || 'Save failed', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving product', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Products Manager</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Add, edit, or archive Dhanti Masala catalog products.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>
          &#43; Add Product
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading products catalog...
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8F9FA', borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                <th style={{ padding: '1rem' }}>Product Name</th>
                <th>Category</th>
                <th>Base Price</th>
                <th>Stock (250g / 500g / 1kg)</th>
                <th>Status</th>
                <th style={{ textAlign: 'right', paddingRight: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img 
                      src={prod.images?.[0] || '/rasam_powder.jpg'} 
                      alt={prod.name} 
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600 }}>{prod.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>SKU: {prod.sku || 'N/A'}</div>
                    </div>
                  </td>
                  <td>{prod.category?.name || 'Unassigned'}</td>
                  <td style={{ fontWeight: 700 }}>
                    ₹{prod.discount_price || prod.price}
                    {prod.discount_price && <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginLeft: '0.4rem' }}>₹{prod.price}</span>}
                  </td>
                  <td>
                    {prod.weight_variants?.map(w => (
                      <span key={w} style={{ display: 'inline-block', padding: '0.1rem 0.4rem', backgroundColor: '#F0ECE9', borderRadius: '4px', fontSize: '0.75rem', marginRight: '0.4rem', fontWeight: 600 }}>
                        {w}: {prod.stock_quantities?.[w] ?? 0}
                      </span>
                    ))}
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '50px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: prod.status === 'active' ? 'rgba(46, 90, 68, 0.1)' : 'rgba(194, 68, 68, 0.1)',
                      color: prod.status === 'active' ? 'var(--color-success)' : 'var(--color-error)'
                    }}>
                      {prod.status.toUpperCase()}
                    </span>
                    {prod.featured && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: 'var(--color-secondary)', fontWeight: 800 }}>★ FEATURED</span>}
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '1rem' }}>
                    <button onClick={() => handleOpenEdit(prod)} className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', marginRight: '0.5rem' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDeleteClick(prod.id, prod.name)} className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Product' : 'Add New Product'}
        size="large"
      >
        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', padding: '1rem 0' }}>
          
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input 
              type="text" 
              name="name" 
              required 
              className="form-control" 
              value={formData.name} 
              onChange={handleInputChange} 
              placeholder="e.g. Traditional Rasam Powder"
            />
          </div>

          <div className="form-group">
            <label className="form-label">URL Slug *</label>
            <input 
              type="text" 
              name="slug" 
              required 
              className="form-control" 
              value={formData.slug} 
              onChange={handleInputChange} 
              placeholder="e.g. rasam-powder"
            />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Short Description</label>
            <input 
              type="text" 
              name="short_description" 
              className="form-control" 
              value={formData.short_description} 
              onChange={handleInputChange} 
              placeholder="Brief tagline for cards"
            />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Long Description / Ingredients</label>
            <textarea 
              name="description" 
              rows={4} 
              className="form-control" 
              value={formData.description} 
              onChange={handleInputChange} 
              placeholder="Full detail recipe story, ingredients checklist..."
              style={{ fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select 
              name="category_id" 
              className="form-control" 
              value={formData.category_id} 
              onChange={handleInputChange}
            >
              <option value="">Choose category...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">SKU Reference</label>
            <input 
              type="text" 
              name="sku" 
              className="form-control" 
              value={formData.sku} 
              onChange={handleInputChange} 
              placeholder="e.g. DM-RASAM-001"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Base Price (₹) *</label>
            <input 
              type="number" 
              name="price" 
              required 
              className="form-control" 
              value={formData.price} 
              onChange={handleInputChange} 
              placeholder="e.g. 150"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Discount Price (₹)</label>
            <input 
              type="number" 
              name="discount_price" 
              className="form-control" 
              value={formData.discount_price} 
              onChange={handleInputChange} 
              placeholder="Leave blank if no discount"
            />
          </div>

          {/* Weight Variants & Stock Allocator Widget */}
          <div className="form-group" style={{ 
            gridColumn: 'span 2', 
            backgroundColor: '#FCFAF7', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            border: '1px solid var(--color-border)',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '1.1rem', color: 'var(--color-text-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⚖️ Size &amp; Stock Configuration
              </h4>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
                Define weight packet sizes and allocate stock levels.
              </p>
            </div>

            {/* Part 1: Weight Variants */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
                Step 1: Weight Packets Offered (Select common sizes or add custom)
              </label>
              
              {/* Preset buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                {PRESET_WEIGHTS.map(preset => {
                  const variants = formData.weight_variants
                    ? formData.weight_variants.split(',').map(v => v.trim()).filter(Boolean)
                    : [];
                  const isActive = variants.includes(preset);
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => toggleWeightVariant(preset)}
                      style={{
                        padding: '0.4rem 0.9rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        borderRadius: '50px',
                        border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                        backgroundColor: isActive ? 'var(--color-primary)' : 'white',
                        color: isActive ? 'white' : 'var(--color-text-dark)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isActive ? '0 2px 4px rgba(194, 89, 63, 0.2)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                      onMouseOver={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = 'var(--color-primary)';
                          e.currentTarget.style.backgroundColor = '#FCF8F6';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = 'var(--color-border)';
                          e.currentTarget.style.backgroundColor = 'white';
                        }
                      }}
                    >
                      {isActive && <span style={{ fontSize: '0.75rem' }}>✓</span>}
                      {preset}
                    </button>
                  );
                })}
              </div>

              {/* Custom Tag Input */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input 
                  type="text"
                  className="form-control"
                  placeholder="Or enter a custom weight (e.g., 75g)"
                  value={newVariantInput}
                  onChange={(e) => setNewVariantInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addWeightVariant(newVariantInput);
                    }
                  }}
                  style={{ flex: 1, height: '40px', fontSize: '0.9rem' }}
                />
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => addWeightVariant(newVariantInput)}
                  style={{ height: '40px', padding: '0 1.25rem', margin: 0, borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}
                >
                  + Add Custom
                </button>
              </div>

              {/* Active list showing what is selected */}
              <div style={{ backgroundColor: 'white', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', minHeight: '50px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginRight: '0.5rem', fontWeight: 600 }}>Active Sizes:</span>
                {(() => {
                  const variants = formData.weight_variants
                    ? formData.weight_variants.split(',').map(v => v.trim()).filter(Boolean)
                    : [];
                  if (variants.length === 0) {
                    return <span style={{ fontStyle: 'italic', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Select sizes above or add a custom one to begin.</span>;
                  }
                  return variants.map(variant => (
                    <span 
                      key={variant} 
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.35rem', 
                        padding: '0.25rem 0.75rem', 
                        backgroundColor: '#FCF8F6', 
                        color: 'var(--color-primary)', 
                        borderRadius: '50px', 
                        fontSize: '0.8rem', 
                        fontWeight: 700,
                        border: '1px solid #F5E5DF',
                      }}
                    >
                      {variant}
                      <button 
                        type="button" 
                        onClick={() => removeWeightVariant(variant)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer', 
                          color: 'var(--color-primary)', 
                          padding: 0, 
                          fontWeight: 'bold', 
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0.7
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.opacity = '1'; }}
                        onMouseOut={(e) => { e.currentTarget.style.opacity = '0.7'; }}
                      >
                        &times;
                      </button>
                    </span>
                  ));
                })()}
              </div>
            </div>

            {/* Part 2: Stock Allocator */}
            <div>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
                Step 2: Inventory Allocation (Specify stock quantities)
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {(() => {
                  const variants = formData.weight_variants
                    ? formData.weight_variants.split(',').map(v => v.trim()).filter(Boolean)
                    : [];
                  let currentStocks: Record<string, number> = {};
                  try {
                    currentStocks = JSON.parse(formData.stock_quantities || '{}');
                  } catch (e) {}
                  
                  if (variants.length === 0) {
                    return (
                      <div style={{ gridColumn: '1 / -1', border: '1px dashed var(--color-border)', borderRadius: '8px', padding: '1.5rem', textAlign: 'center', backgroundColor: 'white' }}>
                        <span style={{ fontStyle: 'italic', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                          Add or select weight packet variants above to allocate stock quantities.
                        </span>
                      </div>
                    );
                  }

                  return variants.map(variant => {
                    const qty = currentStocks[variant] ?? 0;
                    
                    // Determine stock status styling
                    let statusLabel = 'In Stock';
                    let statusColor = 'var(--color-success)';
                    let statusBg = 'rgba(46, 90, 68, 0.06)';
                    let statusBorder = 'rgba(46, 90, 68, 0.2)';
                    
                    if (qty === 0) {
                      statusLabel = 'Out of Stock';
                      statusColor = 'var(--color-error)';
                      statusBg = 'rgba(194, 68, 68, 0.06)';
                      statusBorder = 'rgba(194, 68, 68, 0.2)';
                    } else if (qty <= 10) {
                      statusLabel = 'Low Stock';
                      statusColor = 'var(--color-secondary)';
                      statusBg = 'rgba(216, 141, 67, 0.06)';
                      statusBorder = 'rgba(216, 141, 67, 0.2)';
                    }

                    return (
                      <div 
                        key={variant} 
                        style={{ 
                          backgroundColor: 'white', 
                          padding: '1rem', 
                          borderRadius: '8px', 
                          border: '1px solid var(--color-border)',
                          boxShadow: 'var(--shadow-sm)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.75rem',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-dark)' }}>
                            📦 {variant}
                          </span>
                          <span style={{ 
                            fontSize: '0.7rem', 
                            fontWeight: 700, 
                            color: statusColor, 
                            backgroundColor: statusBg,
                            border: `1px solid ${statusBorder}`,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '50px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.02em'
                          }}>
                            {statusLabel}
                          </span>
                        </div>

                        {/* Stepper control */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          border: '1px solid var(--color-border)', 
                          borderRadius: '6px', 
                          overflow: 'hidden',
                          backgroundColor: '#FAF9F6'
                        }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              const step = e.shiftKey ? 10 : 1;
                              updateVariantStock(variant, Math.max(0, qty - step));
                            }}
                            title="Decrease Stock (Shift+Click to decrease by 10)"
                            style={{
                              width: '36px',
                              height: '36px',
                              border: 'none',
                              background: '#F0ECE6',
                              color: 'var(--color-text-dark)',
                              fontSize: '1.1rem',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'background-color 0.2s',
                              outline: 'none'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#E5DFD5'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#F0ECE6'; }}
                          >
                            −
                          </button>
                          <input 
                            type="number"
                            min={0}
                            required
                            value={qty}
                            onChange={(e) => updateVariantStock(variant, Math.max(0, parseInt(e.target.value) || 0))}
                            style={{ 
                              flex: 1,
                              border: 'none',
                              background: 'white',
                              height: '36px',
                              fontSize: '0.95rem', 
                              fontWeight: 700,
                              textAlign: 'center',
                              color: 'var(--color-text-dark)',
                              width: '100%',
                              outline: 'none',
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              const step = e.shiftKey ? 10 : 1;
                              updateVariantStock(variant, qty + step);
                            }}
                            title="Increase Stock (Shift+Click to increase by 10)"
                            style={{
                              width: '36px',
                              height: '36px',
                              border: 'none',
                              background: '#F0ECE6',
                              color: 'var(--color-text-dark)',
                              fontSize: '1.1rem',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'background-color 0.2s',
                              outline: 'none'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#E5DFD5'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#F0ECE6'; }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Image Path</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                name="image_url" 
                className="form-control" 
                value={formData.image_url} 
                onChange={handleInputChange} 
                style={{ flex: 1 }}
              />
              <label className="btn btn-secondary" style={{ margin: 0, padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', height: '42px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                {uploading ? 'Uploading...' : 'Choose File'}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select 
              name="status" 
              className="form-control" 
              value={formData.status} 
              onChange={handleInputChange}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Shelf Life</label>
            <input 
              type="text" 
              name="shelf_life" 
              className="form-control" 
              value={formData.shelf_life} 
              onChange={handleInputChange} 
              placeholder="e.g. 6 Months from date of packaging"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Origin</label>
            <input 
              type="text" 
              name="origin" 
              className="form-control" 
              value={formData.origin} 
              onChange={handleInputChange} 
              placeholder="e.g. Bangalore, Karnataka, India"
            />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Purity Checklist</label>
            <input 
              type="text" 
              name="purity_checklist" 
              className="form-control" 
              value={formData.purity_checklist} 
              onChange={handleInputChange} 
              placeholder="e.g. 100% Preservative-free, Handcrafted, Roasted traditionally"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', gridColumn: 'span 2' }}>
            <input 
              type="checkbox" 
              id="featured" 
              name="featured" 
              checked={formData.featured} 
              onChange={handleInputChange} 
              style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
            />
            <label htmlFor="featured" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
              Feature this product on homepage specialties grid
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1rem', gridColumn: 'span 2', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flexGrow: 1, height: '44px' }}>
              Save Product
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
            Are you sure you want to delete the product <strong>{deleteConfirmName}</strong>? This action cannot be undone.
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
