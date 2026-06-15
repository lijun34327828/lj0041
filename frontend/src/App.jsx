import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import GroupDetail from './pages/GroupDetail.jsx';
import Admin from './pages/Admin.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import { api } from './api.js';

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

function RequireAuth({ children, requireAdmin = false }) {
  const { currentUser, loading } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login');
    } else if (!loading && requireAdmin && currentUser?.role !== 'admin') {
      navigate('/');
    }
  }, [currentUser, loading, requireAdmin, navigate]);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const user = await api.getMe();
          setCurrentUser(user);
          localStorage.setItem('user', JSON.stringify(user));
        } catch (e) {
          api.clearAuth();
          setCurrentUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();

    const handleAuthExpired = () => {
      showToast('登录已过期，请重新登录', 'error');
      handleLogout();
    };
    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    api.clearAuth();
    setCurrentUser(null);
    navigate('/login');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const getActiveTab = () => {
    if (location.pathname.startsWith('/admin')) return 'admin';
    if (location.pathname.startsWith('/group')) return 'groups';
    return 'home';
  };

  const isAdmin = currentUser?.role === 'admin';
  const showHeader = currentUser && !['/login', '/register'].includes(location.pathname);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <ToastContext.Provider value={{ showToast, currentUser, loading }}>
      <div className="app">
        {showHeader && (
          <header className="header">
            <div className="header-left">
              <span className="logo">🎯</span>
              <span className="app-title">兴趣小组社区</span>
            </div>
            <nav className="nav">
              <button
                className={`nav-btn ${getActiveTab() === 'home' ? 'active' : ''}`}
                onClick={() => navigate('/')}
              >
                🏠 首页
              </button>
              {isAdmin && (
                <button
                  className={`nav-btn ${getActiveTab() === 'admin' ? 'active' : ''}`}
                  onClick={() => navigate('/admin')}
                >
                  ⚙️ 管理端
                </button>
              )}
            </nav>
            <div className="header-right">
              <div className="user-info">
                <span className="avatar">{currentUser.avatar}</span>
                <span className="user-name">
                  {currentUser.name}
                  {isAdmin && <span className="admin-badge">管理员</span>}
                </span>
              </div>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                退出登录
              </button>
            </div>
          </header>
        )}

        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onLogin={handleLogin} />} />
          <Route path="/" element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          } />
          <Route path="/group/:id" element={
            <RequireAuth>
              <GroupDetail />
            </RequireAuth>
          } />
          <Route path="/admin" element={
            <RequireAuth requireAdmin={true}>
              <Admin />
            </RequireAuth>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {toast && (
          <div className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
