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
  traits?: string[];
  medicationRequest?: string | null;
}

export interface User {
  uid: string;
  name: string;
  role: UserRole;
  phone: string;
  createdAt?: string;
  kids?: Kid[];
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
  content: string;      // 관찰 내용 (사실)
  evaluation: string;   // 관찰 평가 (해석)
  isAIGenerated: boolean;
}

export interface ObservationCategory {
  name: string;
  analysis: string;
}

export type NuriDomain = '신체운동·건강' | '의사소통' | '사회관계' | '예술경험' | '자연탐구';

export interface DomainDetail {
  content: string;
  evaluation: string;
}

export interface MonthlyReport {
  id: string;
  childId: string;
  childName: string;
  reportMonth: string;
  details: Record<string, DomainDetail>;
  isSaved: boolean;
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
