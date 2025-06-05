import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Trucks from './Trucks';
import TruckEntry from './TruckEntry';
import WasteTypes from './WasteTypes';
import Profile from './Profile';
import AddUser from './AddUser';

function SidebarLink({ to, label, disabled }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <a
      href={disabled ? "#" : to}
      style={{
        fontSize: '18px',
        color: disabled ? '#b0b0b0' : (isActive ? '#fff' : '#1a237e'),
        textDecoration: 'none',
        padding: '12px 20px',
        borderRadius: '8px',
        backgroundColor: isActive ? '#3949ab' : 'transparent',
        transition: 'background 0.2s',
        fontWeight: isActive ? '600' : '400',
        pointerEvents: disabled ? 'none' : 'auto',
        cursor: disabled ? 'not-allowed' : 'pointer',
        marginBottom: 4,
        display: 'block'
      }}
      tabIndex={disabled ? -1 : 0}
      onMouseOver={e => { if (!disabled && !isActive) e.target.style.background = '#e8eaf6'; }}
      onMouseOut={e => { if (!disabled && !isActive) e.target.style.background = 'transparent'; }}
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
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: 'Segoe UI, sans-serif',
      backgroundColor: '#f0f4f8',
      position: 'relative'
    }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        padding: '32px 24px 24px 24px',
        backgroundColor: '#e3eaf2',
        borderRight: '1px solid #c5d0dd',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        boxShadow: '2px 0 8px #0001'
      }}>
        <div style={{ fontWeight: 700, fontSize: 22, color: '#1a237e', marginBottom: 24, letterSpacing: 1 }}>
          Junkyard Admin
        </div>
        <SidebarLink to="/trucks" label="Trucks" disabled={!user} />
        <SidebarLink to="/truck-entry" label="Add Truck Entry" disabled={!user} />
        <SidebarLink to="/waste-types" label="Waste Types" disabled={!user} />
        <SidebarLink to="/profile" label="Profile" disabled={!user} />
        <SidebarLink to="/add-user" label="Add User" disabled={!user} />
      </aside>
      {/* Main Content + Logout */}
      <div style={{ flex: 1, position: 'relative', minHeight: '100vh' }}>
        {/* Logout button at top right */}
        {user && (
          <div style={{
            position: 'absolute',
            top: 32,
            right: 48,
            zIndex: 10
          }}>
            <button
              style={{
                background: '#d32f2f',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '12px 32px',
                fontSize: 16,
                cursor: 'pointer',
                fontWeight: 600,
                boxShadow: '0 2px 8px #0001',
                transition: 'background 0.2s'
              }}
              onClick={logout}
              onMouseOver={e => e.target.style.background = '#b71c1c'}
              onMouseOut={e => e.target.style.background = '#d32f2f'}
            >
              Logout
            </button>
          </div>
        )}
        <main style={{
          padding: '48px 0',
          maxWidth: '900px',
          margin: '0 auto',
          minHeight: '100vh'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            padding: '40px 48px',
            minHeight: 500,
            marginTop: '60px'
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
              {/* Redirect any unknown route to trucks */}
              <Route path="*" element={<Navigate to="/trucks" replace />} />
            </Routes>
          </div>
        </main>
      </div>
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
      background: '#f0f4f8'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        padding: '40px 48px',
        minWidth: 340
      }}>
        <Routes>
          <Route path="/login" element={<Login auth={auth} />} />
          <Route path="/register" element={<Register auth={auth} />} />
          {/* Redirect any unknown route to login */}
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
