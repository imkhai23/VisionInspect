/**
 * VisionInspect API Client
 * Centralized Axios instance with JWT token management.
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './auth';

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
  const token = tokenStorage.get();
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
      tokenStorage.remove();
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

// ── Admin Training Platform ────────────────────────────────────────────────
export const datasetApi = {
  list: () => api.get('/admin/training/datasets'),
  create: (data: any) => api.post('/admin/training/datasets', data),
  update: (datasetId: string, data: any) => api.patch(`/admin/training/datasets/${datasetId}`, data),
  remove: (datasetId: string) => api.delete(`/admin/training/datasets/${datasetId}`),
  stats: (datasetId: string) => api.get(`/admin/training/datasets/${datasetId}/stats`),
  assets: (datasetId: string) => api.get(`/admin/training/datasets/${datasetId}/assets`),
  deleteAsset: (datasetId: string, assetId: string) => api.delete(`/admin/training/datasets/${datasetId}/assets/${assetId}`),
  upload: (datasetId: string, formData: FormData) =>
    api.post(`/admin/training/datasets/${datasetId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadZip: (datasetId: string, formData: FormData) =>
    api.post(`/admin/training/datasets/${datasetId}/upload-zip`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  split: (datasetId: string, data: any) => api.post(`/admin/training/datasets/${datasetId}/split`, data),
};

export const trainingApi = {
  listJobs: () => api.get('/admin/training/training-jobs'),
  createJob: (data: any) => api.post('/admin/training/training-jobs', data),
  getJob: (jobId: string) => api.get(`/admin/training/training-jobs/${jobId}`),
  getLogs: (jobId: string) => api.get(`/admin/training/training-jobs/${jobId}/logs`),
  listModels: () => api.get('/admin/training/models'),
  activateModel: (modelVersionId: string) => api.post(`/admin/training/models/${modelVersionId}/activate`),
  deployModel: (modelVersionId: string, data: any = {}) =>
    api.post(`/admin/training/models/${modelVersionId}/deploy`, data),
  rollbackModel: (modelVersionId: string) => api.post(`/admin/training/models/${modelVersionId}/rollback`),
  removeModel: (modelVersionId: string) => api.delete(`/admin/training/models/${modelVersionId}`),
  trainingWsUrl: (jobId: string) => `${API_URL.replace(/^http/, 'ws')}/admin/training/training-jobs/${jobId}/ws?token=${tokenStorage.get() || ''}`,
};
