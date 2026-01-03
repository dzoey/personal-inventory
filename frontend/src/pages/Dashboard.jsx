import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Grid, MapPin, Box, TrendingUp } from 'lucide-react';
import { itemsAPI, categoriesAPI, locationsAPI, containersAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalCategories: 0,
    totalLocations: 0,
    totalContainers: 0,
  });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [itemsRes, categoriesRes, locationsRes, containersRes] = await Promise.all([
        itemsAPI.getAll({ limit: 5 }),
        categoriesAPI.getAll(),
        locationsAPI.getAll(),
        containersAPI.getAll(),
      ]);

      setStats({
        totalItems: itemsRes.data.total || itemsRes.data.items?.length || 0,
        totalCategories: categoriesRes.data.categories?.length || 0,
        totalLocations: locationsRes.data.locations?.length || 0,
        totalContainers: containersRes.data.containers?.length || 0,
      });

      setRecentItems(itemsRes.data.items || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Items', value: stats.totalItems, icon: Package, color: '#3b82f6', link: '/items' },
    { label: 'Categories', value: stats.totalCategories, icon: Grid, color: '#10b981', link: '/categories' },
    { label: 'Locations', value: stats.totalLocations, icon: MapPin, color: '#f59e0b', link: '/locations' },
    { label: 'Containers', value: stats.totalContainers, icon: Box, color: '#8b5cf6', link: '/containers' },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Overview of your inventory system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 grid-cols-2" style={{ marginBottom: '2rem' }}>
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              to={stat.link}
              style={{ textDecoration: 'none' }}
            >
              <div className="card" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow)';
              }}
              >
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '0.5rem',
                  backgroundColor: `${stat.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={24} color={stat.color} />
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    {stat.label}
                  </p>
                  <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Items */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} />
            Recent Items
          </h2>
          <Link to="/items" className="btn btn-primary" style={{ fontSize: '0.875rem' }}>
            View All
          </Link>
        </div>

        {recentItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No items yet. Start by adding your first item!</p>
            <Link to="/items" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Add Item
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentItems.map((item) => (
              <Link
                key={item.id}
                to={`/items/${item.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-color)',
                  borderRadius: '0.375rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e2e8f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-color)';
                }}
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    style={{
                      width: '3rem',
                      height: '3rem',
                      objectFit: 'cover',
                      borderRadius: '0.375rem',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    backgroundColor: 'var(--border-color)',
                    borderRadius: '0.375rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Package size={20} color="var(--text-secondary)" />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{item.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Quantity: {item.quantity}
                    {item.category_name && ` • ${item.category_name}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

// Made with Bob
