const BASE_URL = '';

async function request(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error('请求失败');
  return res.json();
}

export const api = {
  getGroups: () => request('/api/groups'),
  getGroup: (id) => request(`/api/groups/${id}`),
  createGroup: (data) => request('/api/groups', { method: 'POST', body: JSON.stringify(data) }),
  updateGroup: (id, data) => request(`/api/groups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  joinGroup: (id, userId) => request(`/api/groups/${id}/join`, { method: 'POST', body: JSON.stringify({ userId }) }),

  getTopics: (groupId) => request(`/api/groups/${groupId}/topics`),
  createTopic: (groupId, data) => request(`/api/groups/${groupId}/topics`, { method: 'POST', body: JSON.stringify(data) }),
  pinTopic: (id, pinned) => request(`/api/topics/${id}/pin`, { method: 'PUT', body: JSON.stringify({ pinned }) }),
  likeTopic: (id, userId) => request(`/api/topics/${id}/like`, { method: 'POST', body: JSON.stringify({ userId }) }),

  getComments: (topicId) => request(`/api/topics/${topicId}/comments`),
  createComment: (topicId, data) => request(`/api/topics/${topicId}/comments`, { method: 'POST', body: JSON.stringify(data) }),

  getCheckins: (groupId) => request(`/api/groups/${groupId}/checkins`),
  checkin: (groupId, userId) => request(`/api/groups/${groupId}/checkin`, { method: 'POST', body: JSON.stringify({ userId }) }),
  getCheckinStats: (groupId) => request(`/api/groups/${groupId}/checkin-stats`),

  getRanking: () => request('/api/ranking/activity'),
  getUsers: () => request('/api/users'),
};
