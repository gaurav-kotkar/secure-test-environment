import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me')
};

// Test APIs
export const testAPI = {
  startTest: () => api.post('/test/start'),
  getCurrentAttempt: () => api.get('/test/current'),
  submitTest: (attemptId) => api.post('/test/submit', { attemptId }),
  logEvents: (attemptId, events) => api.post('/test/logs', { attemptId, events }),
  getEventLogs: (attemptId) => api.get(`/test/logs/${attemptId}`),
  getViolationCount: (attemptId) => api.get(`/test/violations/${attemptId}`)
};

export default api;
