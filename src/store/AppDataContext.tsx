/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { studentsAPI, noticeAPI, scheduleAPI } from '../api/api';
import type {
  Child,
  AttendanceRecord,
  ScheduleItem,
  Notice,
  ObservationLog,
  DashboardStats,
  ActivityTimeline,
  MealPlan,
} from '../types';
import {
  MOCK_ATTENDANCE,
  MOCK_OBSERVATIONS,
  MOCK_DASHBOARD_STATS,
  MOCK_ACTIVITY_TIMELINE,
  MOCK_MEAL_PLANS,
} from '../constants/mockData';

interface AppDataContextType {
  children: Child[];
  attendance: AttendanceRecord[];
  schedules: ScheduleItem[];
  notices: Notice[];
  observations: ObservationLog[];
  stats: DashboardStats;
  activities: ActivityTimeline[];
  meals: MealPlan[];

  // Actions
  markAttendance: (childId: string, status: AttendanceRecord['status']) => void;
  addNotice: (notice: Notice) => void;
  generateAINotice: (
    childId: string,
    memo: string,
    lengthOption: 'short' | 'long',
    summaryContext: string
  ) => Promise<Notice>;
  generateAICommonNotice: (content: string) => Promise<string>;
  generateBatchNotices: (
    childIds: string[],
    memo: string,
    lengthOption: 'short' | 'long',
    summaryContext: string
  ) => Promise<Notice[]>;
  addObservation: (observation: ObservationLog) => void;
  generateAIObservation: (childId: string, photoFile?: File) => Promise<ObservationLog>;
  toggleScheduleComplete: (scheduleId: string) => void;
  addSchedule: (schedule: Partial<ScheduleItem>) => Promise<void>;
  updateSchedule: (id: string, data: Partial<ScheduleItem>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  markNoticeAsRead: (noticeId: string) => Promise<void>;
  updateChild: (id: string, data: Partial<Child>) => Promise<void>;
  updateNotice: (id: string, data: Partial<Notice>) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;
  isLoading: boolean;
}

const AppDataContext = createContext<AppDataContextType | null>(null);


export function AppDataProvider({ children: childrenProp }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [childrenData, setChildrenData] = useState<Child[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [observations, setObservations] = useState<ObservationLog[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalChildren: 0,
    presentCount: 0,
    absentCount: 0,
    noticeCompleted: 0,
    noticeTotal: 0,
    observationCompleted: 0,
    observationTotal: 0,
    medicationRequests: 0,
    allergyCount: 0,
  });
  const [activities, setActivities] = useState<ActivityTimeline[]>([]);
  const [meals, setMeals] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (isAuthenticated) {
      setIsLoading(true);
      const fetchData = async () => {
        try {
          const [studentRes, noticeRes, scheduleRes] = await Promise.all([
            studentsAPI.getAll(),
            noticeAPI.getAll(),
            scheduleAPI.getAll()
          ]);

          if (!mounted) return;

          let mappedChildren: Child[] = [];
          if (studentRes.success && studentRes.students) {
            mappedChildren = studentRes.students.map((s: Record<string, unknown>) => ({
              id: String(s.id || ''),
              name: String(s.name || s.kidsName || '이름 없음'),
              age: 5,
              classId: String(s.classId || 'c1'),
              className: String(s.className || '햇살반'),
              gender: (s.gender as 'male' | 'female') || 'female',
              parentId: String(s.parentUid || ''),
              parentName: '학부모님',
              parentPhone: '000-0000-0000',
              notes: (s.notes as string) || '',
              birthDate: (s.birthDate as string) || '2020-01-01',
              profileEmoji: (s.profileEmoji as string) || '👶',
              profileImageUrl: (s.profileImageUrl as string) || undefined,
              allergies: Array.isArray(s.allergies) ? s.allergies : [],
              traits: Array.isArray(s.traits) ? s.traits : [],
              medicationRequest: s.medicationRequest !== undefined ? String(s.medicationRequest) : null,
            } as Child));
            setChildrenData(mappedChildren);
          }

          if (noticeRes.success && noticeRes.notices) {
            const sortedNotices = [...noticeRes.notices].sort((a, b) => {
              const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return timeB - timeA;
            });
            setNotices(sortedNotices);
          }

          if (scheduleRes.success && scheduleRes.schedules) {
            setSchedules(scheduleRes.schedules);
          }

          // 초기화 (Mock 데이터 기반 항목들 및 통계)
          setAttendance(MOCK_ATTENDANCE);
          setObservations(MOCK_OBSERVATIONS);
          setActivities(MOCK_ACTIVITY_TIMELINE);
          setMeals(MOCK_MEAL_PLANS);

          // 통계 통합 계산
          const today = new Date().toISOString().split('T')[0];
          const noticeCompleted = (noticeRes.notices || []).filter(n => n.type === 'individual' && n.date === today && n.isSent).length;
          const observationCompleted = MOCK_OBSERVATIONS.filter(o => o.date === today).length;
          
          setStats({
            totalChildren: mappedChildren.length,
            presentCount: MOCK_DASHBOARD_STATS.presentCount, // 등하원 미수정 시 Mock 유지
            absentCount: MOCK_DASHBOARD_STATS.absentCount,
            noticeCompleted,
            noticeTotal: mappedChildren.length,
            observationCompleted,
            observationTotal: mappedChildren.length,
            medicationRequests: mappedChildren.filter(c => c.medicationRequest && c.medicationRequest.trim() !== '').length,
            allergyCount: mappedChildren.filter(c => c.allergies && c.allergies.length > 0).length,
          });

        } catch (err) {
          console.error("Failed to load application data", err);
        } finally {
          if (mounted) setIsLoading(false);
        }
      };

      fetchData();
    } else {
      // 로그아웃 시 초기화
      setChildrenData([]);
      setNotices([]);
      setIsLoading(false);
    }
    return () => { mounted = false; };
  }, [isAuthenticated]);

  const markAttendance = useCallback(
    (childId: string, status: AttendanceRecord['status']) => {
      setAttendance((prev) =>
        prev.map((a) =>
          a.childId === childId
            ? {
              ...a,
              status,
              arrivalTime:
                status === 'present'
                  ? new Date().toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })
                  : a.arrivalTime,
            }
            : a,
        ),
      );
      setStats((prev) => {
        const presentDelta = status === 'present' ? 1 : -1;
        return {
          ...prev,
          presentCount: prev.presentCount + presentDelta,
          absentCount: prev.absentCount - presentDelta,
        };
      });
    },
    [],
  );

  const addNotice = useCallback(async (notice: Partial<Notice>) => {
    try {
      const res = await noticeAPI.create(notice);
      if (res.success && res.notice) {
        setNotices((prev) => [res.notice, ...prev]);
      }
    } catch (error) {
       console.error("Failed to save notice to DB", error);
       throw error;
    }
  }, []);

  const generateAINotice = useCallback(
    async (
      childId: string,
      memo: string,
      lengthOption: 'short' | 'long',
      summaryContext: string
    ): Promise<Notice> => {
      const child = childrenData.find((c) => c.id === childId);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/report/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childName: child?.name || '아이',
          commonActivities: summaryContext || '오늘 활동은 무사히 마쳤습니다.',
          specialNote: memo,
          length: lengthOption
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || '알림장 생성에 실패했습니다.');
      }

      const notice: Notice = {
        id: `n-${Date.now()}`,
        type: 'individual',
        childId,
        childName: child?.name,
        title: `${new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric'})} ${child?.name} 알림장`,
        content: data.report,
        date: new Date().toISOString().split('T')[0],
        isRead: false,
        isSent: false,
      };
      
      return notice;
    },
    [childrenData],
  );

  const generateAICommonNotice = useCallback(
    async (content: string): Promise<string> => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/report/common/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || '공통 알림장 생성에 실패했습니다.');
      }

      return data.report;
    },
    []
  );


  const generateBatchNotices = useCallback(
    async (
      childIds: string[],
      memo: string,
      lengthOption: 'short' | 'long',
      summaryContext: string
    ): Promise<Notice[]> => {
      const promises = childIds.map(childId => 
        generateAINotice(childId, memo, lengthOption, summaryContext)
      );
      return await Promise.all(promises);
    },
    [generateAINotice],
  );

  const addObservation = useCallback((observation: ObservationLog) => {
    setObservations((prev) => [observation, ...prev]);
  }, []);

  const generateAIObservation = useCallback(
    async (childId: string, photoFile?: File): Promise<ObservationLog> => {
      // Use photoFile to avoid unused var lint error if needed, or remove it from here
      void photoFile;
      await new Promise((r) => setTimeout(r, 1500));
      const child = childrenData.find((c) => c.id === childId);
      const observation: ObservationLog = {
        id: `obs-${Date.now()}`,
        childId,
        childName: child?.name ?? '아이',
        date: new Date().toISOString().split('T')[0],
        categories: [
          {
            name: '사회관계',
            analysis:
              '또래와의 상호작용에서 긍정적인 의사소통 능력이 관찰되었습니다.',
          },
          {
            name: '예술경험',
            analysis:
              '미술 활동에서 다양한 색상을 활용해 자유로운 표현을 시도했습니다.',
          },
          {
            name: '자연탐구',
            analysis:
              '주변 환경에 대한 관심이 높으며, 탐구하는 자세를 보였습니다.',
          },
        ],
        content: `${child?.name ?? '아이'}의 활동 사진을 바탕으로 AI가 분석한 관찰일지입니다. 자유놀이 시간에 또래 친구들과 적극적으로 상호작용하며, 사회성 발달이 잘 이루어지고 있는 것으로 관찰됩니다.`,
        isAIGenerated: true,
      };
      setObservations((prev) => [observation, ...prev]);
      setStats((prev) => ({
        ...prev,
        observationCompleted: prev.observationCompleted + 1,
      }));
      return observation;
    },
    [childrenData],
  );

  const toggleScheduleComplete = useCallback(async (scheduleId: string) => {
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (!schedule) return;

    const newStatus = !schedule.isCompleted;
    try {
      await scheduleAPI.update(scheduleId, { isCompleted: newStatus });
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === scheduleId ? { ...s, isCompleted: newStatus } : s,
        ),
      );
    } catch (error) {
      console.error("Failed to update schedule status", error);
    }
  }, [schedules]);

  const addSchedule = useCallback(async (schedule: Partial<ScheduleItem>) => {
    try {
      const res = await scheduleAPI.create(schedule);
      if (res.success && res.schedule) {
        setSchedules((prev) => [...prev, res.schedule]);
      }
    } catch (error) {
      console.error("Failed to add schedule", error);
      throw error;
    }
  }, []);

  const updateSchedule = useCallback(async (id: string, data: Partial<ScheduleItem>) => {
    try {
      await scheduleAPI.update(id, data);
      setSchedules((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...data } : s))
      );
    } catch (error) {
      console.error("Failed to update schedule", error);
      throw error;
    }
  }, []);

  const deleteSchedule = useCallback(async (id: string) => {
    try {
      await scheduleAPI.delete(id);
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Failed to delete schedule", error);
      throw error;
    }
  }, []);

  const markNoticeAsRead = useCallback(async (noticeId: string) => {
    try {
      await noticeAPI.markAsRead(noticeId);
      setNotices((prev) =>
        prev.map((n) => (n.id === noticeId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark notice as read", error);
    }
  }, []);

  const updateNotice = useCallback(async (id: string, data: Partial<Notice>) => {
    try {
      await noticeAPI.update(id, data);
      setNotices((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...data } : n))
      );
    } catch (error) {
      console.error("Failed to update notice", error);
      throw error;
    }
  }, []);

  const deleteNotice = useCallback(async (id: string) => {
    try {
      await noticeAPI.delete(id);
      setNotices((prev) => prev.filter((n) => n.id !== id));
      
      // 통계 재계산 (오늘 날짜 발송건인 경우)
      setStats(prev => {
        const deletedNotice = notices.find(n => n.id === id);
        const today = new Date().toISOString().split('T')[0];
        if (deletedNotice && deletedNotice.date === today && deletedNotice.isSent && deletedNotice.type === 'individual') {
          return { ...prev, noticeCompleted: Math.max(0, prev.noticeCompleted - 1) };
        }
        return prev;
      });
    } catch (error) {
      console.error("Failed to delete notice", error);
      throw error;
    }
  }, [notices]);

  const updateChild = useCallback(async (id: string, data: Partial<Child>) => {
    try {
      await studentsAPI.update(id, data);
      setChildrenData((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c))
      );
    } catch (error) {
      console.error("Failed to update child info", error);
      throw error;
    }
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        children: childrenData,
        attendance,
        schedules,
        notices,
        observations,
        stats,
        activities,
        meals,
        markAttendance,
        addNotice,
        generateAINotice,
        generateAICommonNotice,
        generateBatchNotices,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        addObservation,
        generateAIObservation,
        toggleScheduleComplete,
        markNoticeAsRead,
        updateChild,
        updateNotice,
        deleteNotice,
        isLoading,
      }}
    >
      {childrenProp}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextType {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
