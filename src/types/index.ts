// ── 사용자 / 인증 ──
export type UserRole = 'teacher' | 'parent';

export interface ApiError extends Error {
  status?: number;
}

export interface Kid {
  id: string;
  kidsName: string;
  birthDate: string;
  teacherName: string;
  parentUid: string;
}

export interface User {
  uid: string;
  name: string;
  role: UserRole;
  phone: string;
  createdAt?: string;
  kids?: Kid[]; // 교사: 담당 학생, 부모: 내 아이
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface SignupResponse {
  success: boolean;
  message: string;
}

// ── 아이 정보 ──
export interface Child {
  id: string;
  name: string;
  age: number;
  classId: string;
  className: string;
  profileEmoji: string;
  profileImageUrl?: string;
  birthDate: string;
  parentId: string;
  parentName: string;
  parentPhone: string;
  allergies: string[];
  traits: string[];
  medicationRequest: string | null;
  notes: string;
  gender: 'male' | 'female';
}

// ── 출석 ──
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'left';

export interface AttendanceRecord {
  id: string;
  childId: string;
  date: string;
  status: AttendanceStatus;
  arrivalTime?: string;
  departureTime?: string;
  reason?: string;
}

// ── 일정 ──
export interface ScheduleItem {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  description?: string;
  color?: string;
  isCompleted: boolean;
}

// ── 알림장 ──
export type NoticeType = 'common' | 'individual';
export type CushionLevel = 'soft' | 'medium' | 'strong';

export interface Notice {
  id: string;
  type: NoticeType;
  childId?: string;
  childName?: string;
  title: string;
  content: string;
  date: string;
  isRead: boolean;
  isSent: boolean;
  photoUrl?: string; // 기존 호환성용
  photoUrls?: string[]; // 다중 이미지용
  keywords?: string[];
  cushionLevel?: CushionLevel;
  createdAt?: string;
}

// ── 관찰일지 ──
export interface ObservationLog {
  id: string;
  childId: string;
  childName: string;
  date: string;
  photoUrl?: string;
  categories: ObservationCategory[];
  content: string;
  isAIGenerated: boolean;
}

export interface ObservationCategory {
  name: string;
  analysis: string;
}

// ── 식단 ──
export interface MealPlan {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'snack_am' | 'snack_pm';
  menu: string[];
  allergyWarnings: AllergyWarning[];
}

export interface AllergyWarning {
  childId: string;
  childName: string;
  allergen: string;
  menuItem: string;
}

// ── 대시보드 통계 ──
export interface DashboardStats {
  totalChildren: number;
  presentCount: number;
  absentCount: number;
  noticeCompleted: number;
  noticeTotal: number;
  observationCompleted: number;
  observationTotal: number;
  medicationRequests: number;
  allergyCount: number;
}

// ── 활동 타임라인 ──
export interface ActivityTimeline {
  id: string;
  type: 'attendance' | 'notice' | 'observation' | 'schedule' | 'meal';
  title: string;
  description: string;
  time: string;
  icon: string;
}
