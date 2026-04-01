import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; 

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    role: 'STUDENT' // default val
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // added passward security validation
    const password = formData.password;
    if (password.length < 8) {
        setError("Password must be at least 8 characters!");
        return;
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
        setError("Password must contain: Uppercase, Number, and Special character!");
        return;
    }
    if (!formData.email.endsWith("@gmail.com")) {
      setError("Please use a valid @gmail.com address!");
      return;
    }
    try {
      const response = await fetch('http://localhost:8082/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(`Registration Success as ${formData.role}!  Please login now.`);
        navigate('/login');
      } else {
        const msg = await response.text();
        setError(msg || "Email already exists!");
      }
    } catch (err) {
      setError("Backend connection failed.");
    }
  };
  return (
    <div className="auth-wrapper">
      <div className="glass-card">
        <div className="auth-content">
          <div className="auth-header">
            <h1 className="logo-text">Fame<span>Hub</span></h1>
            <p className="subtitle">Join the community of developers</p>
          </div>

          <h2 className="form-title">Create Account</h2>
          {error && <div className="error-badge" style={{color: '#ef4444', marginBottom: '10px', textAlign: 'center'}}>{error}</div>}

          <form onSubmit={handleRegister} className="auth-form">
            <div className="input-group">
              <label>Full Name</label>
              <input name="name" type="text" placeholder="Enter your name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <input name="email" type="email" placeholder="name@gmail.com" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input name="password" type="password" placeholder="Min 6 characters" value={formData.password} onChange={handleChange} required />
            </div>
//role selection dropdown
            <div className="input-group">
              <label>I am a:</label>
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#1E293B',
                  color: 'white',
                  border: '1px solid #334155',
                  marginTop: '5px',
                  cursor: 'pointer'
                }}
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher / Instructor</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            <button type="submit" className="glow-btn" style={{marginTop: '20px'}}>Sign Up</button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <span onClick={() => navigate('/login')} style={{color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold'}}>Login</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;