import React, { useEffect, useState } from 'react';
import { Grid, Plus, Edit, Trash2 } from 'lucide-react';
import { categoriesAPI } from '../services/api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory.id, formData);
      } else {
        await categoriesAPI.create(formData);
      }
      await loadCategories();
      handleCloseModal();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await categoriesAPI.delete(id);
      await loadCategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setError('');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Categories
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Organize your items into categories
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Grid size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            No categories yet
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Create your first category to organize your items
          </p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={18} />
            Add Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 grid-cols-3">
          {categories.map((category) => (
            <div key={category.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Grid size={24} color="var(--primary-color)" />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleEdit(category)}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem' }}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="btn btn-danger"
                    style={{ padding: '0.5rem' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {category.name}
              </h3>

              {category.description && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  {category.description}
                </p>
              )}

              <div style={{
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-color)',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
              }}>
                {category.item_count || 0} items
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h2>

            {error && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '0.375rem',
                marginBottom: '1rem',
              }}>
                <p className="error" style={{ margin: 0 }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Name *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Electronics, Books, etc."
                  required
                  disabled={saving}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">Description</label>
                <textarea
                  className="input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description..."
                  rows={3}
                  disabled={saving}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="spinner" style={{ width: '1rem', height: '1rem' }}></div>
                      Saving...
                    </>
                  ) : (
                    editingCategory ? 'Update' : 'Create'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;

// Made with Bob
