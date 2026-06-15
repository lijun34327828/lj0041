const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 8761;
const JWT_SECRET = 'interest-group-secret-key-2026';

app.use(cors());
app.use(express.json());

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录，请先登录' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }
}

function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: '无权限执行此操作' });
  }
  next();
}

let nextGroupId = 4;
let nextTopicId = 11;
let nextCommentId = 6;
let nextUserId = 9;
let nextApplicationId = 1;

const avatars = ['👨', '👩', '🧑', '👨‍💼', '👩‍💼', '🧑‍💻', '👨‍🎨', '👩‍🔬', '👨‍🍳', '👩‍🎤', '🧑‍🎨', '👨‍🏫', '👩‍💻', '🧑‍✈️'];

const users = [
  { id: 1, username: 'admin', name: '管理员', avatar: '👨‍💼', password: bcrypt.hashSync('admin123', 10), role: 'admin' },
  { id: 2, username: 'lisi', name: '李四', avatar: '👩', password: bcrypt.hashSync('123456', 10), role: 'user' },
  { id: 3, username: 'wangwu', name: '王五', avatar: '🧑', password: bcrypt.hashSync('123456', 10), role: 'user' },
  { id: 4, username: 'zhaoliu', name: '赵六', avatar: '👨', password: bcrypt.hashSync('123456', 10), role: 'user' },
  { id: 5, username: 'chenqi', name: '陈七', avatar: '👩‍💼', password: bcrypt.hashSync('123456', 10), role: 'user' },
  { id: 6, username: 'zhouba', name: '周八', avatar: '🧑‍💻', password: bcrypt.hashSync('123456', 10), role: 'user' },
  { id: 7, username: 'wujiu', name: '吴九', avatar: '👨‍🎨', password: bcrypt.hashSync('123456', 10), role: 'user' },
  { id: 8, username: 'zhengshi', name: '郑十', avatar: '👩‍🔬', password: bcrypt.hashSync('123456', 10), role: 'user' },
];

const groups = [
  {
    id: 1,
    name: '读书分享会',
    description: '每月共读一本好书，分享阅读感悟',
    theme: '本月主题：《百年孤独》深度解读',
    cover: '📚',
    color: '#6366f1',
    permission: 'open',
    members: [2, 3, 4, 5, 6],
    createdAt: '2026-01-15',
  },
  {
    id: 2,
    name: '健身打卡团',
    description: '每日运动打卡，互相监督激励',
    theme: '春季减脂挑战赛进行中！',
    cover: '💪',
    color: '#f43f5e',
    permission: 'open',
    members: [2, 3, 5, 6, 7, 8],
    createdAt: '2026-02-20',
  },
  {
    id: 3,
    name: '摄影爱好者',
    description: '分享摄影作品，交流拍摄技巧',
    theme: '主题：城市夜景人像',
    cover: '📷',
    color: '#10b981',
    permission: 'approval',
    members: [2, 4, 6, 8],
    createdAt: '2026-03-10',
  },
];

const topics = [
  { id: 1, groupId: 1, userId: 2, title: '读完《百年孤独》第三章的一些感想', content: '马尔克斯的魔幻现实主义真的太震撼了，布恩迪亚家族的命运让人唏嘘...', likes: [3, 4, 5], pinned: true, createdAt: '2026-06-10 09:30', commentCount: 3 },
  { id: 2, groupId: 1, userId: 3, title: '推荐几本类似风格的拉美文学', content: '大家有没有其他拉美文学作品推荐？', likes: [2, 5], pinned: false, createdAt: '2026-06-12 14:20', commentCount: 2 },
  { id: 3, groupId: 1, userId: 4, title: '线下读书会报名开始啦', content: '本周五晚7点，一起聊聊书中最打动你的段落~', likes: [2, 3, 5, 6], pinned: true, createdAt: '2026-06-13 10:00', commentCount: 5 },
  { id: 4, groupId: 2, userId: 2, title: 'Day 30 打卡完成！', content: '坚持一个月了，体脂降了2%，继续加油！', likes: [3, 5, 6, 7, 8], pinned: false, createdAt: '2026-06-14 07:00', commentCount: 4 },
  { id: 5, groupId: 2, userId: 6, title: '求推荐靠谱的蛋白粉品牌', content: '最近训练量加大，想补充点蛋白质', likes: [7], pinned: false, createdAt: '2026-06-14 12:30', commentCount: 3 },
  { id: 6, groupId: 2, userId: 7, title: '本周六公园慢跑约起~', content: '早上6点滨江公园，5公里轻松跑', likes: [2, 3, 5, 8], pinned: true, createdAt: '2026-06-13 18:00', commentCount: 2 },
  { id: 7, groupId: 3, userId: 2, title: '外滩夜景作品分享', content: '昨晚去外滩拍的，大家觉得怎么样？', likes: [4, 6, 8, 3], pinned: true, createdAt: '2026-06-11 22:00', commentCount: 6 },
  { id: 8, groupId: 3, userId: 4, title: '新手求问：夜景如何避免手抖', content: 'ISO已经很高了还是糊...', likes: [2, 6], pinned: false, createdAt: '2026-06-12 15:40', commentCount: 3 },
  { id: 9, groupId: 3, userId: 6, title: '入手新镜头，开心！', content: '终于入了心心念念的35mm f1.4', likes: [2, 4, 8, 3, 5], pinned: false, createdAt: '2026-06-14 16:20', commentCount: 2 },
  { id: 10, groupId: 1, userId: 5, title: '马尔克斯的写作风格分析', content: '从叙事结构看魔幻现实主义的魅力...', likes: [2, 3, 4], pinned: false, createdAt: '2026-06-15 08:15', commentCount: 1 },
];

