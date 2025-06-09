import React, { useState } from 'react';
import { getProfile } from './api';

export default function Profile() {
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchProfile = async e => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const res = await getProfile(email);
    if (res.error) {
      setMsg(res.error);
      setProfile(null);
    } else {
      setProfile(res);
      setMsg('');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontSize: '2.5rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        User Profile
      </h2>
      
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        marginBottom: '2rem'
      }}>
        <form onSubmit={fetchProfile} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#4a5568',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                background: '#ffffff'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading 
                ? 'linear-gradient(135deg, #cbd5e0 0%, #a0aec0 100%)'
                : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(79, 70, 229, 0.39)',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? 'Loading...' : 'Get Profile'}
          </button>
        </form>
      </div>

      {msg && (
        <div style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#ffffff',
          padding: '16px 24px',
          borderRadius: '12px',
          marginBottom: '2rem',
          fontWeight: '500',
          textAlign: 'center'
        }}>
          {msg}
        </div>
      )}
      
      {profile && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            color: '#1a202c',
            fontSize: '1.5rem',
            marginBottom: '2rem',
            textAlign: 'center',
            fontWeight: '700'
          }}>
            Profile Information
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              padding: '24px',
              color: '#ffffff',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>ID</div>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>{profile.id}</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              borderRadius: '16px',
              padding: '24px',
              color: '#ffffff',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>NAME</div>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>{profile.name}</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              borderRadius: '16px',
              padding: '24px',
              color: '#ffffff',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>EMAIL</div>
              <div style={{ fontSize: '18px', fontWeight: '700', wordBreak: 'break-word' }}>{profile.email}</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '16px',
              padding: '24px',
              color: '#ffffff',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>PHONE</div>
              <div style={{ fontSize: '20px', fontWeight: '700' }}>{profile.phone}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
