import React, { useEffect, useState } from 'react';
import { MapPin, Plus, Edit, Trash2 } from 'lucide-react';
import { locationsAPI } from '../services/api';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const response = await locationsAPI.getAll();
      setLocations(response.data.locations || []);
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (editingLocation) {
        await locationsAPI.update(editingLocation.id, formData);
      } else {
        await locationsAPI.create(formData);
      }
      await loadLocations();
      handleCloseModal();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save location');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    try {
      await locationsAPI.delete(id);
      await loadLocations();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete location');
    }
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormData({ name: location.name, description: location.description || '' });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLocation(null);
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
            Locations
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage storage locations for your items
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          Add Location
        </button>
      </div>

      {locations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <MapPin size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            No locations yet
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Create your first location to track where items are stored
          </p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={18} />
            Add Location
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 grid-cols-3">
          {locations.map((location) => (
            <div key={location.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <MapPin size={24} color="var(--warning-color)" />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleEdit(location)}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem' }}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(location.id)}
                    className="btn btn-danger"
                    style={{ padding: '0.5rem' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {location.name}
              </h3>

              {location.description && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  {location.description}
                </p>
              )}

              <div style={{
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-color)',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
              }}>
                {location.item_count || 0} items
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
              {editingLocation ? 'Edit Location' : 'Add Location'}
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
                  placeholder="Garage, Basement, Office, etc."
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
                    editingLocation ? 'Update' : 'Create'
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

export default Locations;

// Made with Bob
