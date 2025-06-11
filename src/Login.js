import React, { useState } from 'react';
import { login } from './api';
import { useNavigate, Link } from 'react-router-dom';

export default function Login({ auth }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await login(form);
    if (res.token && res.user) {
      auth.login(res.user);
      setMsg('Login successful');
      navigate('/');
    } else {
      setMsg(res.error || 'Login failed');
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1 style={{
        fontSize: 28,
        fontWeight: 600,
        marginBottom: 8,
        color: '#1f2937'
      }}>
        Waste Management System
      </h1>
      
      <p style={{
        color: '#6b7280',
        fontSize: 14,
        marginBottom: 32,
        fontWeight: 400
      }}>
        Professional Waste Management & Tracking Platform
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          width: 320,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          margin: '0 auto'
        }}
      >
        <h2 style={{ 
          fontSize: 20, 
          color: '#1f2937', 
          marginBottom: 8, 
          fontWeight: 600,
          textAlign: 'center'
        }}>Sign In</h2>
        
        <input
          name="email"
          type="email"
          placeholder="Email address"
          onChange={handleChange}
          required
          style={{
            fontSize: 16,
            padding: '12px 16px',
            borderRadius: 4,
            border: '1px solid #d1d5db',
            backgroundColor: '#ffffff',
            color: '#1f2937'
          }}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
          style={{
            fontSize: 16,
            padding: '12px 16px',
            borderRadius: 4,
            border: '1px solid #d1d5db',
            backgroundColor: '#ffffff',
            color: '#1f2937'
          }}
        />
        <button
          type="submit"
          style={{
            background: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: 4,
            padding: '12px 0',
            fontSize: 16,
            fontWeight: 500,
            marginTop: 8,
            cursor: 'pointer'
          }}
          onMouseOver={e => e.target.style.background = '#1d4ed8'}
          onMouseOut={e => e.target.style.background = '#2563eb'}
        >
          Sign In
        </button>
        
        {msg && (
          <div style={{ 
            color: msg.includes('successful') ? '#059669' : '#dc2626', 
            fontSize: 14,
            fontWeight: 500,
            textAlign: 'center'
          }}>
            {msg}
          </div>
        )}
        
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#6b7280' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}
