import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: () => {
    window.location.href = `${API_URL}/auth/google`;
  },
  getCurrentUser: () => api.get('/auth/me'),
};

// Items API
export const itemsAPI = {
  getAll: (params) => api.get('/items', { params }),
  getById: (id) => api.get(`/items/${id}`),
  create: (formData) => api.post('/items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => api.put(`/items/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/items/${id}`),
  search: (query) => api.get('/items/search', { params: { q: query } }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Locations API
export const locationsAPI = {
  getAll: () => api.get('/locations'),
  getById: (id) => api.get(`/locations/${id}`),
  create: (data) => api.post('/locations', data),
  update: (id, data) => api.put(`/locations/${id}`, data),
  delete: (id) => api.delete(`/locations/${id}`),
};

// Containers API
export const containersAPI = {
  getAll: (params) => api.get('/containers', { params }),
  getById: (id) => api.get(`/containers/${id}`),
  create: (data) => api.post('/containers', data),
  update: (id, data) => api.put(`/containers/${id}`, data),
  delete: (id) => api.delete(`/containers/${id}`),
};

// AI API
export const aiAPI = {
  analyzeImage: (formData) => api.post('/ai/analyze-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  generateDescription: (data) => api.post('/ai/generate-description', data),
};

// Barcode API
export const barcodeAPI = {
  lookup: (barcode) => api.get(`/barcode/lookup/${barcode}`),
};

export default api;

// Made with Bob
