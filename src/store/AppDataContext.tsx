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
  generateAIObservation: (childId: string, photoFile?: File) => Promise<ObservationLog>;
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
      // setNotices 제거: 개별 알림장은 확인 후 전송 버튼에서 수동 등록하도록 UX 개선
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
        markAttendance,
        addNotice,
        generateAINotice,
        generateBatchNotices,
        addObservation,
        generateAIObservation,
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
