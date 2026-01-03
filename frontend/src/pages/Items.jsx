import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, Search, Filter, Image, Barcode } from 'lucide-react';
import { itemsAPI, categoriesAPI, locationsAPI, aiAPI, barcodeAPI } from '../services/api';

const Items = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [filterCategory, filterLocation]);

  const loadData = async () => {
    try {
      const params = {};
      if (filterCategory) params.category_id = filterCategory;
      if (filterLocation) params.location_id = filterLocation;

      const [itemsRes, categoriesRes, locationsRes] = await Promise.all([
        itemsAPI.getAll(params),
        categoriesAPI.getAll(),
        locationsAPI.getAll(),
      ]);

      setItems(itemsRes.data.items || []);
      setCategories(categoriesRes.data.categories || []);
      setLocations(locationsRes.data.locations || []);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    try {
      setLoading(true);
      const response = await itemsAPI.search(searchQuery);
      setItems(response.data.items || []);
    } catch (error) {
      console.error('Error searching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items;

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
            Items
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage your inventory items
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="grid grid-cols-1" style={{ gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="input"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              style={{ flex: 1 }}
            />
            <button onClick={handleSearch} className="btn btn-primary">
              <Search size={18} />
              Search
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label className="label">
                <Filter size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Category
              </label>
              <select
                className="input"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <label className="label">
                <Filter size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Location
              </label>
              <select
                className="input"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
              >
                <option value="">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Package size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            No items found
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {searchQuery || filterCategory || filterLocation
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first item'}
          </p>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus size={18} />
            Add Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 grid-cols-3">
          {filteredItems.map((item) => (
            <Link
              key={item.id}
              to={`/items/${item.id}`}
              className="card"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow)';
              }}
            >
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '0.375rem',
                    marginBottom: '1rem',
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '200px',
                  backgroundColor: 'var(--bg-color)',
                  borderRadius: '0.375rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}>
                  <Package size={48} color="var(--text-secondary)" style={{ opacity: 0.3 }} />
                </div>
              )}

              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {item.name}
              </h3>

              {item.description && (
                <p style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.75rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {item.description}
                </p>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {item.category_name && (
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: 'var(--primary-color)',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                  }}>
                    {item.category_name}
                  </span>
                )}
                {item.location_name && (
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    color: 'var(--warning-color)',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                  }}>
                    {item.location_name}
                  </span>
                )}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-color)',
              }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Quantity
                </span>
                <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                  {item.quantity}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Add Item Modal - Placeholder */}
      {showAddModal && (
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
          <div className="card" style={{ maxWidth: '500px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              Add New Item
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Item creation form will be implemented in the next step.
            </p>
            <button
              onClick={() => setShowAddModal(false)}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Items;

// Made with Bob
