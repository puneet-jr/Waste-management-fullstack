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
        fontSize: '16px',
        color: disabled ? '#a0aec0' : (isActive ? '#ffffff' : '#4a5568'),
        textDecoration: 'none',
        padding: '16px 24px',
        borderRadius: '14px',
        backgroundColor: isActive ? 'rgba(79, 70, 229, 0.9)' : 'transparent',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        fontWeight: isActive ? '700' : '600',
        pointerEvents: disabled ? 'none' : 'auto',
        cursor: disabled ? 'not-allowed' : 'pointer',
        marginBottom: 8,
        display: 'block',
        letterSpacing: '0.025em',
        textTransform: 'uppercase',
        fontSize: '13px',
        border: isActive ? '2px solid rgba(255, 255, 255, 0.2)' : '2px solid transparent',
        backdropFilter: isActive ? 'blur(10px)' : 'none'
      }}
      tabIndex={disabled ? -1 : 0}
      onMouseOver={e => { 
        if (!disabled && !isActive) {
          e.target.style.background = 'rgba(255, 255, 255, 0.1)';
          e.target.style.transform = 'translateX(8px)';
          e.target.style.backdropFilter = 'blur(5px)';
        }
      }}
      onMouseOut={e => { 
        if (!disabled && !isActive) {
          e.target.style.background = 'transparent';
          e.target.style.transform = 'translateX(0)';
          e.target.style.backdropFilter = 'none';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative'
    }}>
      {/* Mobile-responsive Navbar */}
      <nav style={{
        width: '100%',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        color: '#fff',
        padding: '0',
        height: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '24px',
            marginLeft: '20px',
            cursor: 'pointer',
            padding: '8px'
          }}
          className="mobile-menu-btn"
        >
          ☰
        </button>
        <div style={{
          fontWeight: 800,
          fontSize: 32,
          letterSpacing: -1,
          paddingLeft: 48,
          background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
        className="app-title"
        >
          Junkyard Admin
        </div>
        {user && (
          <button
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '14px 28px',
              fontSize: 14,
              cursor: 'pointer',
              fontWeight: 700,
              marginRight: 48,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.39)'
            }}
            onClick={logout}
            className="logout-btn"
          >
            Logout
          </button>
        )}
      </nav>
      {/* Sidebar + Main with responsive layout */}
      <div style={{
        display: 'flex',
        paddingTop: 80,
        minHeight: '100vh',
        position: 'relative'
      }}>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            style={{
              position: 'fixed',
              top: 80,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 98,
              display: 'none'
            }}
            className="mobile-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* Responsive Sidebar */}
        <aside style={{
          width: '280px',
          padding: '48px 32px 32px 32px',
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          position: 'sticky',
          top: 80,
          height: 'calc(100vh - 80px)',
          boxShadow: 'inset -1px 0 0 rgba(255, 255, 255, 0.1)',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(0)',
          transition: 'transform 0.3s ease'
        }}
        className="sidebar"
        >
          <SidebarLink to="/trucks" label="Truck Management" disabled={!user} />
          <SidebarLink to="/truck-entry" label="Add New Entry" disabled={!user} />
          <SidebarLink to="/waste-types" label="Waste Categories" disabled={!user} />
          <SidebarLink to="/profile" label="User Profile" disabled={!user} />
          <SidebarLink to="/add-user" label="User Management" disabled={!user} />
        </aside>
        {/* Main Content with responsive container */}
        <div style={{ flex: 1, position: 'relative', minHeight: '100vh' }}>
          <main style={{
            padding: '48px 0',
            maxWidth: '1200px',
            margin: '0 auto',
            minHeight: '100vh'
          }}
          className="main-content"
          >
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              padding: '56px 64px',
              minHeight: 600,
              marginTop: '32px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              margin: '32px 20px 20px 20px'
            }}
            className="content-card"
            >
              {/* ...existing code... */}
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
      </div>
      
      {/* Mobile-specific styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block !important;
          }
          
          .app-title {
            font-size: 24px !important;
            padding-left: 20px !important;
          }
          
          .logout-btn {
            padding: 12px 20px !important;
            font-size: 12px !important;
            margin-right: 20px !important;
          }
          
          .sidebar {
            position: fixed !important;
            top: 80px !important;
            left: 0 !important;
            width: 280px !important;
            height: calc(100vh - 80px) !important;
            z-index: 99 !important;
            transform: ${sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'} !important;
          }
          
          .mobile-overlay {
            display: block !important;
          }
          
          .main-content {
            padding: 24px 0 !important;
            width: 100% !important;
          }
          
          .content-card {
            padding: 32px 24px !important;
            margin: 16px 12px 12px 12px !important;
            border-radius: 16px !important;
          }
        }
        
        @media (max-width: 480px) {
          .app-title {
            font-size: 20px !important;
            padding-left: 16px !important;
          }
          
          .logout-btn {
            padding: 10px 16px !important;
            margin-right: 16px !important;
          }
          
          .content-card {
            padding: 24px 16px !important;
            margin: 12px 8px 8px 8px !important;
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '0 24px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '56px 64px',
        minWidth: 420,
        border: '1px solid rgba(255, 255, 255, 0.18)'
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
