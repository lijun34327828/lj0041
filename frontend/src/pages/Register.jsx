import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useToast } from '../App.jsx';

export default function Register({ onLogin }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast('请输入用户名和密码', 'error');
      return;
    }
    if (username.trim().length < 3) {
      showToast('用户名至少3个字符', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('密码至少6个字符', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('两次输入的密码不一致', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const data = await api.register({
        username: username.trim(),
        name: name.trim() || username.trim(),
        password,
      });
      api.setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showToast('注册成功');
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
          <p className="auth-subtitle">创建新账号，加入我们的社区</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">用户名 *</label>
            <input
              type="text"
              className="form-input"
              placeholder="请输入用户名（至少3个字符）"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">昵称（可选）</label>
            <input
              type="text"
              className="form-input"
              placeholder="请输入昵称，默认与用户名相同"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">密码 *</label>
            <input
              type="password"
              className="form-input"
              placeholder="请输入密码（至少6个字符）"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">确认密码 *</label>
            <input
              type="password"
              className="form-input"
              placeholder="请再次输入密码"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
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
            {submitting ? '注册中...' : '注 册'}
          </button>
        </form>
        <div className="auth-footer">
          已有账号？ <Link to="/login">立即登录</Link>
        </div>
      </div>
    </div>
  );
}
