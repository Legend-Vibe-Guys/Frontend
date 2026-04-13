/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';

import { studentsAPI, noticeAPI, scheduleAPI, observationAPI, monthlyReportAPI } from '../api/api';
import { formatDateISO } from '../utils/date';

import type {
  Child,
  AttendanceRecord,
  ScheduleItem,
  Notice,
  ObservationLog,
  DashboardStats,
  ActivityTimeline,
  MealPlan,
  MonthlyReport,
  NuriDomain,
  DomainDetail,
  ObservationRecord,
} from '../types';
import {
  MOCK_DASHBOARD_STATS,
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
  monthlyReports: MonthlyReport[];

  // Actions
  markAttendance: (childId: string, status: AttendanceRecord['status']) => void;
  addNotice: (notice: Partial<Notice>) => Promise<void>;
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
  addObservation: (observation: ObservationLog) => Promise<void>;
  deleteObservation: (id: string) => Promise<void>;
  updateObservation: (id: string, data: Partial<ObservationLog>) => Promise<void>;
  generateAIObservation: (childId: string, memo: string, category: string) => Promise<ObservationLog>;
  generateMonthlyReport: (childId: string, month: string) => Promise<MonthlyReport>;
  saveMonthlyReport: (report: MonthlyReport) => Promise<void>;
  deleteMonthlyReport: (reportId: string) => Promise<void>;
  fetchMonthlyReports: (childId: string) => Promise<void>;
  sendMonthlyReportToParent: (report: MonthlyReport) => Promise<void>;
  saveMonthlyReportLocal?: (report: MonthlyReport) => void;
  toggleScheduleComplete: (scheduleId: string) => Promise<void>;
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
  const [activities, setActivities] = useState<ActivityTimeline[]>([]);
  const [meals, setMeals] = useState<MealPlan[]>([]);
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (isAuthenticated) {
      setIsLoading(true);
      const fetchData = async () => {
        try {
          const [studentRes, noticeRes, scheduleRes, observationRes] = await Promise.all([
            studentsAPI.getAll(),
            noticeAPI.getAll(),
            scheduleAPI.getAll(),
            observationAPI.getAll()
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

          if (observationRes && observationRes.success) {
            // 서버의 필드명(observationContent 등)을 UI 필드명(content 등)으로 매핑
            const mappedObservations: ObservationLog[] = observationRes.observations.map((obs: ObservationRecord) => {
              // 다양한 필드명 대응 (백엔드 버전에 따른 차이 보완)
              const content = obs.content || obs.observationContent || obs.memo || obs.rawMemo || '';
              const evaluation = obs.evaluation || obs.observationEvaluation || '';
              const date = obs.date || (obs.createdAt ? obs.createdAt.split('T')[0] : formatDateISO());

              return {
                id: obs.id || `obs-${Date.now()}-${Math.random()}`,
                childId: obs.childId,
                childName: obs.childName,
                date,
                content,
                evaluation,
                categories: obs.categories || [{ name: obs.category || '기타', analysis: '' }],
                isAIGenerated: obs.isAIGenerated || false,
              };
            });
            setObservations(mappedObservations);
          }

          setAttendance(MOCK_DASHBOARD_STATS.presentCount ? [] : []); // 출석 데이터 초기화 (임시)
          setActivities([]);
          setMeals([]);
        } catch (err) {
          console.error("Failed to load application data", err);
        } finally {
          if (mounted) setIsLoading(false);
        }
      };

      fetchData();
    } else {
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
        date: formatDateISO(),
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

  const addObservation = useCallback(async (observation: ObservationLog) => {
    try {
      const res = await observationAPI.create({
        childId: observation.childId,
        childName: observation.childName,
        memo: observation.rawMemo || '', // 원문 메모 보존
        category: observation.categories[0].name,
        observationContent: observation.content,
        observationEvaluation: observation.evaluation,
        date: observation.date
      });
      if (res.id) {
        // 새로 저장된 데이터는 이미 observation 객체에 categories가 포함되어 있음
        const newObs = { 
          ...observation, 
          id: res.id
        };
        setObservations((prev) => [newObs, ...prev]);
      }
    } catch (error) {
      console.error("Failed to save observation", error);
      throw error;
    }
  }, []);

  const deleteObservation = useCallback(async (id: string) => {
    try {
      await observationAPI.delete(id);
      
      setObservations((prev) => prev.filter((o) => o.id !== id));
    } catch (error) {
      console.error("Failed to delete observation", error);
      throw error;
    }
  }, [observations]);

  const updateObservation = useCallback(async (id: string, data: Partial<ObservationLog>) => {
    try {
      // API용 필드로 변환
      const apiData: Partial<ObservationRecord> = {};
      if (data.content !== undefined) apiData.observationContent = data.content;
      if (data.evaluation !== undefined) apiData.observationEvaluation = data.evaluation;
      if (data.date !== undefined) apiData.date = data.date;

      await observationAPI.update(id, apiData);
      
      // 상태 업데이트
      setObservations((prev) => 
        prev.map((o) => (o.id === id ? { ...o, ...data } : o))
      );
    } catch (error) {
      console.error("Failed to update observation", error);
      throw error;
    }
  }, []);

  const generateAIObservation = useCallback(
    async (childId: string, memo: string, category: string): Promise<ObservationLog> => {
      const child = childrenData.find((c) => c.id === childId);
      
      const res = await observationAPI.generateDraft({
        childName: child?.name || '아이',
        memo,
        category
      });

      const observation: ObservationLog = {
        id: `temp-${Date.now()}`,
        childId,
        childName: child?.name ?? '아이',
        date: formatDateISO(),
        categories: [
          {
            name: category,
            analysis: `${category} 영역의 관찰 기록입니다.`,
          },
        ],
        content: res.observationContent,
        evaluation: res.observationEvaluation,
        rawMemo: memo, // 저장 시 필요
        isAIGenerated: true,
      };
      return observation;
    },
    [childrenData],
  );

  const generateMonthlyReport = useCallback(
    async (childId: string, month: string): Promise<MonthlyReport> => {
      await new Promise((r) => setTimeout(r, 2000));
      const child = childrenData.find((c) => c.id === childId);
      const domains: NuriDomain[] = ['신체운동·건강', '의사소통', '사회관계', '예술경험', '자연탐구'];
      const details: Record<string, DomainDetail> = {};

      domains.forEach(d => {
        details[d] = {
          content: `${d} 영역에서의 한 달간 주요 활동 내용입니다.`,
          evaluation: `${d} 영역에 대한 종합적인 발달 평가 및 향후 지도 계획입니다.`
        };
      });
      
      const report: MonthlyReport = {
        id: `mr-${Date.now()}`,
        childId,
        childName: child?.name ?? '아이',
        reportMonth: month,
        details,
        isSaved: false,
      };
      return report;
    },
    [childrenData]
  );
  
  const saveMonthlyReport = useCallback(async (report: MonthlyReport) => {
    try {
      const res = await monthlyReportAPI.save(report);
      if (res.success && res.id) {
        const now = new Date().toISOString();
        const savedReport: MonthlyReport = {
          ...report,
          id: res.id,
          isSaved: true,
          createdAt: res.createdAt || report.createdAt || now,
          updatedAt: res.updatedAt || now
        };
        setMonthlyReports((prev) => {
          // 기존 id 일치 또는 같은 childId+reportMonth 가 있으면 교체 (Upsert 대응)
          const filtered = prev.filter(
            r => r.id !== report.id && r.id !== res.id &&
                 !(r.childId === report.childId && r.reportMonth === report.reportMonth)
          );
          return [...filtered, savedReport];
        });
      }
    } catch (error) {
      console.error("Failed to save monthly report", error);
    }
  }, []);

  const deleteMonthlyReport = useCallback(async (reportId: string) => {
    try {
      if (!reportId.startsWith('rep-') && !reportId.startsWith('mr-')) {
        await monthlyReportAPI.delete(reportId);
      }
      setMonthlyReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (error) {
      console.error("Failed to delete monthly report", error);
    }
  }, []);

  const fetchMonthlyReports = useCallback(async (childId: string) => {
    try {
      const res = await monthlyReportAPI.getByChild(childId);
      if (res.success && res.reports) {
        // 백엔드 데이터를 프론트엔드 형식으로 매핑 (isSaved: true 추가)
        const mappedReports: MonthlyReport[] = res.reports.map(r => ({
          ...r,
          isSaved: true
        }));
        setMonthlyReports(mappedReports);
      }
    } catch (error) {
      console.error("Failed to fetch monthly reports", error);
    }
  }, []);

  const sendMonthlyReportToParent = useCallback(async (report: MonthlyReport) => {
    try {
      // 1. 보고서 데이터 상태 업데이트 (공식적으로 부모에게 노출되도록 설정)
      const res = await monthlyReportAPI.save({ ...report, isSent: true });
      if (!res.success) throw new Error('보고서 상태 업데이트에 실패했습니다.');


      // 3. 로컬 상태 업데이트
      setMonthlyReports(prev => prev.map(r => r.id === report.id || (res.id && r.id === res.id) ? { ...r, isSent: true, isSaved: true } : r));

      alert('부모님께 평가서 전송이 완료되었습니다.');
    } catch (error) {
      console.error("Failed to send report to parent", error);
      alert('전송 중 오류가 발생했습니다.');
    }
  }, []);

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

  // 대시보드 통계 계산 (derived state)
  const stats = useMemo<DashboardStats>(() => {
    const today = formatDateISO();
    
    // 알림장 완료 (개인 유형, 오늘 날짜, 발송 완료)
    const noticeCompleted = notices.filter(
      (n) => n.type === 'individual' && n.date === today && n.isSent
    ).length;

    // 관찰일지 완료 (오늘 작성된 건의 유니크한 아이 수)
    const todayObsChildIds = new Set(
      observations
        .filter((o) => o.date === today)
        .map((o) => o.childId)
    );
    const observationCompleted = todayObsChildIds.size;

    // 투약 의뢰 및 알레르기 수
    const medicationRequests = childrenData.filter(
      (c) => c.medicationRequest && c.medicationRequest.trim() !== ''
    ).length;
    const allergyCount = childrenData.filter(
      (c) => c.allergies && c.allergies.length > 0
    ).length;

    // 출석 (임시로 기존 Mock 방식 유지하되, attendance에 데이터가 있으면 반영)
    const activeAttendance = attendance.filter(a => a.date === today);
    const presentCount = activeAttendance.filter(a => a.status === 'present').length || MOCK_DASHBOARD_STATS.presentCount;
    const absentCount = activeAttendance.filter(a => a.status === 'absent').length || MOCK_DASHBOARD_STATS.absentCount;

    return {
      totalChildren: childrenData.length,
      presentCount,
      absentCount,
      noticeCompleted,
      noticeTotal: childrenData.length,
      observationCompleted,
      observationTotal: childrenData.length,
      medicationRequests,
      allergyCount,
    };
  }, [childrenData, notices, observations, attendance]);

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
        monthlyReports,
        markAttendance,
        addNotice,
        generateAINotice,
        generateAICommonNotice,
        generateBatchNotices,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        addObservation,
        deleteObservation,
        updateObservation,
        generateAIObservation,
        generateMonthlyReport,
        saveMonthlyReport,
        deleteMonthlyReport,
        fetchMonthlyReports,
        sendMonthlyReportToParent,
        saveMonthlyReportLocal: (report: MonthlyReport) => {
          setMonthlyReports(prev => [report, ...prev]);
        },
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