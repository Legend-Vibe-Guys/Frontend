import { auth } from '../config/firebase';
import type { ApiError } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// 이후 백엔드 연동 시 사용할 fetch wrapper
async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  let token = null;
  if (auth.currentUser) {
    try {
      token = await auth.currentUser.getIdToken();
    } catch (e) {
      console.warn("Failed to get Firebase ID token:", e);
    }
  }

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const error = new Error(errorData.message || `API Error: ${res.status}`) as ApiError;
    error.status = res.status;
    throw error;
  }
  
  // Return null or empty if no content, else parse JSON
  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

// ── Auth API ──
export const authAPI = {
  login: () =>
    request('/auth/login', {
      method: 'POST',
    }),
  signup: (data: Record<string, unknown>) =>
    request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  refresh: () => request('/auth/refresh', { method: 'POST' }),
};

// ── Children API ──
export const childrenAPI = {
  getAll: () => request('/children'),
  getById: (id: string) => request(`/children/${id}`),
};

// ── Attendance API ──
export const attendanceAPI = {
  getByDate: (date: string) => request(`/attendance?date=${date}`),
  mark: (childId: string, status: string) =>
    request('/attendance', {
      method: 'POST',
      body: JSON.stringify({ childId, status }),
    }),
};

// ── Notice API (핵심 - API화 가능) ──
export const noticeAPI = {
  generate: (data: {
    childId: string;
    keywords: string[];
    memo: string;
    cushionLevel: string;
  }) =>
    request('/notices/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  generateBatch: (data: {
    childIds: string[];
    keywords: string[];
    memo: string;
    cushionLevel: string;
  }) =>
    request('/notices/generate-batch', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  send: (noticeId: string) =>
    request(`/notices/${noticeId}/send`, { method: 'POST' }),
  getAll: () => request('/notices'),
};

// ── Observation API (핵심 - API화 가능) ──
export const observationAPI = {
  generate: (childId: string, photo: File) => {
    const formData = new FormData();
    formData.append('childId', childId);
    formData.append('photo', photo);
    return request('/observations/generate', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  },
  getAll: () => request('/observations'),
  getByChild: (childId: string) =>
    request(`/observations?childId=${childId}`),
};

// ── Schedule API ──
export const scheduleAPI = {
  getByDate: (date: string) => request(`/schedules?date=${date}`),
  update: (id: string, data: Record<string, unknown>) =>
    request(`/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ── Meal API ──
export const mealAPI = {
  getByDate: (date: string) => request(`/meals?date=${date}`),
  checkAllergies: (date: string) =>
    request(`/meals/allergy-check?date=${date}`),
};
