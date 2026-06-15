import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import GroupDetail from './pages/GroupDetail.jsx';
import Admin from './pages/Admin.jsx';

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser] = useState({ id: 1, name: '张三', avatar: '👨' });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const getActiveTab = () => {
    if (location.pathname.startsWith('/admin')) return 'admin';
    if (location.pathname.startsWith('/group')) return 'groups';
    return 'home';
  };

  return (
    <ToastContext.Provider value={{ showToast, currentUser }}>
      <div className="app">
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
            <button
              className={`nav-btn ${getActiveTab() === 'admin' ? 'active' : ''}`}
              onClick={() => navigate('/admin')}
            >
              ⚙️ 管理端
            </button>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/group/:id" element={<GroupDetail />} />
          <Route path="/admin" element={<Admin />} />
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
