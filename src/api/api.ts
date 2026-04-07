/**
 * Mock API 서비스 레이어
 * 백엔드 연동 시 이 파일만 실제 API 호출로 교체하면 됩니다.
 */

const API_BASE = '/api/v1';

// 이후 백엔드 연동 시 사용할 fetch wrapper
async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      // Authorization: `Bearer ${getToken()}`,
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

// ── Auth API ──
export const authAPI = {
  login: (email: string, password: string, role: string) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
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
