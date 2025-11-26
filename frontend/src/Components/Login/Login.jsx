// pages/SimpleLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/auth';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '', 
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Connect to Version 2 backend API
      const response = await authAPI.login(formData);
      
      // Use Auth Context to handle login
      login(response.data.user || { email: formData.email }, response.data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="simple-login-page">
      
      {/* Background */}
      <div className="simple-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      {/* Login Box */}
      <div className="login-box">
        
        {/* Logo */}
        <div className="simple-logo">
          <div className="logo-badge">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2>Booseere Multipurpose</h2>
        </div>

        {/* Title */}
        <div className="login-title">
          <h1>Welcome Back</h1>
          <p>Please login to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="simple-form">
          
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter admin email"
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <div className="pass-field">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-msg">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="loader"></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>

        </form>

        {/* Footer */}
        <div className="login-footer">
          <a href="/regg">Create Account</a>
          <a href="/">Go to Homepage</a>
        </div>

      </div>

    </div>
  );
}

export default Login;