const comments = [
  { id: 1, topicId: 1, userId: 3, content: '同感！尤其是奥雷里亚诺上校的部分', createdAt: '2026-06-10 10:15' },
  { id: 2, topicId: 1, userId: 4, content: '家族的循环命运真的太有宿命感了', createdAt: '2026-06-10 11:00' },
  { id: 3, topicId: 1, userId: 5, content: '准备二刷了，第一遍没太看懂', createdAt: '2026-06-10 14:30' },
  { id: 4, topicId: 4, userId: 3, content: '太强了！向你学习', createdAt: '2026-06-14 07:30' },
  { id: 5, topicId: 7, userId: 6, content: '构图太棒了！用的什么参数？', createdAt: '2026-06-11 22:30' },
];

const checkins = {};

const joinApplications = [];
(function initCheckins() {
  const today = new Date('2026-06-15');
  groups.forEach(group => {
    checkins[group.id] = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      checkins[group.id][dateStr] = [];
      const checkinCount = Math.floor(Math.random() * group.members.length);
      for (let j = 0; j < checkinCount; j++) {
        const uid = group.members[Math.floor(Math.random() * group.members.length)];
        if (!checkins[group.id][dateStr].includes(uid)) {
          checkins[group.id][dateStr].push(uid);
        }
      }
    }
  });
})();

function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

function formatDateTime() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

function formatDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getUserById(id) {
  const user = users.find(u => u.id === id);
  return user ? sanitizeUser(user) : { id, name: '用户' + id, avatar: '👤' };
}

function enrichTopic(topic) {
  return {
    ...topic,
    user: getUserById(topic.userId),
    likeCount: topic.likes.length,
  };
}

function enrichComment(comment) {
  return {
    ...comment,
    user: getUserById(comment.userId),
  };
}

function getGroupRecentActivity(groupId) {
  const groupTopics = topics.filter(t => t.groupId === groupId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const groupComments = comments.filter(c => {
    const t = topics.find(tt => tt.id === c.topicId);
    return t && t.groupId === groupId;
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const all = [];
  groupTopics.slice(0, 3).forEach(t => all.push({ type: 'topic', id: t.id, title: t.title, createdAt: t.createdAt, user: getUserById(t.userId) }));
  groupComments.slice(0, 2).forEach(c => {
    const t = topics.find(tt => tt.id === c.topicId);
    if (t) all.push({ type: 'comment', id: c.id, content: c.content.substring(0, 30), createdAt: c.createdAt, user: getUserById(c.userId), topicTitle: t.title });
  });
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
}

function getGroupActivityScore(groupId) {
  const now = Date.now();
  const groupTopics = topics.filter(t => t.groupId === groupId);
  let score = 0;
  groupTopics.forEach(t => {
    score += 10;
    score += t.likes.length * 2;
    score += (t.commentCount || 0) * 3;
  });
  const today = formatDate();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  if (checkins[groupId]) {
    score += (checkins[groupId][today] || []).length * 5;
    score += (checkins[groupId][yesterdayStr] || []).length * 2;
  }
  score += groups.find(g => g.id === groupId).members.length * 1;
  return score;
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', port: PORT, time: formatDateTime() });
});

app.post('/api/auth/register', (req, res) => {
  const { username, password, name } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }
  if (username.length < 3) {
    return res.status(400).json({ error: '用户名至少3个字符' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: '密码至少6个字符' });
  }
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: '用户名已存在' });
  }
  const newUser = {
    id: nextUserId++,
    username,
    name: name || username,
    avatar: avatars[Math.floor(Math.random() * avatars.length)],
    password: bcrypt.hashSync(password, 10),
    role: 'user',
  };
  users.push(newUser);
  const token = generateToken(newUser);
  res.json({ token, user: sanitizeUser(newUser) });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }
  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ error: '用户名或密码错误' });
  }
  const token = generateToken(user);
  res.json({ token, user: sanitizeUser(user) });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  res.json(sanitizeUser(user));
});

