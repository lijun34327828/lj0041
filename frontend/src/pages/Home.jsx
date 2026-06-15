import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useToast } from '../App.jsx';

function GroupCard({ group, onClick }) {
  return (
    <div className="group-card" onClick={onClick}>
      <div className="card-header" style={{ background: group.color }}>
        <span className="permission-badge">
          {group.permission === 'open' ? '🔓 自由加入' : '🔒 审核加入'}
        </span>
        <div className="card-cover">{group.cover}</div>
        <div className="card-name">{group.name}</div>
        {group.theme && <div className="card-theme">{group.theme}</div>}
      </div>
      <div className="card-body">
        <div className="card-stats">
          <div className="stat-item">
            <span className="stat-icon">👥</span>
            <div>
              <span className="stat-value">{group.memberCount}</span>
              <span className="stat-label"> 成员</span>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">✍️</span>
            <div>
              <span className="stat-value">{group.recentActivity.length}</span>
              <span className="stat-label"> 动态</span>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">📊</span>
            <div>
              <span className="stat-value">{group.activityScore}</span>
              <span className="stat-label"> 活跃分</span>
            </div>
          </div>
        </div>
        <div className="card-description">{group.description}</div>
        <div className="card-activity">
          <div className="activity-title">近期动态</div>
          <div className="activity-list">
            {group.recentActivity.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>暂无动态</div>
            ) : (
              group.recentActivity.slice(0, 3).map((act, idx) => (
                <div key={idx} className="activity-item">
                  <span className={`activity-type ${act.type}`}>
                    {act.type === 'topic' ? '话题' : '评论'}
                  </span>
                  <span className="activity-text">
                    {act.user.avatar} {act.user.name}：{act.type === 'topic' ? act.title : act.content}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await api.getGroups();
      setGroups(data);
    } catch (e) {
      showToast('加载小组列表失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">兴趣小组</h1>
          <p className="page-subtitle">找到志同道合的伙伴，一起探索热爱的事物</p>
        </div>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="groups-grid">
          {groups.map(group => (
            <GroupCard
              key={group.id}
              group={group}
              onClick={() => navigate(`/group/${group.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
