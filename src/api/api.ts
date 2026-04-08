import { auth } from '../config/firebase';
import type { ApiError, Notice } from '../types';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// 이후 백엔드 연동 시 사용할 fetch wrapper
async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  let token = null;
  // Wait for auth to be ready or just use currentUser
  if (auth.currentUser) {
    token = await auth.currentUser.getIdToken();
  }

  const isFormData = options?.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  } as any;

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!res.ok) {
    const error = new Error(`API Error: ${res.status}`) as ApiError;
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

// ── Students API ──
export const studentsAPI = {
  getAll: () => request<{ success: boolean; students: Record<string, unknown>[] }>('/students'),
  getById: (id: string) => request(`/students/${id}`),
  updateTraits: (id: string, traits: string[]) => request<{ success: boolean; message: string }>(`/students/${id}/traits`, {
    method: 'PUT',
    body: JSON.stringify({ traits })
  }),
  update: (id: string, data: any) =>
    request<{ success: boolean; message: string }>(`/students/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// ── Memos API ──
export const memosAPI = {
  getByChild: (childId: string) => request<{ success: boolean; memos: Record<string, string> }>(`/students/${childId}/memos`),
  save: (childId: string, date: string, content: string) => request<{ success: boolean; message: string }>(`/students/${childId}/memos/${date}`, {
    method: 'POST',
    body: JSON.stringify({ content })
  }),
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

// ── Notice API ──
export const noticeAPI = {
  create: (data: Partial<Notice>) => request<{ success: boolean; notice: Notice }>('/notices', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getAll: () => request<{ success: boolean; notices: Notice[] }>('/notices'),
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
  markAsRead: (id: string) => request<{ success: boolean }>(`/notices/${id}/read`, {
    method: 'PUT',
  }),
  update: (id: string, data: Partial<Notice>) =>
    request<{ success: boolean; message: string }>(`/notices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/notices/${id}`, {
      method: 'DELETE',
    }),
  send: (noticeId: string) =>
    request(`/notices/${noticeId}/send`, { method: 'POST' }),
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

// ── Upload API ──
export const uploadAPI = {
  file: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<{ success: boolean; url: string }>('/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Browser sets boundary
    });
  },
};

