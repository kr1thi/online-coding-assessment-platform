import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

// FIX: Updated to Railway Live URL
const BACKEND_URL = "https://online-coding-assessment-platform-production.up.railway.app";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.clear();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    if (password.length < 8) return "❌ Password must be at least 8 characters long!";
    if (!/[A-Z]/.test(password)) return "❌ Password must contain at least one Uppercase letter!";
    if (!/[0-9]/.test(password)) return "❌ Password must contain at least one Number!";
    if (!/[!@#$%^&*]/.test(password)) return "❌ Password must contain at least one Special Character (@, #, $)!";
    return null; 
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validatePassword(formData.password);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      // Updated to use BACKEND_URL
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json(); 
        
        localStorage.setItem('token', data.token); 
        localStorage.setItem('studentId', data.studentId);
        localStorage.setItem('userId', data.userId || data.id); 
        localStorage.setItem('userName', data.name || 'User');
        localStorage.setItem('userEmail', data.email || formData.email);
        
        const userRole = data.role ? data.role.toUpperCase() : 'STUDENT';
        localStorage.setItem('role', userRole);
        
        if (userRole === 'ADMIN') {
            window.location.href = '/admin';
        } else if (userRole === 'TEACHER') {
            window.location.href = '/teacher/dashboard';
        } else {
            window.location.href = '/student/dashboard';
        }

      } else {
        if (response.status === 401) setError("Invalid email or password!");
        else if (response.status === 403) setError("Access Denied: Check your role permissions.");
        else setError("Server error. Please try again later.");
      }
    } catch (err) {
      setError("Cannot connect to Backend. Contact Admin.");
      console.error("Login Error:", err);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-card">
        <div className="auth-content">
          <div className="auth-header">
            <h1 className="logo-text">Fame<span>Hub</span></h1>
            <p className="subtitle">Master Your Coding Skills</p>
          </div>

          <h2 className="form-title">Welcome Back</h2>
          
          {error && <div className="error-badge" style={errorStyle}>{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="input-group">
              <label>Email Address</label>
              <input 
                name="email" 
                type="email" 
                placeholder="Enter your email"
                value={formData.email} 
                onChange={handleChange} 
                autoComplete="email"
                required 
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input 
                name="password" 
                type="password" 
                placeholder="Min. 8 chars, A-Z, 0-9, @#$"
                value={formData.password} 
                onChange={handleChange} 
                autoComplete="current-password"
                required 
              />
              <p style={{fontSize: '10px', color: '#64748b', marginTop: '4px'}}>
                Must include 8+ chars, Uppercase, Number & Special char.
              </p>
            </div>

            <button type="submit" className="glow-btn">Login Now</button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ color: '#64748b', marginBottom: '10px' }}>OR</p>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  // Updated to use BACKEND_URL
                  const response = await fetch(`${BACKEND_URL}/api/auth/google-login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: credentialResponse.credential })
                  });
                  const data = await response.json();
                  
                  localStorage.setItem('token', data.token);
                  localStorage.setItem('role', data.role);
                  window.location.href = data.role === 'ADMIN' ? '/admin' : '/student/dashboard';
                } catch (err) {
                  setError("Google Login failed. Please try again.");
                }
              }}
              onError={() => setError('Google Login Failed!')}
            />
          </div>

          <div className="auth-footer">
            <p>Don't have an account? <span onClick={() => navigate('/register')} className="link-text" style={{cursor: 'pointer', color: '#10b981', fontWeight: 'bold'}}>Register Now</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

const errorStyle = {
  background: 'rgba(239, 68, 68, 0.1)',
  color: '#ef4444',
  padding: '10px',
  borderRadius: '8px',
  marginBottom: '15px',
  fontSize: '0.85rem',
  textAlign: 'center',
  border: '1px solid #ef4444'
};

export default Login;
