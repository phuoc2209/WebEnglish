import axios from 'axios';
import { getToken, removeToken } from './token';

// Lấy baseURL từ env hoặc default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Tạo axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Tăng timeout cho API nặng
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Thêm token và log
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(`[${new Date().toISOString()}] No token found for request: ${config.method.toUpperCase()} ${config.url}`);
    }
    console.log(`[${new Date().toISOString()}] Request: ${config.method.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data,
      headers: { Authorization: config.headers.Authorization || 'No token' },
    });
    return config;
  },
  (error) => {
    console.error(`[${new Date().toISOString()}] Request error: ${error.message}`);
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý lỗi global
api.interceptors.response.use(
  (response) => {
    console.log(`[${new Date().toISOString()}] Response: ${response.config.method.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message;
    console.error(`[${new Date().toISOString()}] Response error: ${status} ${message}`, {
      url: error.config?.url,
      params: error.config?.params,
      data: error.config?.data,
    });

    if (status === 401) {
      removeToken();
      // Dùng react-router-dom thay vì window.location
      if (window.location.pathname !== '/auth/login') {
        window.dispatchEvent(new CustomEvent('auth:logout')); // Thông báo cho SPA
        window.location.href = '/auth/login'; // Fallback cho non-SPA
      }
    }

    return Promise.reject(Object.assign(error, { status, message }));
  }
);

export default api;