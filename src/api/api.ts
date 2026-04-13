import { auth } from '../config/firebase';
import type { ApiError, Notice, Child, ScheduleItem, ObservationRecord, MonthlyReport, Comment, AppNotification } from '../types';

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
  } as Record<string, string>;

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    ...options,
    headers,
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
  getTeachers: () => request<{ success: boolean; teachers: { uid: string; name: string; className: string }[] }>('/auth/teachers'),
  updateProfile: (data: { className?: string }) =>
    request<{ success: boolean; message: string; className: string }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// ── Students API ──
export const studentsAPI = {
  getAll: () => request<{ success: boolean; students: Record<string, unknown>[] }>('/students'),
  getById: (id: string) => request(`/students/${id}`),
  updateTraits: (id: string, traits: string[]) => request<{ success: boolean; message: string }>(`/students/${id}/traits`, {
    method: 'PUT',
    body: JSON.stringify({ traits })
  }),
  update: (id: string, data: Partial<Child>) =>
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

// ── Comment API ──
export const commentAPI = {
  getAll: (noticeId: string) => request<{ success: boolean; comments: Comment[] }>(`/notices/${noticeId}/comments`),
  create: (noticeId: string, content: string) => request<{ success: boolean; comment: Comment }>(`/notices/${noticeId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content })
  }),
  delete: (noticeId: string, commentId: string) => request<{ success: boolean; message: string }>(`/notices/${noticeId}/comments/${commentId}`, {
    method: 'DELETE'
  }),
  update: (noticeId: string, commentId: string, content: string) => request<{ success: boolean; comment: Comment }>(`/notices/${noticeId}/comments/${commentId}`, {
    method: 'PATCH',
    body: JSON.stringify({ content })
  }),
};

// ── Observation API ──
export const observationAPI = {
  // STT 음성 변환 (Groq Whisper)
  stt: (file: Blob) => {
    const formData = new FormData();
    formData.append('file', file, 'audio.webm');
    return request<{ text: string }>('/observations/stt', {
      method: 'POST',
      body: formData,
    });
  },

  // AI 관찰일지 초안 생성
  generateDraft: (data: { childName: string; memo: string; category: string }) =>
    request<{ observationContent: string; observationEvaluation: string }>('/observations/generate-draft', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 관찰일지 저장
  create: (data: Partial<ObservationRecord>) =>
    request<{ success: boolean; id: string }>('/observations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 관찰일지 목록 조회 (필터링)
  getAll: (filters: { childId?: string; category?: string; date?: string } = {}) => {
    const params = new URLSearchParams();
    if (filters.childId) params.append('childId', filters.childId);
    if (filters.category) params.append('category', filters.category);
    if (filters.date) params.append('date', filters.date);
    return request<{ success: boolean; observations: ObservationRecord[] }>(`/observations?${params.toString()}`);
  },
  
  // 관찰일지 삭제
  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/observations/${id}`, {
      method: 'DELETE',
    }),

  // 관찰일지 수정
  update: (id: string, data: Partial<ObservationRecord>) =>
    request<{ success: boolean; message: string }>(`/observations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// ── Schedule API ──
export const scheduleAPI = {
  getAll: (date?: string) => request<{ success: boolean; schedules: ScheduleItem[] }>(`/schedules${date ? `?date=${date}` : ''}`),
  create: (data: Partial<ScheduleItem>) => request<{ success: boolean; schedule: ScheduleItem }>('/schedules', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: Partial<ScheduleItem>) => request<{ success: boolean; message: string }>(`/schedules/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => request<{ success: boolean; message: string }>(`/schedules/${id}`, {
    method: 'DELETE',
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

// ── Monthly Report API ──
export const monthlyReportAPI = {
  save: (data: MonthlyReport) => 
    request<{ success: boolean; id: string; createdAt?: string; updatedAt?: string }>('/report/monthly', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getByChild: (childId: string) => 
    request<{ success: boolean; reports: MonthlyReport[] }>(`/report/monthly?childId=${childId}`),
  delete: (id: string) => 
    request<{ success: boolean; message: string }>(`/report/monthly/${id}`, {
      method: 'DELETE'
    })
};

// ── Notification API ──
export const notificationAPI = {
  getAll: () => request<{ success: boolean; notifications: AppNotification[] }>('/notifications'),
  markAsRead: (id: string) => request<{ success: boolean }>(`/notifications/${id}/read`, {
    method: 'PATCH'
  }),
  markAllAsRead: () => request<{ success: boolean }>('/notifications/read-all', {
    method: 'PATCH'
  }),
};

