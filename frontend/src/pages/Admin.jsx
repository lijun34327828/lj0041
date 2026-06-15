import React, { useState, useEffect } from 'react';
import { api } from '../api.js';
import { useToast } from '../App.jsx';

const COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316',
  '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
];

const EMOJIS = ['📚', '💪', '📷', '🎨', '🎵', '🏃', '☕', '🎮', '🌱', '✈️', '🍳', '🎯', '💡', '🔥', '⭐', '❤️'];

export default function Admin() {
  const { showToast } = useToast();

  const [groups, setGroups] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTheme, setFormTheme] = useState('');
  const [formColor, setFormColor] = useState(COLORS[0]);
  const [formEmoji, setFormEmoji] = useState(EMOJIS[0]);
  const [formPermission, setFormPermission] = useState('open');
  const [submitting, setSubmitting] = useState(false);

  const [topicModalGroup, setTopicModalGroup] = useState(null);
  const [groupTopics, setGroupTopics] = useState([]);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [g, r, a] = await Promise.all([api.getGroups(), api.getRanking(), api.getApplications()]);
      setGroups(g);
      setRanking(r);
      setApplications(a);
    } catch (e) {
      showToast('加载失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setEditingGroup(null);
    setFormName('');
    setFormDesc('');
    setFormTheme('');
    setFormColor(COLORS[0]);
    setFormEmoji(EMOJIS[0]);
    setFormPermission('open');
    setShowForm(true);
  };

  const openEditForm = (group) => {
    setEditingGroup(group);
    setFormName(group.name);
    setFormDesc(group.description);
    setFormTheme(group.theme);
    setFormColor(group.color);
    setFormEmoji(group.cover);
    setFormPermission(group.permission);
    setShowForm(true);
  };

  const submitForm = async () => {
    if (!formName.trim()) {
      showToast('请填写小组名称', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const data = {
        name: formName.trim(),
        description: formDesc.trim(),
        theme: formTheme.trim(),
        cover: formEmoji,
        color: formColor,
        permission: formPermission,
      };
      if (editingGroup) {
        await api.updateGroup(editingGroup.id, data);
        showToast('更新成功');
      } else {
        await api.createGroup(data);
        showToast('创建成功');
      }
      setShowForm(false);
      loadAll();
    } catch (e) {
      showToast(e.message || (editingGroup ? '更新失败' : '创建失败'), 'error');
    }
    setSubmitting(false);
  };

  const openTopicModal = async (group) => {
    setTopicModalGroup(group);
    try {
      const topics = await api.getTopics(group.id);
      setGroupTopics(topics);
    } catch (e) {}
  };

  const togglePin = async (topicId, pinned) => {
    try {
      await api.pinTopic(topicId, pinned);
      showToast(pinned ? '已置顶' : '已取消置顶');
      const topics = await api.getTopics(topicModalGroup.id);
      setGroupTopics(topics);
      loadAll();
    } catch (e) {
      showToast('操作失败', 'error');
    }
  };

  const handleApprove = async (appId) => {
    try {
      await api.approveApplication(appId);
      showToast('已通过申请');
      loadAll();
    } catch (e) {
      showToast(e.message || '操作失败', 'error');
    }
  };

  const handleReject = async (appId) => {
    try {
      await api.rejectApplication(appId);
      showToast('已拒绝申请');
      loadAll();
    } catch (e) {
      showToast(e.message || '操作失败', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">管理中心</h1>
          <p className="page-subtitle">管理兴趣小组、话题置顶与活跃度数据</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateForm}>
          ➕ 新建小组
        </button>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="admin-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {applications.length > 0 && (
              <div className="admin-card">
                <div className="section-header" style={{ marginBottom: '20px' }}>
                  <span className="section-title">🔔 待审核入组申请 ({applications.length})</span>
                </div>
                <div className="applications-list">
                  {applications.map(app => (
                    <div key={app.id} className="application-item">
                      <div className="application-user">
                        <div className="avatar">{app.user.avatar}</div>
                        <div className="application-user-info">
                          <div className="application-username">{app.user.name}</div>
                          <div className="application-meta">
                            申请加入 <span className="application-group-name" style={{ color: app.group?.color || '#6366f1' }}>{app.group?.cover} {app.group?.name}</span> · {app.createdAt}
                          </div>
                        </div>
                      </div>
                      <div className="application-actions">
                        <button className="btn btn-primary btn-sm" onClick={() => handleApprove(app.id)}>
                          ✓ 通过
                        </button>
                        <button className="btn btn-outline btn-sm btn-reject" onClick={() => handleReject(app.id)}>
                          ✗ 拒绝
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="admin-card">
              <div className="section-header" style={{ marginBottom: '20px' }}>
                <span className="section-title">📋 小组管理</span>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>共 {groups.length} 个小组</span>
              </div>
              <div className="admin-groups-list">
                {groups.map(group => (
                  <div key={group.id} className="admin-group-item">
                    <div className="admin-group-icon" style={{ background: group.color }}>
                      {group.cover}
                    </div>
                    <div className="admin-group-info">
                      <div className="admin-group-name">
                        {group.name}
                        <span style={{ marginLeft: '8px' }}>
                          <span className={`badge ${group.permission === 'open' ? 'badge-open' : 'badge-approval'}`}>
                            {group.permission === 'open' ? '自由加入' : '审核加入'}
                          </span>
                        </span>
                        {group.pendingCount > 0 && (
                          <span style={{ marginLeft: '8px' }}>
                            <span className="badge badge-pending-count">
                              待审核 {group.pendingCount}
                            </span>
                          </span>
                        )}
                      </div>
                      <div className="admin-group-meta">
                        👥 {group.memberCount} 成员 · ✍️ {group.topicCount} 话题 · 📊 {group.activityScore} 活跃分
                      </div>
                    </div>
                    <div className="admin-group-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => openTopicModal(group)}>
                        📌 话题
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => openEditForm(group)}>
                        ✏️ 编辑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {topicModalGroup && (
              <div className="admin-card">
                <div className="section-header" style={{ marginBottom: '20px' }}>
                  <span className="section-title">📌 {topicModalGroup.name} - 话题管理</span>
                  <button className="btn btn-outline btn-sm" onClick={() => setTopicModalGroup(null)}>
                    关闭
                  </button>
                </div>
                <div className="topics-list">
                  {groupTopics.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">📭</div>
                      <div>暂无话题</div>
                    </div>
                  ) : (
                    groupTopics.map(topic => (
                      <div key={topic.id} className={`topic-card ${topic.pinned ? 'pinned' : ''}`}>
                        <div className="topic-header">
                          <div className="avatar">{topic.user.avatar}</div>
                          <div className="topic-meta">
                            <div className="topic-user">
                              <span className="topic-username">{topic.user.name}</span>
                              {topic.pinned && <span className="pinned-badge">📌 置顶</span>}
                            </div>
                            <span className="topic-time">{topic.createdAt}</span>
                          </div>
                        </div>
                        <div className="topic-title">{topic.title}</div>
                        <div className="topic-content">{topic.content}</div>
                        <div className="topic-actions">
                          <span className="action-btn">❤️ {topic.likeCount}</span>
                          <span className="action-btn">💬 {topic.commentCount}</span>
                          <button
                            className="action-btn pinned-action"
                            onClick={() => togglePin(topic.id, !topic.pinned)}
                          >
                            {topic.pinned ? '取消置顶' : '📌 置顶'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="admin-card" style={{ alignSelf: 'flex-start', position: 'sticky', top: '20px' }}>
            <div className="sidebar-title">🏆 实时活跃度榜单</div>
            <div className="ranking-list">
              {ranking.map((item, idx) => (
                <div key={item.id} className="ranking-item">
                  <div className={`ranking-num ${idx < 3 ? 'top' + (idx + 1) : 'other'}`}>
                    {idx + 1}
                  </div>
                  <div className="ranking-icon" style={{ background: item.color }}>
                    {item.cover}
                  </div>
                  <div className="ranking-info">
                    <div className="ranking-name">{item.name}</div>
                    <div className="ranking-meta">
                      👥 {item.memberCount} · ✍️ {item.topicCount} 话题
                    </div>
                  </div>
                  <div className="ranking-score">
                    <div className="ranking-score-val">{item.score}</div>
                    <div className="ranking-score-label">活跃分</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => !submitting && setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editingGroup ? '✏️ 编辑小组' : '➕ 新建小组'}</span>
              <button className="modal-close" onClick={() => !submitting && setShowForm(false)}>×</button>
            </div>

            <div className="form-group">
              <label className="form-label">小组名称 *</label>
              <input
                type="text"
                className="form-input"
                placeholder="请输入小组名称"
                value={formName}
                onChange={e => setFormName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">小组描述</label>
              <textarea
                className="form-textarea"
                placeholder="请输入小组描述"
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                style={{ minHeight: '60px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">活动主题</label>
              <input
                type="text"
                className="form-input"
                placeholder="例如：本月主题：..."
                value={formTheme}
                onChange={e => setFormTheme(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">入组权限</label>
                <select
                  className="form-select"
                  value={formPermission}
                  onChange={e => setFormPermission(e.target.value)}
                >
                  <option value="open">🔓 自由加入</option>
                  <option value="approval">🔒 审核加入</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">主题色</label>
                <div className="color-picker">
                  {COLORS.map(c => (
                    <div
                      key={c}
                      className={`color-option ${formColor === c ? 'selected' : ''}`}
                      style={{ background: c }}
                      onClick={() => setFormColor(c)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">小组图标</label>
              <div className="emoji-picker">
                {EMOJIS.map(e => (
                  <div
                    key={e}
                    className={`emoji-option ${formEmoji === e ? 'selected' : ''}`}
                    onClick={() => setFormEmoji(e)}
                  >
                    {e}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <button
                className="btn btn-outline"
                onClick={() => !submitting && setShowForm(false)}
                disabled={submitting}
              >
                取消
              </button>
              <button
                className="btn btn-primary"
                onClick={submitForm}
                disabled={submitting}
              >
                {submitting ? '处理中...' : (editingGroup ? '保存修改' : '创建小组')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
