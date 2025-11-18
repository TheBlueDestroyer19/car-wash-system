import React, { useState } from 'react';
import './Auth.css';

function Auth({ onLogin, onSignup, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    adminSecret: '',
    shopName: '',
    shopAddress: ''
  });
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            ...(role === 'admin' && {
              role: 'admin',
              adminSecret: formData.adminSecret,
              shopName: formData.shopName,
              shopAddress: formData.shopAddress
            })
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      if (isLogin) onLogin(data.token, data.user);
      else onSignup(data.token, data.user);

      setFormData({
        name: '',
        email: '',
        password: '',
        adminSecret: '',
        shopName: '',
        shopAddress: ''
      });
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-container fade-in">
      <div className="auth-card ui-elevated ui-scale-in">
        
        {/* ===== Header ===== */}
        <div className="auth-header">
          <h2 className="auth-title">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          {onClose && (
            <button
              onClick={onClose}
              className="close-button ui-hover-scale"
              type="button"
            >
              ×
            </button>
          )}
        </div>

        {/* ===== Form ===== */}
        <form onSubmit={handleSubmit} className="auth-form">

          {/* Name (Sign up only) */}
          {!isLogin && (
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                placeholder="Enter your name"
              />
            </div>
          )}

          {/* Email */}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              minLength="6"
            />
          </div>

          {/* Role + Admin extra fields */}
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {role === 'admin' && (
                <div className="admin-section fade-in-slight">
                  <div className="form-group">
                    <label>Admin Secret</label>
                    <input
                      type="password"
                      name="adminSecret"
                      value={formData.adminSecret}
                      onChange={handleChange}
                      required={role === 'admin'}
                      placeholder="Enter admin secret"
                    />
                  </div>

                  <div className="form-group">
                    <label>Shop Name</label>
                    <input
                      type="text"
                      name="shopName"
                      value={formData.shopName}
                      onChange={handleChange}
                      required={role === 'admin'}
                      placeholder="Enter your car wash center name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Shop Address</label>
                    <input
                      type="text"
                      name="shopAddress"
                      value={formData.shopAddress}
                      onChange={handleChange}
                      required={role === 'admin'}
                      placeholder="Enter your shop address"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="auth-button ui-hover-lift"
          >
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        {/* ===== Toggle Login/Signup ===== */}
        <div className="auth-toggle">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({
                name: '',
                email: '',
                password: '',
                adminSecret: '',
                shopName: '',
                shopAddress: ''
              });
            }}
            className="toggle-button"
          >
            {isLogin
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;
