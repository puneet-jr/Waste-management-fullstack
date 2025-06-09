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
      {/* Main heading */}
      <h1 style={{
        fontSize: 42,
        fontWeight: 800,
        marginBottom: 8,
        background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        letterSpacing: -1
      }}>
        Junkyard Management System
      </h1>
      
      {/* Subtitle */}
      <p style={{
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 16,
        marginBottom: 40,
        fontWeight: 500,
        letterSpacing: '0.5px'
      }}>
        Professional Waste Management & Tracking Platform
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          width: 400,
          minHeight: 380,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 24,
          margin: '0 auto'
        }}
      >
        <h2 style={{ 
          fontSize: 28, 
          color: '#1a237e', 
          marginBottom: 12, 
          fontWeight: 700,
          textAlign: 'center'
        }}>Login</h2>
        
        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
          style={{
            fontSize: 18,
            padding: '14px 16px',
            borderRadius: 8,
            border: '1px solid #bcd',
            marginBottom: 8
          }}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
          style={{
            fontSize: 18,
            padding: '14px 16px',
            borderRadius: 8,
            border: '1px solid #bcd',
            marginBottom: 8
          }}
        />
        <button
          type="submit"
          style={{
            background: '#1a237e',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '16px 0',
            fontSize: 20,
            fontWeight: 600,
            marginTop: 8,
            cursor: 'pointer'
          }}
        >
          LOGIN
        </button>
        <div style={{ color: '#d32f2f', minHeight: 24, fontSize: 16 }}>{msg}</div>
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 16 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#3949ab', textDecoration: 'underline', fontWeight: 500 }}>
            Sign Up
          </Link>
        </div>
      </form>
    </div>
  );
}
