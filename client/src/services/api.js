import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nexus_token');
      localStorage.removeItem('nexus_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data)
};

// Subjects API
export const subjectsAPI = {
  getAll: (params) => api.get('/subjects', { params }),
  getBySlug: (slug) => api.get(`/subjects/${slug}`)
};

// Topics API
export const topicsAPI = {
  getBySubject: (subjectSlug, params) => api.get(`/topics/subject/${subjectSlug}`, { params }),
  getTopic: (subjectSlug, topicSlug) => api.get(`/topics/${subjectSlug}/${topicSlug}`),
  getBySlug: (subjectSlug, topicSlug) => api.get(`/topics/${subjectSlug}/${topicSlug}`),
  markComplete: (topicId) => api.post(`/topics/${topicId}/complete`),
  toggleBookmark: (topicId) => api.post(`/topics/${topicId}/bookmark`),
  complete: (topicId) => api.post(`/topics/${topicId}/complete`),
  bookmark: (topicId) => api.post(`/topics/${topicId}/bookmark`),
  search: (q) => api.get('/topics/search', { params: { q } })
};

// AI Agent API
export const aiAPI = {
  chat: (data) => api.post('/ai/chat', data),
  explain: (data) => api.post('/ai/explain', data),
  generateVisual: (data) => api.post('/ai/visual', data),
  generateCode: (data) => api.post('/ai/code', data),
  resolveDoubt: (data) => api.post('/ai/doubt', data),
  getSessions: () => api.get('/ai/sessions'),
  getSession: (id) => api.get(`/ai/sessions/${id}`),
  deleteSession: (id) => api.delete(`/ai/sessions/${id}`)
};

// Interview API
export const interviewAPI = {
  getAll: (params) => api.get('/interview', { params }),
  getQuestions: (subjectId, params) => api.get(`/interview/questions/${subjectId}`, { params }),
  generate: (data) => api.post('/interview/generate', data),
  getRandom: (params) => api.get('/interview/random', { params })
};

// Assessment API
export const assessmentAPI = {
  getAll: (params) => api.get('/assessments', { params }),
  getBySubject: (subjectId, params) => api.get(`/assessments/subject/${subjectId}`, { params }),
  getById: (id) => api.get(`/assessments/${id}`),
  submit: (id, data) => api.post(`/assessments/${id}/submit`, data),
  generate: (data) => api.post('/assessments/generate', data),
  getHistory: () => api.get('/assessments/history')
};

// Learning Path API
export const learningPathAPI = {
  getAll: () => api.get('/learning-path'),
  getById: (id) => api.get(`/learning-path/${id}`),
  generate: (data) => api.post('/learning-path/generate', data),
  create: (data) => api.post('/learning-path', data),
  completeMilestone: (pathId, milestoneId) => api.put(`/learning-path/${pathId}/milestone/${milestoneId}`),
  delete: (id) => api.delete(`/learning-path/${id}`)
};

// Progress API
export const progressAPI = {
  getDashboard: () => api.get('/progress/dashboard'),
  getSubjectProgress: (subjectId) => api.get(`/progress/subject/${subjectId}`),
  getLeaderboard: () => api.get('/progress/leaderboard')
};

export default api;
