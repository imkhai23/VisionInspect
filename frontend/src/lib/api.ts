/**
 * VisionInspect API Client
 * Centralized Axios instance with JWT token management.
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach JWT ──────────────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 ─────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      Cookies.remove('access_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; password: string; full_name?: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  me: () => api.get('/auth/me'),
};

// ── Predictions ───────────────────────────────────────────────────────────────
export const predictApi = {
  predict: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/predict', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getClasses: () => api.get('/predict/classes'),

  history: (page = 1, pageSize = 20) =>
    api.get('/history', { params: { page, page_size: pageSize } }),
};

// ── Usage ─────────────────────────────────────────────────────────────────────
export const usageApi = {
  getUsage: () => api.get('/usage'),
  getDashboard: () => api.get('/usage/dashboard'),
};

// ── Stripe ────────────────────────────────────────────────────────────────────
export const stripeApi = {
  createCheckout: (data: { success_url: string; cancel_url: string }) =>
    api.post('/stripe/subscribe', data),

  getSubscription: () => api.get('/stripe/subscription'),


  cancelSubscription: () => api.post('/stripe/cancel'),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  getUsers: () => api.get('/admin/users'),
  updateUser: (userId: string, data: { is_admin?: boolean; is_active?: boolean }) =>
    api.put(`/admin/users/${userId}`, data),
};
