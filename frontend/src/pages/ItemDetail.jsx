import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Package, Edit, Trash2, ArrowLeft, MapPin, Grid, Box, Calendar } from 'lucide-react';
import { itemsAPI } from '../services/api';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadItem();
  }, [id]);

  const loadItem = async () => {
    try {
      const response = await itemsAPI.getById(id);
      setItem(response.data.item);
    } catch (error) {
      console.error('Error loading item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await itemsAPI.delete(id);
      navigate('/items');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <Package size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Item not found
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          The item you're looking for doesn't exist.
        </p>
        <Link to="/items" className="btn btn-primary">
          <ArrowLeft size={18} />
          Back to Items
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link
          to="/items"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            marginBottom: '1rem',
            fontSize: '0.875rem',
          }}
        >
          <ArrowLeft size={16} />
          Back to Items
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {item.name}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Item Details
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary">
              <Edit size={18} />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-danger"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 grid-cols-2">
        {/* Image */}
        <div className="card">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '500px',
                objectFit: 'contain',
                borderRadius: '0.375rem',
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '300px',
              backgroundColor: 'var(--bg-color)',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Package size={64} color="var(--text-secondary)" style={{ opacity: 0.3 }} />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            Information
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Quantity */}
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                Quantity
              </label>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                {item.quantity}
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <div>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                  Description
                </label>
                <p style={{ color: 'var(--text-primary)' }}>
                  {item.description}
                </p>
              </div>
            )}

            {/* Category */}
            {item.category_name && (
              <div>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                  <Grid size={14} />
                  Category
                </label>
                <span style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: 'var(--primary-color)',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                }}>
                  {item.category_name}
                </span>
              </div>
            )}

            {/* Location */}
            {item.location_name && (
              <div>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                  <MapPin size={14} />
                  Location
                </label>
                <span style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  color: 'var(--warning-color)',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                }}>
                  {item.location_name}
                </span>
              </div>
            )}

            {/* Container */}
            {item.container_name && (
              <div>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                  <Box size={14} />
                  Container
                </label>
                <span style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  color: '#8b5cf6',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                }}>
                  {item.container_name}
                </span>
              </div>
            )}

            {/* Barcode */}
            {item.barcode && (
              <div>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                  Barcode
                </label>
                <code style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--bg-color)',
                  borderRadius: '0.375rem',
                  fontFamily: 'monospace',
                }}>
                  {item.barcode}
                </code>
              </div>
            )}

            {/* Dates */}
            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <Calendar size={14} />
                <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
              </div>
              {item.updated_at && item.updated_at !== item.created_at && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <Calendar size={14} />
                  <span>Updated: {new Date(item.updated_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
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
          <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Delete Item
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Are you sure you want to delete "{item.name}"? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-secondary"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-danger"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="spinner" style={{ width: '1rem', height: '1rem' }}></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetail;

// Made with Bob
