import axios from 'axios';
import { createRateLimiter, updateRateLimiter, importRateLimiter } from '../utils/rateLimiter';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      throw new Error('Too many requests. Please wait before trying again.');
    }
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('Backend server is not running. Please start the backend server or use demo mode.');
    }
    if (error.response?.status === 404) {
      throw new Error('API endpoint not found. Please check if the backend server is running.');
    }
    return Promise.reject(error);
  }
);

// Rate limiting wrapper
const withRateLimit = (rateLimiter, operation) => {
  return (...args) => {
    const userKey = JSON.parse(localStorage.getItem('user') || '{}').id || 'anonymous';
    
    if (!rateLimiter.isAllowed(userKey)) {
      const resetTime = rateLimiter.getResetTime(userKey);
      const waitTime = resetTime ? Math.ceil((resetTime - new Date()) / 1000) : 60;
      throw new Error(`Rate limit exceeded. Please wait ${waitTime} seconds before trying again.`);
    }
    
    return operation(...args);
  };
};

export const authAPI = {
  login: (email) => api.post('/auth/login', { email }),
  verifyMagicLink: (token) => api.post('/auth/verify', { token }),
};

export const buyersAPI = {
  getAll: (params) => api.get('/buyers', { params }),
  getById: (id) => api.get(`/buyers/${id}`),
  create: withRateLimit(createRateLimiter, (data) => api.post('/buyers', data)),
  update: withRateLimit(updateRateLimiter, (id, data) => api.put(`/buyers/${id}`, data)),
  delete: (id) => api.delete(`/buyers/${id}`),
  import: withRateLimit(importRateLimiter, (formData) => api.post('/buyers/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })),
  export: (params) => api.get('/buyers/export', { params, responseType: 'blob' }),
};

export default api;