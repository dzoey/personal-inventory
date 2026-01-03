import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Package, Mail, Lock, LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <Package size={48} color="var(--primary-color)" />
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Sign in to your inventory account
          </p>
        </div>

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
            <label className="label">
              <Mail size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
              Email
            </label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="label">
              <Lock size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
              Password
            </label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '1rem', height: '1rem' }}></div>
                Signing in...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>

          <div style={{
            textAlign: 'center',
            margin: '1rem 0',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
          }}>
            or
          </div>

          <button
            type="button"
            onClick={googleLogin}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem' }}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-color)',
        }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: 'var(--primary-color)',
                textDecoration: 'none',
                fontWeight: '500',
              }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

// Made with Bob
