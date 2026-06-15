const BASE_URL = '';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

async function request(url, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${url}`, {
    headers,
    ...options,
  });
  if (res.status === 401) {
    clearAuth();
    window.dispatchEvent(new CustomEvent('auth:expired'));
    throw new Error('登录已过期，请重新登录');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '请求失败' }));
    throw new Error(err.error || '请求失败');
  }
  return res.json();
}

export const api = {
  register: (data) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/api/auth/me'),

  getGroups: () => request('/api/groups'),
  getGroup: (id) => request(`/api/groups/${id}`),
  createGroup: (data) => request('/api/groups', { method: 'POST', body: JSON.stringify(data) }),
  updateGroup: (id, data) => request(`/api/groups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  joinGroup: (id) => request(`/api/groups/${id}/join`, { method: 'POST' }),

  getTopics: (groupId) => request(`/api/groups/${groupId}/topics`),
  createTopic: (groupId, data) => request(`/api/groups/${groupId}/topics`, { method: 'POST', body: JSON.stringify(data) }),
  pinTopic: (id, pinned) => request(`/api/topics/${id}/pin`, { method: 'PUT', body: JSON.stringify({ pinned }) }),
  likeTopic: (id) => request(`/api/topics/${id}/like`, { method: 'POST' }),

  getComments: (topicId) => request(`/api/topics/${topicId}/comments`),
  createComment: (topicId, data) => request(`/api/topics/${topicId}/comments`, { method: 'POST', body: JSON.stringify(data) }),

  getCheckins: (groupId) => request(`/api/groups/${groupId}/checkins`),
  checkin: (groupId) => request(`/api/groups/${groupId}/checkin`, { method: 'POST' }),
  getCheckinStats: (groupId) => request(`/api/groups/${groupId}/checkin-stats`),

  getRanking: () => request('/api/ranking/activity'),
  getUsers: () => request('/api/users'),

  setToken,
  getToken,
  clearAuth,
};
