import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useToast } from '../App.jsx';
import CheckinCalendar from '../components/CheckinCalendar.jsx';

function TopicCard({ topic, onLike, onComment, onPin, currentUser, showPin }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const loadComments = async () => {
    try {
      const data = await api.getComments(topic.id);
      setComments(data);
    } catch (e) {}
  };

  const toggleComments = async () => {
    if (!showComments) await loadComments();
    setShowComments(!showComments);
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      await api.createComment(topic.id, { content: newComment.trim() });
      setNewComment('');
      await loadComments();
      onComment && onComment();
    } catch (e) {}
    setSubmittingComment(false);
  };

  const liked = topic.likes.includes(currentUser.id);

  return (
    <div className={`topic-card ${topic.pinned ? 'pinned' : ''}`}>
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
        <button
          className={`action-btn ${liked ? 'liked' : ''}`}
          onClick={() => onLike(topic.id)}
        >
          {liked ? '❤️' : '🤍'} {topic.likeCount}
        </button>
        <button className="action-btn" onClick={toggleComments}>
          💬 {topic.commentCount}
        </button>
        {showPin && (
          <button className="action-btn pinned-action" onClick={() => onPin(topic.id, !topic.pinned)}>
            {topic.pinned ? '取消置顶' : '📌 置顶'}
          </button>
        )}
      </div>

      {showComments && (
        <div className="comments-section">
          <div className="comments-list">
            {comments.length === 0 ? (
              <div style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center', padding: '12px' }}>
                暂无评论，来发表第一条评论吧~
              </div>
            ) : (
              comments.map(c => (
                <div key={c.id} className="comment-item">
                  <div className="avatar comment-avatar">{c.user.avatar}</div>
                  <div className="comment-body">
                    <div className="comment-user">{c.user.name}</div>
                    <div className="comment-content">{c.content}</div>
                    <div className="comment-time">{c.createdAt}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="comment-input-wrap">
            <div className="avatar comment-avatar">{currentUser.avatar}</div>
            <textarea
              className="comment-input"
              placeholder="发表评论..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitComment();
              }}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={submitComment}
              disabled={submittingComment || !newComment.trim()}
              style={{ alignSelf: 'center' }}
            >
              发送
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, currentUser } = useToast();
  const groupId = parseInt(id);

  const [group, setGroup] = useState(null);
  const [topics, setTopics] = useState([]);
  const [checkinData, setCheckinData] = useState({});
  const [checkinStats, setCheckinStats] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkedInToday, setCheckedInToday] = useState(false);

  useEffect(() => {
    loadAll();
  }, [groupId]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [g, t, c, s] = await Promise.all([
        api.getGroup(groupId),
        api.getTopics(groupId),
        api.getCheckins(groupId),
        api.getCheckinStats(groupId),
      ]);
      setGroup(g);
      setTopics(t);
      setCheckinData(c);
      setCheckinStats(s);
      const today = new Date().toISOString().split('T')[0];
      setCheckedInToday((c[today] || []).includes(currentUser.id));
    } catch (e) {
      showToast('加载失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const submitTopic = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      showToast('请填写标题和内容', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.createTopic(groupId, { title: newTitle.trim(), content: newContent.trim() });
      setNewTitle('');
      setNewContent('');
      showToast('发布成功');
      const t = await api.getTopics(groupId);
      setTopics(t);
    } catch (e) {
      showToast(e.message || '发布失败', 'error');
    }
    setSubmitting(false);
  };

  const handleLike = async (topicId) => {
    try {
      const updated = await api.likeTopic(topicId);
      setTopics(prev => prev.map(t => t.id === topicId ? updated : t));
    } catch (e) {
      showToast(e.message || '操作失败', 'error');
    }
  };

  const handleCheckin = async () => {
    try {
      const res = await api.checkin(groupId);
      if (res.success) {
        showToast('打卡成功！');
        setCheckedInToday(true);
        const [c, s] = await Promise.all([api.getCheckins(groupId), api.getCheckinStats(groupId)]);
        setCheckinData(c);
        setCheckinStats(s);
      } else {
        showToast(res.message, 'error');
      }
    } catch (e) {
      showToast(e.message || '打卡失败', 'error');
    }
  };

  const handleJoin = async () => {
    try {
      const res = await api.joinGroup(groupId);
      showToast(res.message);
      const g = await api.getGroup(groupId);
      setGroup(g);
    } catch (e) {
      showToast(e.message || '操作失败', 'error');
    }
  };

  const handleComment = async () => {
    const t = await api.getTopics(groupId);
    setTopics(t);
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!group) {
    return (
      <div>
        <button className="back-btn" onClick={() => navigate('/')}>← 返回</button>
        <div className="empty-state">小组不存在</div>
      </div>
    );
  }

  const isMember = group.members.includes(currentUser.id) || group.members.some(m => m.id === currentUser.id);
  const hasPendingApplication = group.hasPendingApplication;

  return (
    <div>
      <button className="back-btn" onClick={() => navigate('/')}>← 返回首页</button>

      <div className="group-detail">
        <div className="detail-main">
          <div className="detail-header">
            <div className="detail-header-info">
              <div className="detail-cover" style={{ background: group.color }}>
                {group.cover}
              </div>
              <div className="detail-meta">
                <h1 className="detail-name">{group.name}</h1>
                <p className="detail-desc">{group.description}</p>
                {group.theme && (
                  <span
                    className="detail-theme-tag"
                    style={{ background: group.color + '20', color: group.color }}
                  >
                    🎯 {group.theme}
                  </span>
                )}
                <div className="detail-actions">
                  {isMember ? (
                    <>
                      <button
                        className={`btn ${checkedInToday ? 'btn-outline' : 'btn-primary'}`}
                        onClick={handleCheckin}
                        disabled={checkedInToday}
                      >
                        {checkedInToday ? '✅ 今日已打卡' : '📅 立即打卡'}
                      </button>
                      <span className="badge badge-open">👥 已加入</span>
                    </>
                  ) : hasPendingApplication ? (
                    <>
                      <button className="btn btn-outline" disabled>
                        ⏳ 审核中
                      </button>
                      <span className="badge badge-pending">申请待审核</span>
                    </>
                  ) : (
                    <button className="btn btn-primary" onClick={handleJoin}>
                      ➕ 加入小组
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="topics-section">
            <div className="section-header">
              <span className="section-title">💬 小组话题 ({topics.length})</span>
            </div>

            {isMember && (
              <div className="topic-form">
                <input
                  type="text"
                  className="form-input"
                  placeholder="话题标题..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                />
                <textarea
                  className="form-textarea"
                  placeholder="分享你的想法..."
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                />
                <div className="form-actions">
                  <button
                    className="btn btn-primary"
                    onClick={submitTopic}
                    disabled={submitting}
                  >
                    {submitting ? '发布中...' : '📝 发布话题'}
                  </button>
                </div>
              </div>
            )}

            <div className="topics-list">
              {topics.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📭</div>
                  <div>暂无话题，成为第一个发言的人吧~</div>
                </div>
              ) : (
                topics.map(topic => (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    onLike={handleLike}
                    onComment={handleComment}
                    currentUser={currentUser}
                    showPin={false}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="detail-sidebar">
          <div className="sidebar-card">
            <div className="sidebar-title">📊 小组数据</div>
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-box-num">{group.memberCount}</div>
                <div className="stat-box-label">成员数</div>
              </div>
              <div className="stat-box">
                <div className="stat-box-num">{group.topicCount}</div>
                <div className="stat-box-label">话题数</div>
              </div>
              <div className="stat-box">
                <div className="stat-box-num">{checkinStats?.streak || 0}</div>
                <div className="stat-box-label">连续打卡(天)</div>
              </div>
              <div className="stat-box">
                <div className="stat-box-num">{group.activityScore}</div>
                <div className="stat-box-label">活跃度</div>
              </div>
            </div>
          </div>

          <div className="sidebar-card">
            <div className="sidebar-title">📅 打卡日历</div>
            <CheckinCalendar
              checkinData={checkinData}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
            />
          </div>

          <div className="sidebar-card">
            <div className="sidebar-title">👥 成员 ({group.memberCount})</div>
            <div className="member-avatars">
              {(group.members || []).slice(0, 8).map(m => {
                const user = typeof m === 'object' ? m : { avatar: '👤', id: m };
                return <div key={user.id} className="avatar">{user.avatar}</div>;
              })}
              {group.memberCount > 8 && (
                <div className="member-more">+{group.memberCount - 8}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
