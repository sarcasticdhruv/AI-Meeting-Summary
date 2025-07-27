import axios from 'axios';

// Use production backend URL when deployed, localhost for development  
const getApiBaseUrl = () => {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In production, use relative path (same domain)
  if (import.meta.env.MODE === 'production') {
    return "";  // Use relative URLs for production
  }
  
  // In development, use localhost
  return "http://localhost:8000";
};

const API_BASE_URL = getApiBaseUrl();

console.log('🔗 Auth API Base URL:', API_BASE_URL);
console.log('🌍 Auth Environment Mode:', import.meta.env.MODE);
console.log('🌍 Auth VITE_API_URL:', import.meta.env.VITE_API_URL);

const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
authAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async register(userData) {
    const response = await authAPI.post('/register', userData);
    return response.data;
  },

  async login(credentials) {
    const response = await authAPI.post('/login', credentials);
    return response.data;
  },

  async getProfile() {
    const response = await authAPI.get('/profile');
    return response.data;
  },

  async getCurrentUser() {
    const response = await authAPI.get('/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/';
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },

  getToken() {
    return localStorage.getItem('access_token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default authService;
