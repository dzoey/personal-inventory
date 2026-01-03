import React, { useEffect, useState } from 'react';
import { Box, Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { containersAPI, locationsAPI } from '../services/api';

const Containers = () => {
  const [containers, setContainers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContainer, setEditingContainer] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', location_id: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [containersRes, locationsRes] = await Promise.all([
        containersAPI.getAll(),
        locationsAPI.getAll(),
      ]);
      setContainers(containersRes.data.containers || []);
      setLocations(locationsRes.data.locations || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const data = {
        name: formData.name,
        description: formData.description,
        location_id: formData.location_id || null,
      };

      if (editingContainer) {
        await containersAPI.update(editingContainer.id, data);
      } else {
        await containersAPI.create(data);
      }
      await loadData();
      handleCloseModal();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save container');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this container?')) return;

    try {
      await containersAPI.delete(id);
      await loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete container');
    }
  };

  const handleEdit = (container) => {
    setEditingContainer(container);
    setFormData({
      name: container.name,
      description: container.description || '',
      location_id: container.location_id || '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingContainer(null);
    setFormData({ name: '', description: '', location_id: '' });
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
            Containers
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage storage containers and boxes
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          Add Container
        </button>
      </div>

      {containers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Box size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            No containers yet
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Create your first container to organize items within locations
          </p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={18} />
            Add Container
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 grid-cols-3">
          {containers.map((container) => (
            <div key={container.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Box size={24} color="#8b5cf6" />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleEdit(container)}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem' }}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(container.id)}
                    className="btn btn-danger"
                    style={{ padding: '0.5rem' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {container.name}
              </h3>

              {container.description && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  {container.description}
                </p>
              )}

              {container.location_name && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.25rem 0.75rem',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    color: 'var(--warning-color)',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                  }}>
                    <MapPin size={12} />
                    {container.location_name}
                  </span>
                </div>
              )}

              <div style={{
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-color)',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
              }}>
                {container.item_count || 0} items
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
              {editingContainer ? 'Edit Container' : 'Add Container'}
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
                  placeholder="Box A, Shelf 1, etc."
                  required
                  disabled={saving}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Location</label>
                <select
                  className="input"
                  value={formData.location_id}
                  onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                  disabled={saving}
                >
                  <option value="">No location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
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
                    editingContainer ? 'Update' : 'Create'
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

export default Containers;

// Made with Bob
