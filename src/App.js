import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Trucks from './Trucks';
import TruckEntry from './TruckEntry';
import WasteTypes from './WasteTypes';
import Profile from './Profile';
import AddUser from './AddUser';

function NavLink({ to, label, disabled, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (onClick) onClick();
  };

  return (
    <a
      href={disabled ? "#" : to}
      onClick={handleClick}
      style={{
        fontSize: '14px',
        color: disabled ? '#9ca3af' : (isActive ? '#1f2937' : '#374151'),
        textDecoration: 'none',
        padding: '16px 24px',
        borderRadius: '12px',
        backgroundColor: isActive ? '#ffffff' : 'transparent',
        transition: 'all 0.3s ease',
        fontWeight: isActive ? '700' : '600',
        pointerEvents: disabled ? 'none' : 'auto',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        minHeight: '48px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        border: isActive ? '2px solid #e5e7eb' : '2px solid transparent',
        boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none',
        whiteSpace: 'nowrap'
      }}
      tabIndex={disabled ? -1 : 0}
      onMouseEnter={e => { 
        if (!disabled && !isActive) {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
          e.target.style.color = '#1f2937';
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.1)';
        }
      }}
      onMouseLeave={e => { 
        if (!disabled && !isActive) {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.color = '#374151';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }
      }}
    >
      {label}
    </a>
  );
}

// Simple auth context for demo
function useAuth() {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });

  const login = (userObj) => {
    setUser(userObj);
    localStorage.setItem('user', JSON.stringify(userObj));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return { user, login, logout };
}

function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppLayout({ auth }) {
  const { user, logout } = auth;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
      position: 'relative'
    }}>
      {/* Enhanced Professional Navbar */}
      <nav style={{
        width: '100%',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderBottom: '3px solid #334155',
        color: '#ffffff',
        padding: '0',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          fontWeight: 800,
          fontSize: '24px',
          paddingLeft: '32px',
          color: '#ffffff',
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.025em'
        }}>
          Waste Management Pro
        </div>
        
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            fontSize: '24px',
            marginRight: '16px',
            cursor: 'pointer',
            padding: '12px',
            borderRadius: '8px',
            transition: 'background-color 0.2s ease'
          }}
          className="mobile-menu-btn"
          onMouseEnter={e => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {user && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '20px', 
            paddingRight: '32px' 
          }}>
            <span style={{ 
              fontSize: '16px', 
              color: '#cbd5e1', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>Welcome, {user.name}</span>
            <button
              style={{
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onClick={logout}
              onMouseEnter={e => {
                e.target.style.background = 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.5)';
              }}
              onMouseLeave={e => {
                e.target.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.4)';
              }}
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Horizontal Navigation Menu */}
      {user && (
        <nav style={{
          width: '100%',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          borderBottom: '2px solid #d1d5db',
          position: 'fixed',
          top: '72px',
          left: 0,
          zIndex: 99,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          padding: '0 32px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '16px 0',
            flexWrap: 'wrap'
          }} className="nav-container">
            <NavLink to="/trucks" label="🚛 Truck Management" disabled={!user} onClick={closeMobileMenu} />
            <NavLink to="/truck-entry" label="➕ Add New Entry" disabled={!user} onClick={closeMobileMenu} />
            <NavLink to="/waste-types" label="🗂️ Waste Categories" disabled={!user} onClick={closeMobileMenu} />
            <NavLink to="/profile" label="👤 User Profile" disabled={!user} onClick={closeMobileMenu} />
            <NavLink to="/add-user" label="⚙️ User Management" disabled={!user} onClick={closeMobileMenu} />
          </div>

          {/* Mobile Navigation Menu */}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#ffffff',
            border: '2px solid #e5e7eb',
            borderTop: 'none',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            zIndex: 98,
            display: mobileMenuOpen ? 'block' : 'none',
            maxHeight: '400px',
            overflowY: 'auto'
          }} className="mobile-nav-menu">
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '16px'
            }}>
              <NavLink to="/trucks" label="🚛 Truck Management" disabled={!user} onClick={closeMobileMenu} />
              <NavLink to="/truck-entry" label="➕ Add New Entry" disabled={!user} onClick={closeMobileMenu} />
              <NavLink to="/waste-types" label="🗂️ Waste Categories" disabled={!user} onClick={closeMobileMenu} />
              <NavLink to="/profile" label="👤 User Profile" disabled={!user} onClick={closeMobileMenu} />
              <NavLink to="/add-user" label="⚙️ User Management" disabled={!user} onClick={closeMobileMenu} />
              
              {/* Mobile logout button */}
              <button
                onClick={() => {
                  logout();
                  closeMobileMenu();
                }}
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 24px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginTop: '16px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => {
                  e.target.style.background = 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)';
                }}
                onMouseLeave={e => {
                  e.target.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
                }}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '144px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 97,
            backdropFilter: 'blur(4px)'
          }}
          onClick={closeMobileMenu}
        />
      )}

      {/* Main Content */}
      <div style={{
        paddingTop: user ? '144px' : '72px',
        minHeight: '100vh',
        position: 'relative'
      }}>
        <main style={{
          padding: '40px',
          maxWidth: '1600px',
          margin: '0 auto',
          minHeight: 'calc(100vh - 144px)'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            padding: '40px',
            minHeight: '600px',
            border: '2px solid #e5e7eb'
          }}>
            <Routes>
              <Route path="/trucks" element={
                <ProtectedRoute user={user}><Trucks /></ProtectedRoute>
              } />
              <Route path="/truck-entry" element={
                <ProtectedRoute user={user}><TruckEntry /></ProtectedRoute>
              } />
              <Route path="/" element={
                <ProtectedRoute user={user}><Navigate to="/trucks" replace /></ProtectedRoute>
              } />
              <Route path="/waste-types" element={
                <ProtectedRoute user={user}><WasteTypes /></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute user={user}><Profile /></ProtectedRoute>
              } />
              <Route path="/add-user" element={
                <ProtectedRoute user={user}><AddUser /></ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/trucks" replace />} />
            </Routes>
          </div>
        </main>
      </div>
      
      <style>{`
        @media (max-width: 1024px) {
          .nav-container {
            gap: 4px !important;
            padding: 12px 0 !important;
          }
          
          .nav-container a {
            padding: 12px 16px !important;
            font-size: 13px !important;
          }
        }

        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block !important;
          }
          
          .nav-container {
            display: none !important;
          }
          
          .mobile-nav-menu .nav-link {
            margin-bottom: 8px;
            border-radius: 8px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
          }
        }

        @media (max-width: 480px) {
          nav {
            padding: 0 16px !important;
          }
          
          nav div:first-child {
            font-size: 18px !important;
            padding-left: 16px !important;
          }
          
          .mobile-menu-btn {
            margin-right: 8px !important;
          }
          
          main {
            padding: 16px !important;
          }
          
          main > div {
            padding: 24px !important;
            border-radius: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}

function AuthLayout({ auth }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f3f4f6',
      padding: '0 24px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '48px',
        minWidth: 400,
        border: '1px solid #e5e7eb'
      }}>
        <Routes>
          <Route path="/login" element={<Login auth={auth} />} />
          <Route path="/register" element={<Register auth={auth} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  const auth = useAuth();
  return (
    <Router>
      {auth.user
        ? <AppLayout auth={auth} />
        : <AuthLayout auth={auth} />
      }
    </Router>
  );
}

export default App;