app.get('/api/users', authMiddleware, (req, res) => {
  res.json(users.map(sanitizeUser));
});

app.get('/api/groups', authMiddleware, (req, res) => {
  const enriched = groups.map(g => ({
    ...g,
    memberCount: g.members.length,
    recentActivity: getGroupRecentActivity(g.id),
    activityScore: getGroupActivityScore(g.id),
    todayCheckins: (checkins[g.id] && checkins[g.id][formatDate()]) ? checkins[g.id][formatDate()].length : 0,
    pendingCount: joinApplications.filter(a => a.groupId === g.id && a.status === 'pending').length,
    topicCount: topics.filter(t => t.groupId === g.id).length,
  }));
  res.json(enriched);
});

app.get('/api/groups/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const group = groups.find(g => g.id === id);
  if (!group) return res.status(404).json({ error: '小组不存在' });
  const userId = req.user.id;
  const userApplication = joinApplications.find(a => a.groupId === id && a.userId === userId && a.status === 'pending');
  res.json({
    ...group,
    memberCount: group.members.length,
    members: group.members.map(uid => getUserById(uid)),
    activityScore: getGroupActivityScore(id),
    pendingCount: joinApplications.filter(a => a.groupId === id && a.status === 'pending').length,
    hasPendingApplication: !!userApplication,
    topicCount: topics.filter(t => t.groupId === id).length,
  });
});

app.post('/api/groups', authMiddleware, adminMiddleware, (req, res) => {
  const { name, description, theme, cover, color, permission } = req.body;
  if (!name) return res.status(400).json({ error: '小组名称不能为空' });
  const newGroup = {
    id: nextGroupId++,
    name,
    description: description || '',
    theme: theme || '',
    cover: cover || '🎯',
    color: color || '#6366f1',
    permission: permission || 'open',
    members: [],
    createdAt: formatDate(),
  };
  groups.push(newGroup);
  checkins[newGroup.id] = {};
  res.json(newGroup);
});

app.put('/api/groups/:id', authMiddleware, adminMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const group = groups.find(g => g.id === id);
  if (!group) return res.status(404).json({ error: '小组不存在' });
  const { name, description, theme, cover, color, permission } = req.body;
  if (name !== undefined) group.name = name;
  if (description !== undefined) group.description = description;
  if (theme !== undefined) group.theme = theme;
  if (cover !== undefined) group.cover = cover;
  if (color !== undefined) group.color = color;
  if (permission !== undefined) group.permission = permission;
  res.json(group);
});

app.post('/api/groups/:id/join', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.user.id;
  const group = groups.find(g => g.id === id);
  if (!group) return res.status(404).json({ error: '小组不存在' });
  if (group.members.includes(userId)) {
    return res.json({ success: true, message: '已经是小组成员', group });
  }
  if (group.permission === 'approval') {
    const existing = joinApplications.find(a => a.groupId === id && a.userId === userId && a.status === 'pending');
    if (existing) {
      return res.json({ success: true, message: '申请已提交，等待审核', pending: true });
    }
    const application = {
      id: nextApplicationId++,
      groupId: id,
      userId,
      status: 'pending',
      createdAt: formatDateTime(),
    };
    joinApplications.push(application);
    return res.json({ success: true, message: '申请已提交，等待审核', pending: true });
  }
  group.members.push(userId);
  res.json({ success: true, message: '加入成功', group });
});

app.get('/api/groups/:id/topics', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  let groupTopics = topics.filter(t => t.groupId === id);
  groupTopics.sort((a, b) => {
    if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
    return b.createdAt.localeCompare(a.createdAt);
  });
  res.json(groupTopics.map(enrichTopic));
});

