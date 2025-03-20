import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_API_URL: string;
    }
  }
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  login: (username: string, password: string) =>
    api.post('/api/auth/token', { username, password }),
  register: (data: any) => api.post('/api/auth/register', data),
};

// Task endpoints
export const tasks = {
  getAll: () => api.get('/api/tasks'),
  getById: (id: number) => api.get(`/api/tasks/${id}`),
  create: (data: any) => api.post('/api/tasks', data),
  update: (id: number, data: any) => api.put(`/api/tasks/${id}`, data),
  delete: (id: number) => api.delete(`/api/tasks/${id}`),
  complete: (id: number) => api.post(`/api/tasks/${id}/complete`),
};

// Habit endpoints
export const habits = {
  getAll: () => api.get('/api/habits'),
  getById: (id: number) => api.get(`/api/habits/${id}`),
  create: (data: any) => api.post('/api/habits', data),
  update: (id: number, data: any) => api.put(`/api/habits/${id}`, data),
  delete: (id: number) => api.delete(`/api/habits/${id}`),
  checkIn: (id: number, data: any) => api.post(`/api/habits/${id}/check-in`, data),
  getCheckIns: (id: number) => api.get(`/api/habits/${id}/check-ins`),
};

// Calendar endpoints
export const calendar = {
  getAuthUrl: () => api.get('/api/calendar/auth-url'),
  handleCallback: (code: string) => api.post('/api/calendar/callback', { code }),
  getEvents: (startDate: string, endDate: string) =>
    api.get('/api/calendar/events', { params: { start_date: startDate, end_date: endDate } }),
  syncTask: (taskId: number) => api.post('/api/calendar/sync-task', { task_id: taskId }),
};

// AI endpoints
export const ai = {
  getRecommendations: () => api.get('/api/ai/recommendations'),
  getInsights: (startDate: string, endDate: string) =>
    api.get('/api/ai/insights', { params: { start_date: startDate, end_date: endDate } }),
  createSuggestedTask: (suggestionIndex: number) =>
    api.post('/api/ai/create-suggested-task', { suggestion_index: suggestionIndex }),
};

export default api; 