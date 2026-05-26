'use client';

import React, { useEffect, useState } from 'react';
import { Category } from '@/lib/types';
import { Modal } from '@/components/UI/Modal';
import { useToast } from '@/context/ToastContext';
import { apiUrl } from '@/lib/api';

interface CategoryWithCount extends Category {
  productCount?: number;
}

export default function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '/images/category_masala.jpg'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/categories'));
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: '/images/category_masala.jpg'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: CategoryWithCount) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_url: category.image_url || '/images/category_masala.jpg'
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string, name: string, count: number) => {
    if (count > 0) {
      showToast(`Cannot delete category because it contains ${count} product(s). Reassign or delete those products first.`, 'warning');
      return;
    }
    setDeleteConfirmId(id);
    setDeleteConfirmName(name);
  };

  const executeDelete = async (id: string) => {
    try {
      const res = await fetch(apiUrl(`/api/categories?id=${id}`), { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCategories(prev => prev.filter(c => c.id !== id));
        showToast('Category deleted successfully', 'success');
      } else {
        showToast(data.message || 'Failed to delete', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error deleting category', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      id: editingId,
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      image_url: formData.image_url
    };

    try {
      const url = apiUrl('/api/categories');
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        showToast(`Category ${editingId ? 'updated' : 'created'} successfully`, 'success');
        loadData(); // reload list
      } else {
        showToast(data.message || 'Save failed', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving category', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Categories Manager</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Organize Dhanti Masala products into spice groups &amp; health mixes.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>
          &#43; Add Category
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading categories catalog...
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8F9FA', borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                <th style={{ padding: '1rem' }}>Category Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Products Count</th>
                <th style={{ textAlign: 'right', paddingRight: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '1.2rem',
                      fontFamily: 'var(--font-title)',
                      overflow: 'hidden'
                    }}>
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        cat.name[0]
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{cat.name}</div>
                    </div>
                  </td>
                  <td><code>{cat.slug}</code></td>
                  <td style={{ color: 'var(--color-text-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cat.description || 'No description provided'}
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '50px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: (cat.productCount || 0) > 0 ? 'rgba(216, 141, 67, 0.1)' : '#F0ECE9',
                      color: (cat.productCount || 0) > 0 ? 'var(--color-secondary)' : 'var(--color-text-muted)'
                    }}>
                      {cat.productCount || 0} Products
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '1rem' }}>
                    <button onClick={() => handleOpenEdit(cat)} className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', marginRight: '0.5rem' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDeleteClick(cat.id, cat.name, cat.productCount || 0)} className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
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
        title={editingId ? 'Edit Category' : 'Add New Category'}
        size="normal"
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem 0' }}>
          
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input 
              type="text" 
              name="name" 
              required 
              className="form-control" 
              value={formData.name} 
              onChange={handleInputChange} 
              placeholder="e.g. Spices &amp; Masalas"
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
              placeholder="e.g. spices-masalas"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              name="description" 
              rows={3} 
              className="form-control" 
              value={formData.description} 
              onChange={handleInputChange} 
              placeholder="A short introduction describing the spice blend or mix category..."
              style={{ fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Image Path / Illustration Link</label>
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

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flexGrow: 1, height: '44px' }}>
              Save Category
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
            Are you sure you want to delete the category <strong>{deleteConfirmName}</strong>? This action cannot be undone and will affect all unassigned relations.
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
