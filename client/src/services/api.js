// src/services/api.js
import axios from 'axios';

const API_URL = "https://vtech-app.onrender.com";

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor for token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('vtech_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (email, password) => 
  api.post('/api/auth/login', { email, password });

export const register = (data) => 
  api.post('/api/auth/register', data);

// Clients
export const getClients = () => api.get('/api/clients');
export const createClient = (data) => api.post('/api/clients', data);
// ... बाकी सारे API functions इसी तरह

export default api;