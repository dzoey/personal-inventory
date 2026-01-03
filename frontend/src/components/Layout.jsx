import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Package, 
  Grid, 
  MapPin, 
  Box, 
  LogOut, 
  Menu, 
  X,
  Home
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/items', label: 'Items', icon: Package },
    { path: '/categories', label: 'Categories', icon: Grid },
    { path: '/locations', label: 'Locations', icon: MapPin },
    { path: '/containers', label: 'Containers', icon: Box },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'var(--card-bg)',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow)',
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Package size={32} color="var(--primary-color)" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              Personal Inventory
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav style={{ display: 'none' }} className="desktop-nav">
            <ul style={{
              display: 'flex',
              gap: '1rem',
              listStyle: 'none',
              alignItems: 'center',
            }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        textDecoration: 'none',
                        color: isActive(item.path) ? 'var(--primary-color)' : 'var(--text-secondary)',
                        backgroundColor: isActive(item.path) ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                        fontWeight: isActive(item.path) ? '600' : '400',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {user?.username || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ display: 'none' }}
              id="desktop-logout"
            >
              <LogOut size={18} />
              Logout
            </button>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-secondary"
              id="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav style={{
            borderTop: '1px solid var(--border-color)',
            padding: '1rem',
          }}>
            <ul style={{ listStyle: 'none' }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path} style={{ marginBottom: '0.5rem' }}>
                    <Link
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem',
                        borderRadius: '0.375rem',
                        textDecoration: 'none',
                        color: isActive(item.path) ? 'var(--primary-color)' : 'var(--text-secondary)',
                        backgroundColor: isActive(item.path) ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                        fontWeight: isActive(item.path) ? '600' : '400',
                      }}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              <li style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem 0' }}>
        <div className="container">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'var(--card-bg)',
        borderTop: '1px solid var(--border-color)',
        padding: '1rem',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '0.875rem',
      }}>
        <div className="container">
          © {new Date().getFullYear()} Personal Inventory System. All rights reserved.
        </div>
      </footer>

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: block !important;
          }
          #desktop-logout {
            display: inline-flex !important;
          }
          #mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;

// Made with Bob
