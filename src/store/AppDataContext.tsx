/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
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
} from '../types';
import {
  MOCK_CHILDREN,
  MOCK_ATTENDANCE,
  MOCK_SCHEDULES,
  MOCK_NOTICES,
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
  monthlyReports: MonthlyReport[];

  // Actions
  markAttendance: (childId: string, status: AttendanceRecord['status']) => void;
  addNotice: (notice: Notice) => void;
  generateAINotice: (
    childId: string,
    memo: string,
    lengthOption: 'short' | 'long',
    summaryContext: string
  ) => Promise<Notice>;
  generateBatchNotices: (
    childIds: string[],
    memo: string,
    lengthOption: 'short' | 'long',
    summaryContext: string
  ) => Promise<Notice[]>;
  addObservation: (observation: ObservationLog) => void;
  generateAIObservation: (childId: string, memo: string, photoFile?: File) => Promise<ObservationLog>;
  generateMonthlyReport: (childId: string, month: string) => Promise<MonthlyReport>;
  saveMonthlyReport: (report: MonthlyReport) => void;
  deleteMonthlyReport: (reportId: string) => void;
  toggleScheduleComplete: (scheduleId: string) => void;
}

const AppDataContext = createContext<AppDataContextType | null>(null);

// AI 알림장 생성 프롬프트 (mock)
function generateNoticeContent(
  childName: string,
  memo: string,
  lengthOption: 'short' | 'long',
  summaryContext: string
): string {
  const intro = `${childName} 어머님, 아버님 안녕하세요! 😊\n`;
  const summaryPart = summaryContext ? `오늘 저희 반에서는 ${summaryContext}\n\n` : '';
  
  let body = '';
  if (memo) {
    if (lengthOption === 'short') {
      body = `오늘 ${childName}이는 ${memo}\n`;
    } else {
      body = `오늘 특별히 ${childName}이에 대해 말씀드리고 싶은 내용이 있어요. ${memo} 이러한 모습들을 통해 우리 ${childName}이가 한 뼘 더 성장해가고 있음을 느낍니다.\n`;
    }
  } else {
    body = `오늘 ${childName}이는 친구들과 함께 하루를 잘 보냈습니다.\n`;
  }

  const outro = `\n항상 믿고 맡겨주셔서 감사합니다. 내일도 건강하고 밝은 모습으로 만나겠습니다!`;
  
  return intro + summaryPart + body + outro;
}

export function AppDataProvider({ children: childrenProp }: { children: ReactNode }) {
  const [childrenData] = useState<Child[]>(MOCK_CHILDREN);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
  const [schedules, setSchedules] = useState<ScheduleItem[]>(MOCK_SCHEDULES);
  const [notices, setNotices] = useState<Notice[]>(MOCK_NOTICES);
  const [observations, setObservations] = useState<ObservationLog[]>(MOCK_OBSERVATIONS);
  const [stats, setStats] = useState<DashboardStats>(MOCK_DASHBOARD_STATS);
  const [activities] = useState<ActivityTimeline[]>(MOCK_ACTIVITY_TIMELINE);
  const [meals] = useState<MealPlan[]>(MOCK_MEAL_PLANS);
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([]);

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

  const addNotice = useCallback((notice: Notice) => {
    setNotices((prev) => [notice, ...prev]);
  }, []);

  const generateAINotice = useCallback(
    async (
      childId: string,
      memo: string,
      lengthOption: 'short' | 'long',
      summaryContext: string
    ): Promise<Notice> => {
      await new Promise((r) => setTimeout(r, 1200));
      const child = childrenData.find((c) => c.id === childId);
      const content = generateNoticeContent(
        child?.name ?? '아이',
        memo,
        lengthOption,
        summaryContext
      );
      const notice: Notice = {
        id: `n-${Date.now()}`,
        type: 'individual',
        childId,
        childName: child?.name,
        title: `${new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric'})} ${child?.name} 알림장`,
        content,
        date: new Date().toISOString().split('T')[0],
        isRead: false,
        isSent: false,
      };
      return notice;
    },
    [childrenData],
  );

  const generateBatchNotices = useCallback(
    async (
      childIds: string[],
      memo: string,
      lengthOption: 'short' | 'long',
      summaryContext: string
    ): Promise<Notice[]> => {
      await new Promise((r) => setTimeout(r, 2000));
      const newNotices: Notice[] = childIds.map((childId) => {
        const child = childrenData.find((c) => c.id === childId);
        return {
          id: `n-${Date.now()}-${childId}`,
          type: 'individual' as const,
          childId,
          childName: child?.name,
          title: `${new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric'})} ${child?.name} 알림장`,
          content: generateNoticeContent(
            child?.name ?? '아이',
            memo,
            lengthOption,
            summaryContext
          ),
          date: new Date().toISOString().split('T')[0],
          isRead: false,
          isSent: false,
        };
      });
      return newNotices;
    },
    [childrenData],
  );

  const addObservation = useCallback((observation: ObservationLog) => {
    setObservations((prev) => [observation, ...prev]);
  }, []);

  const generateAIObservation = useCallback(
    async (childId: string, memo: string, photoFile?: File): Promise<ObservationLog> => {
      void photoFile;
      await new Promise((r) => setTimeout(r, 1500));
      const child = childrenData.find((c) => c.id === childId);
      
      let matchedDomain = '사회관계';
      if (memo.includes('블록') || memo.includes('그림')) matchedDomain = '예술경험';
      if (memo.includes('뛰어') || memo.includes('공')) matchedDomain = '신체운동·건강';
      if (memo.includes('벌레') || memo.includes('관찰')) matchedDomain = '자연탐구';
      if (memo.includes('말') || memo.includes('단어')) matchedDomain = '의사소통';
      
      const observation: ObservationLog = {
        id: `obs-${Date.now()}`,
        childId,
        childName: child?.name ?? '아이',
        date: new Date().toISOString().split('T')[0],
        categories: [
          {
            name: matchedDomain,
            analysis:
              `분석 결과, ${matchedDomain} 영역의 발달이 돋보입니다.`,
          },
        ],
        content: `${child?.name ?? '아이'}가 ${memo || '즐겁게 활동하는'} 모습을 관찰하였습니다.`,
        evaluation: `교사나 친구들과의 상호작용 속에서 자발적인 성장이 이루어지고 있습니다. ${matchedDomain} 영역에서의 발달이 매우 긍정적입니다.`,
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
  
  const saveMonthlyReport = useCallback((report: MonthlyReport) => {
    setMonthlyReports((prev) => {
      const existingIndex = prev.findIndex(r => r.id === report.id);
      if (existingIndex >= 0) {
        const newReports = [...prev];
        newReports[existingIndex] = { ...report, isSaved: true };
        return newReports;
      }
      return [{ ...report, isSaved: true }, ...prev];
    });
  }, []);

  const deleteMonthlyReport = useCallback((reportId: string) => {
    setMonthlyReports((prev) => prev.filter((r) => r.id !== reportId));
  }, []);

  const toggleScheduleComplete = useCallback((scheduleId: string) => {
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === scheduleId ? { ...s, isCompleted: !s.isCompleted } : s,
      ),
    );
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
        monthlyReports,
        markAttendance,
        addNotice,
        generateAINotice,
        generateBatchNotices,
        addObservation,
        generateAIObservation,
        generateMonthlyReport,
        saveMonthlyReport,
        deleteMonthlyReport,
        toggleScheduleComplete,
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