app.post('/api/groups/:id/topics', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.user.id;
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: '缺少必要参数' });
  }
  const newTopic = {
    id: nextTopicId++,
    groupId: id,
    userId,
    title,
    content,
    likes: [],
    pinned: false,
    createdAt: formatDateTime(),
    commentCount: 0,
  };
  topics.push(newTopic);
  res.json(enrichTopic(newTopic));
});

app.put('/api/topics/:id/pin', authMiddleware, adminMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const { pinned } = req.body;
  const topic = topics.find(t => t.id === id);
  if (!topic) return res.status(404).json({ error: '话题不存在' });
  topic.pinned = pinned !== undefined ? pinned : !topic.pinned;
  res.json(enrichTopic(topic));
});

app.post('/api/topics/:id/like', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.user.id;
  const topic = topics.find(t => t.id === id);
  if (!topic) return res.status(404).json({ error: '话题不存在' });
  const idx = topic.likes.indexOf(userId);
  if (idx > -1) {
    topic.likes.splice(idx, 1);
  } else {
    topic.likes.push(userId);
  }
  res.json(enrichTopic(topic));
});

app.get('/api/topics/:id/comments', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const topicComments = comments.filter(c => c.topicId === id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  res.json(topicComments.map(enrichComment));
});

app.post('/api/topics/:id/comments', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.user.id;
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: '缺少必要参数' });
  }
  const newComment = {
    id: nextCommentId++,
    topicId: id,
    userId,
    content,
    createdAt: formatDateTime(),
  };
  comments.push(newComment);
  const topic = topics.find(t => t.id === id);
  if (topic) topic.commentCount = (topic.commentCount || 0) + 1;
  res.json(enrichComment(newComment));
});

app.get('/api/groups/:id/checkins', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  res.json(checkins[id] || {});
});

app.post('/api/groups/:id/checkin', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.user.id;
  const today = formatDate();
  if (!checkins[id]) checkins[id] = {};
  if (!checkins[id][today]) checkins[id][today] = [];
  if (checkins[id][today].includes(userId)) {
    return res.json({ success: false, message: '今日已打卡', checkins: checkins[id] });
  }
  checkins[id][today].push(userId);
  res.json({ success: true, message: '打卡成功', checkins: checkins[id], todayCount: checkins[id][today].length });
});

app.get('/api/groups/:id/checkin-stats', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const data = checkins[id] || {};
  const totalDays = Object.keys(data).length;
  const totalCheckins = Object.values(data).reduce((sum, arr) => sum + arr.length, 0);
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    if (data[dateStr] && data[dateStr].length > 0) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  res.json({ totalDays, totalCheckins, streak, data });
});

app.get('/api/ranking/activity', authMiddleware, adminMiddleware, (req, res) => {
  const ranking = groups.map(g => ({
    id: g.id,
    name: g.name,
    cover: g.cover,
    color: g.color,
    memberCount: g.members.length,
    score: getGroupActivityScore(g.id),
    topicCount: topics.filter(t => t.groupId === g.id).length,
  })).sort((a, b) => b.score - a.score);
  res.json(ranking);
});

app.get('/api/applications', authMiddleware, adminMiddleware, (req, res) => {
  const pending = joinApplications
    .filter(a => a.status === 'pending')
    .map(a => ({
      ...a,
      user: getUserById(a.userId),
      group: groups.find(g => g.id === a.groupId) || null,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json(pending);
});

app.put('/api/applications/:id/approve', authMiddleware, adminMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const application = joinApplications.find(a => a.id === id);
  if (!application) return res.status(404).json({ error: '申请不存在' });
  if (application.status !== 'pending') return res.status(400).json({ error: '该申请已处理' });

  application.status = 'approved';
  const group = groups.find(g => g.id === application.groupId);
  if (group && !group.members.includes(application.userId)) {
    group.members.push(application.userId);
  }

  res.json({
    success: true,
    message: '已通过申请',
    application: {
      ...application,
      user: getUserById(application.userId),
      group: group || null,
    },
  });
});

app.put('/api/applications/:id/reject', authMiddleware, adminMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const application = joinApplications.find(a => a.id === id);
  if (!application) return res.status(404).json({ error: '申请不存在' });
  if (application.status !== 'pending') return res.status(400).json({ error: '该申请已处理' });

  application.status = 'rejected';

  res.json({
    success: true,
    message: '已拒绝申请',
    application: {
      ...application,
      user: getUserById(application.userId),
    },
  });
});

app.listen(PORT, () => {
  console.log(`🚀 兴趣小组后端服务已启动: http://localhost:${PORT}`);
  console.log(`📡 健康检查: http://localhost:${PORT}/api/health`);
});
