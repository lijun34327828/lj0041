import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useToast } from '../App.jsx';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast('请输入用户名和密码', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const data = await api.login({ username: username.trim(), password: password.trim() });
      api.setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showToast('登录成功');
      onLogin(data.user);
      navigate('/');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">🎯</span>
          <h1 className="auth-title">兴趣小组社区</h1>
          <p className="auth-subtitle">登录你的账号，探索感兴趣的小组</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">用户名</label>
            <input
              type="text"
              className="form-input"
              placeholder="请输入用户名"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">密码</label>
            <input
              type="password"
              className="form-input"
              placeholder="请输入密码"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSubmit(e);
              }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={submitting}
          >
            {submitting ? '登录中...' : '登 录'}
          </button>
        </form>
        <div className="auth-footer">
          还没有账号？ <Link to="/register">立即注册</Link>
        </div>
        <div className="auth-tips">
          <p>测试账号：</p>
          <p>管理员：admin / admin123</p>
          <p>普通用户：lisi / 123456</p>
        </div>
      </div>
    </div>
  );
}
